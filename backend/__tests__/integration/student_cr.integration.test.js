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

// ── App setup ─────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use(cookieParser());

let currentUser = null;

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
afterEach(async () => { await clearDB(); currentUser = null; jest.clearAllMocks(); });
afterAll(async ()  => { await closeDB(); });

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

    describe('CR Rescheduling Workflow', () => {
        it('should allow a CR student to submit a rescheduling request', async () => {
            const cr = await User.create({
                name: 'Test CR',
                email: 'cb.en.u4cse21341@cb.students.amrita.edu',
                role: 'Student',
                isCR: true
            });
            currentUser = { id: cr._id.toString(), role: cr.role, isCR: cr.isCR };

            const assignment = await CourseAssignment.create({
                academicYear: '2025-2026', semester: 'Odd', department: 'CSE', section: 'D', isActive: true,
                timetableSlots: [{ day: 'Monday', slotNumber: 1, courseCode: 'CS101', courseName: 'Algorithms', facultyName: 'Dr. Smith', venue: 'R1' }]
            });

            const body = {
                courseAssignmentId: assignment._id.toString(),
                courseCode: 'CS101', courseName: 'Algorithms', facultyName: 'Dr. Smith', venue: 'R1',
                currentDay: 'Monday', currentSlotNumber: 1,
                requestedDay: 'Tuesday', requestedSlotNumber: 3,
                reason: 'Labs busy'
            };

            const res = await request(app).post('/api/slot-change-requests').send(body);
            
            expect(res.status).toBe(201);
            expect(res.body.request.status).toBe('Pending');
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

        it('should create a notification for students when a request is approved', async () => {
            // Setup: Admin to approve
            currentUser = { id: new mongoose.Types.ObjectId().toString(), role: 'Admin' };

            const assignment = await CourseAssignment.create({
                academicYear: '2025-2026', semester: 'Odd', department: 'CSE', section: 'D', isActive: true,
                timetableSlots: [{ day: 'Monday', slotNumber: 1, courseCode: 'CS101', courseName: 'Algorithms', facultyName: 'Dr. Smith', venue: 'R1' }]
            });

            const changeReq = await SlotChangeRequest.create({
                courseAssignmentId: assignment._id, requestedBy: new mongoose.Types.ObjectId(),
                courseCode: 'CS101', courseName: 'Algorithms', facultyName: 'Dr. Smith', venue: 'R1',
                currentDay: 'Monday', currentSlotNumber: 1,
                requestedDay: 'Tuesday', requestedSlotNumber: 3, status: 'Pending'
            });

            const res = await request(app)
                .patch(`/api/slot-change-requests/${changeReq._id}/status`)
                .send({ status: 'Approved', adminNote: 'Done' });

            expect(res.status).toBe(200);

            // Verify notification created
            const notification = await Notification.findOne({ department: 'CSE', section: 'D' });
            expect(notification).not.toBeNull();
            expect(notification.message).toMatch(/Timetable Update/);
            expect(notification.type).toBe('Reschedule');
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
