import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { jest } from '@jest/globals';
import { connectDB, closeDB, clearDB } from './setup.js';
import User from '../../models/user.js';
import CourseAssignment from '../../models/courseAssignment.js';
import SlotChangeRequest from '../../models/slotChangeRequest.js';
import Notification from '../../models/notification.js';

import Classroom from '../../models/classroom.js';
import Faculty from '../../models/faculty.js';

// ── App setup ─────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use(cookieParser());

let currentUser = null;
let currentFacultyId = null;

// Bypass JWT auth
jest.unstable_mockModule('../../utils/verifyUser.js', () => ({
    verifyUser: (req, res, next) => {
        if (!currentUser) return res.status(401).json("Unauthorized");
        req.user = currentUser;
        next();
    },
    verifyAdmin: (req, res, next) => {
        if (!currentUser || currentUser.role !== 'Admin') return res.status(403).json("Forbidden");
        req.user = currentUser;
        next();
    },
}));

const { default: studentRouter } = await import('../../routes/student.route.js');
const { default: slotChangeRouter } = await import('../../routes/slotChangeRequest.route.js');

app.use('/api/student', studentRouter);
app.use('/api/slot-change-requests', slotChangeRouter);

// Error middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({ success: false, statusCode, message });
});

// ── DB lifecycle ──────────────────────────────────────────────────────────────

beforeAll(async () => { await connectDB(); });
afterEach(async () => { await clearDB(); currentUser = null; currentFacultyId = null; jest.clearAllMocks(); });
afterAll(async ()  => { await closeDB(); });

// ── Fixtures ──────────────────────────────────────────────────────────────────

async function setupClassroom(roomData = {}) {
    return Classroom.create({
        roomId: 'C204',
        building: 'ABIII',
        fullRoomId: 'ABIII - C204',
        roomType: 'Classroom',
        capacity: 60,
        isAvailable: true,
        ...roomData
    });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Student & CR Integration Tests', () => {
    
    describe('GET /api/student/timetable', () => {
        it('should return timetable for a student based on their roll number (Section D)', async () => {
            // Create a student user
            const student = await User.create({
                name: 'Test Student',
                email: 'cb.en.u4cse21341@cb.students.amrita.edu', // Section D (341)
                role: 'Student'
            });
            currentUser = { id: student._id.toString(), role: student.role };

            // Create a timetable for Section D
            await CourseAssignment.create({
                academicYear: '2025-2026',
                semester: 'Odd',
                department: 'CSE',
                section: 'D',
                isActive: true,
                timetableSlots: [
                    { day: 'Monday', slotNumber: 1, courseCode: 'CS101', courseName: 'Algorithms' }
                ]
            });

            const res = await request(app).get('/api/student/timetable');
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.studentDetails.section).toBe('D');
            expect(res.body.timetable.section).toBe('D');
            expect(res.body.timetable.timetableSlots).toHaveLength(1);
        });
    });

    describe('Multi-Step Rescheduling Workflow', () => {
        it('should follow the 3-step flow: CR -> Faculty -> Admin (Auto-Classroom)', async () => {
            // 1. Setup Data
            const facUser = await User.create({ name: 'Dr. Smith', email: 'smith@amrita.edu', role: 'Faculty' });
            const faculty = await Faculty.create({ 
                userId: facUser._id, 
                name: 'Dr. Smith', 
                email: 'smith@amrita.edu', 
                department: 'CSE',
                designation: 'Assistant Professor',
                facultyType: 'Full-time'
            });
            
            const cr = await User.create({
                name: 'Test CR',
                email: 'cb.en.u4cse21341@cb.students.amrita.edu',
                role: 'Student',
                isCR: true
            });

            const assignment = await CourseAssignment.create({
                academicYear: '2025-2026', semester: 'Odd', department: 'CSE', section: 'D', isActive: true,
                courses: [{
                    courseCode: 'CS101', courseName: 'Algorithms', faculty: [{ facultyId: faculty._id, role: 'Incharge' }]
                }],
                timetableSlots: [{ day: 'Monday', slotNumber: 1, courseCode: 'CS101', courseName: 'Algorithms', facultyName: 'Dr. Smith', venue: 'OLD ROOM' }]
            });

            await setupClassroom({ fullRoomId: 'NEW ROOM 101' });

            // 2. CR Submits Request
            currentUser = { id: cr._id.toString(), role: cr.role, isCR: cr.isCR };
            const crBody = {
                courseAssignmentId: assignment._id.toString(),
                courseCode: 'CS101', courseName: 'Algorithms', facultyName: 'Dr. Smith', venue: 'OLD ROOM',
                currentDay: 'Monday', currentSlotNumber: 1,
                requestedDay: 'Tuesday', requestedSlotNumber: 3,
                reason: 'Labs busy'
            };

            const crRes = await request(app).post('/api/slot-change-requests').send(crBody);
            expect(crRes.status).toBe(201);
            expect(crRes.body.request.status).toBe('Pending_Faculty');
            expect(crRes.body.request.facultyId).toBe(faculty._id.toString());
            const requestId = crRes.body.request._id;

            // 3. Faculty Approves
            currentUser = { id: facUser._id.toString(), role: 'Faculty' };
            const facRes = await request(app)
                .patch(`/api/slot-change-requests/${requestId}/faculty-approve`)
                .send({ status: 'Approved' });
            
            expect(facRes.status).toBe(200);
            expect(facRes.body.request.status).toBe('Pending_Admin');

            // 4. Admin Approves (System auto-assigns classroom)
            currentUser = { id: new mongoose.Types.ObjectId().toString(), role: 'Admin' };
            const adminRes = await request(app)
                .patch(`/api/slot-change-requests/${requestId}/admin-approve`)
                .send({ status: 'Approved', adminNote: 'Classroom assigned automatically' });
            
            expect(adminRes.status).toBe(200);
            expect(adminRes.body.request.status).toBe('Approved');
            expect(adminRes.body.request.assignedVenue).toBe('NEW ROOM 101');
            
            // 5. Verify Timetable Update
            const updatedAssignment = await CourseAssignment.findById(assignment._id);
            const movedSlot = updatedAssignment.timetableSlots.find(s => s.courseCode === 'CS101');
            expect(movedSlot.day).toBe('Tuesday');
            expect(movedSlot.slotNumber).toBe(3);
            expect(movedSlot.venue).toBe('NEW ROOM 101');
        });

        it('should NOT allow a normal student to submit a rescheduling request', async () => {
            const student = await User.create({
                name: 'Normal Student',
                email: 'cb.en.u4cse21300@cb.students.amrita.edu',
                role: 'Student',
                isCR: false
            });
            currentUser = { id: student._id.toString(), role: student.role, isCR: student.isCR };

            const res = await request(app).post('/api/slot-change-requests').send({});
            
            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/Only Class Representatives/i);
        });
    });

    describe('GET /api/student/notifications', () => {
        it('should return notifications for the student section', async () => {
            const student = await User.create({
                name: 'Test Student',
                email: 'cb.en.u4cse21341@cb.students.amrita.edu',
                role: 'Student'
            });
            currentUser = { id: student._id.toString(), role: student.role };

            await Notification.create({
                department: 'CSE', section: 'D', message: 'Test Notif', type: 'General'
            });

            const res = await request(app).get('/api/student/notifications');
            
            expect(res.status).toBe(200);
            expect(res.body.notifications).toHaveLength(1);
            expect(res.body.notifications[0].message).toBe('Test Notif');
        });
    });
});
