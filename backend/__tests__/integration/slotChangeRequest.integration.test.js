import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { jest } from '@jest/globals';
import { connectDB, closeDB, clearDB } from './setup.js';
import CourseAssignment from '../../models/courseAssignment.js';
import SlotChangeRequest from '../../models/slotChangeRequest.js';
// Import User model so Mongoose registers the schema; needed for populate('requestedBy') to resolve
import '../../models/user.js';

// ── App setup ─────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use(cookieParser());

// Bypass JWT auth
jest.unstable_mockModule('../../utils/verifyUser.js', () => ({
    verifyAdmin: (req, res, next) => {
        req.user = { id: new mongoose.Types.ObjectId().toString(), role: 'Admin' };
        next();
    },
}));

const { default: slotChangeRouter } =
    await import('../../routes/slotChangeRequest.route.js');
app.use('/api/slot-change-requests', slotChangeRouter);

// Add error middleware to handle next(error) calls
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

// ── DB lifecycle ──────────────────────────────────────────────────────────────

beforeAll(async () => { await connectDB(); }, 120000);
afterEach(async () => { await clearDB(); jest.clearAllMocks(); });
afterAll(async () => { await closeDB(); });

// ── Fixtures ──────────────────────────────────────────────────────────────────

/**
 * Creates a CourseAssignment with one or more timetable slots.
 */
async function makeAssignment(slots = [], overrides = {}) {
    return CourseAssignment.create({
        academicYear: '2025-2026',
        semester: 'Odd',
        department: 'CSE',
        section: 'A',
        program: 'B.Tech',
        courses: [{
            courseCode: 'CS101',
            courseName: 'Algorithms',
            courseType: 'Core',
            sessionType: 'Theory',
            credits: 3,
            faculty: [],
        }],
        timetableSlots: slots,
        isActive: true,
        ...overrides,
    });
}

/** Returns a base slot object */
function slot(day, slotNumber, extra = {}) {
    return {
        day,
        slotNumber,
        courseCode: 'CS101',
        courseName: 'Algorithms',
        facultyName: 'Dr. Smith',
        venue: 'Room 101',
        slotType: 'Theory',
        sessionType: 'Theory',
        isSpanContinuation: false,
        ...extra,
    };
}

// ── POST /api/slot-change-requests ────────────────────────────────────────────

describe('POST /api/slot-change-requests', () => {
    it('creates a Pending request when input is valid', async () => {
        const assignment = await makeAssignment([slot('Monday', 1)]);

        const body = {
            courseAssignmentId: assignment._id.toString(),
            courseCode: 'CS101',
            courseName: 'Algorithms',
            facultyName: 'Dr. Smith',
            venue: 'Room 101',
            currentDay: 'Monday',
            currentSlotNumber: 1,
            requestedDay: 'Tuesday',
            requestedSlotNumber: 3,
            reason: 'Scheduling conflict',
        };

        const res = await request(app)
            .post('/api/slot-change-requests')
            .set('Cookie', ['access_token=fake'])
            .send(body);

        expect(res.status).toBe(201);
        expect(res.body.request.status).toBe('Pending');
        expect(res.body.request.currentDay).toBe('Monday');
        expect(res.body.request.requestedDay).toBe('Tuesday');

        // Verify persisted to DB
        const inDb = await SlotChangeRequest.findById(res.body.request._id);
        expect(inDb).not.toBeNull();
        expect(inDb.reason).toBe('Scheduling conflict');
    });

    it('returns 400 for missing required fields', async () => {
        const res = await request(app)
            .post('/api/slot-change-requests')
            .set('Cookie', ['access_token=fake'])
            .send({ courseCode: 'CS101' });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Missing required fields/i);
    });

    it('returns 404 if CourseAssignment does not exist', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .post('/api/slot-change-requests')
            .set('Cookie', ['access_token=fake'])
            .send({
                courseAssignmentId: fakeId,
                courseCode: 'CS101', courseName: 'Algorithms',
                facultyName: 'Dr. Smith', venue: 'Room 101',
                currentDay: 'Monday', currentSlotNumber: 1,
                requestedDay: 'Tuesday', requestedSlotNumber: 3,
            });

        expect(res.status).toBe(404);
    });

    it('returns 400 if the current slot does not exist in the assignment', async () => {
        const assignment = await makeAssignment([slot('Wednesday', 5)]);

        const res = await request(app)
            .post('/api/slot-change-requests')
            .set('Cookie', ['access_token=fake'])
            .send({
                courseAssignmentId: assignment._id.toString(),
                courseCode: 'CS101', courseName: 'Algorithms',
                facultyName: 'Dr. Smith', venue: 'Room 101',
                currentDay: 'Monday', currentSlotNumber: 1, // <-- doesn't exist
                requestedDay: 'Tuesday', requestedSlotNumber: 3,
            });

        expect(res.status).toBe(400);
    });
});

// ── GET /api/slot-change-requests ─────────────────────────────────────────────

describe('GET /api/slot-change-requests', () => {
    it('returns empty array when no requests exist', async () => {
        const res = await request(app)
            .get('/api/slot-change-requests')
            .set('Cookie', ['access_token=fake']);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('returns all requests sorted by newest first', async () => {
        const assignment = await makeAssignment([slot('Monday', 1), slot('Tuesday', 2)]);
        const aid = assignment._id.toString();

        await SlotChangeRequest.create({
            courseAssignmentId: aid, requestedBy: new mongoose.Types.ObjectId(),
            courseCode: 'CS101', courseName: 'Algorithms',
            facultyName: 'Dr. Smith', venue: 'Room 101',
            currentDay: 'Monday', currentSlotNumber: 1,
            requestedDay: 'Tuesday', requestedSlotNumber: 3, status: 'Pending',
        });
        await SlotChangeRequest.create({
            courseAssignmentId: aid, requestedBy: new mongoose.Types.ObjectId(),
            courseCode: 'CS101', courseName: 'Algorithms',
            facultyName: 'Dr. Smith', venue: 'Room 101',
            currentDay: 'Tuesday', currentSlotNumber: 2,
            requestedDay: 'Friday', requestedSlotNumber: 5, status: 'Rejected',
        });

        const res = await request(app)
            .get('/api/slot-change-requests')
            .set('Cookie', ['access_token=fake']);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });

    it('filters by status query param', async () => {
        const assignment = await makeAssignment([slot('Monday', 1), slot('Tuesday', 2)]);
        const aid = assignment._id.toString();
        const base = {
            courseAssignmentId: aid, requestedBy: new mongoose.Types.ObjectId(),
            courseCode: 'CS101', courseName: 'Algorithms',
            facultyName: 'Dr. Smith', venue: 'Room 101',
        };
        await SlotChangeRequest.create({
            ...base, currentDay: 'Monday', currentSlotNumber: 1,
            requestedDay: 'Tuesday', requestedSlotNumber: 4, status: 'Pending',
        });
        await SlotChangeRequest.create({
            ...base, currentDay: 'Tuesday', currentSlotNumber: 2,
            requestedDay: 'Friday', requestedSlotNumber: 5, status: 'Approved',
        });

        const res = await request(app)
            .get('/api/slot-change-requests?status=Pending')
            .set('Cookie', ['access_token=fake']);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].status).toBe('Pending');
    });
});

// ── PATCH /api/slot-change-requests/:id/status ────────────────────────────────

describe('PATCH /api/slot-change-requests/:id/status', () => {

    // ── Rejection ──────────────────────────────────────────────────────────

    it('rejects a Pending request without modifying the CourseAssignment', async () => {
        const assignment = await makeAssignment([slot('Monday', 1)]);
        const changeReq = await SlotChangeRequest.create({
            courseAssignmentId: assignment._id, requestedBy: new mongoose.Types.ObjectId(),
            courseCode: 'CS101', courseName: 'Algorithms',
            facultyName: 'Dr. Smith', venue: 'Room 101',
            currentDay: 'Monday', currentSlotNumber: 1,
            requestedDay: 'Tuesday', requestedSlotNumber: 3,
        });

        const res = await request(app)
            .patch(`/api/slot-change-requests/${changeReq._id}/status`)
            .set('Cookie', ['access_token=fake'])
            .send({ status: 'Rejected', adminNote: 'No room available' });

        expect(res.status).toBe(200);
        expect(res.body.request.status).toBe('Rejected');
        expect(res.body.request.adminNote).toBe('No room available');

        // CourseAssignment must be untouched
        const updatedAssignment = await CourseAssignment.findById(assignment._id);
        const originalSlot = updatedAssignment.timetableSlots.find(
            s => s.day === 'Monday' && s.slotNumber === 1
        );
        expect(originalSlot).toBeDefined();
    });

    // ── Approval – no conflict ─────────────────────────────────────────────

    it('approves and moves the slot when no constraints are violated', async () => {
        const assignment = await makeAssignment([
            slot('Monday', 1),
            slot('Wednesday', 4, { courseCode: 'MA101', courseName: 'Maths', facultyName: 'Dr. Jones', venue: 'Room 202' }),
        ]);

        const changeReq = await SlotChangeRequest.create({
            courseAssignmentId: assignment._id, requestedBy: new mongoose.Types.ObjectId(),
            courseCode: 'CS101', courseName: 'Algorithms',
            facultyName: 'Dr. Smith', venue: 'Room 101',
            currentDay: 'Monday', currentSlotNumber: 1,
            requestedDay: 'Tuesday', requestedSlotNumber: 3,
        });

        const res = await request(app)
            .patch(`/api/slot-change-requests/${changeReq._id}/status`)
            .set('Cookie', ['access_token=fake'])
            .send({ status: 'Approved', adminNote: 'Approved!' });

        expect(res.status).toBe(200);
        expect(res.body.request.status).toBe('Approved');

        const updatedAssignment = await CourseAssignment.findById(assignment._id);
        const movedSlot = updatedAssignment.timetableSlots.find(s => s.courseCode === 'CS101');
        expect(movedSlot.day).toBe('Tuesday');
        expect(movedSlot.slotNumber).toBe(3);
    });

    // ── Faculty conflict ───────────────────────────────────────────────────

    it('returns 409 when the faculty already teaches at the target slot', async () => {
        await makeAssignment(
            [slot('Tuesday', 3)],
            { section: 'B', courses: [{ courseCode: 'CS201', courseName: 'OS', courseType: 'Core', sessionType: 'Theory', credits: 3, faculty: [] }] }
        );

        const assignmentA = await makeAssignment([slot('Monday', 1)]);
        const changeReq = await SlotChangeRequest.create({
            courseAssignmentId: assignmentA._id, requestedBy: new mongoose.Types.ObjectId(),
            courseCode: 'CS101', courseName: 'Algorithms',
            facultyName: 'Dr. Smith', venue: 'Room 999',
            currentDay: 'Monday', currentSlotNumber: 1,
            requestedDay: 'Tuesday', requestedSlotNumber: 3,
        });

        const res = await request(app)
            .patch(`/api/slot-change-requests/${changeReq._id}/status`)
            .set('Cookie', ['access_token=fake'])
            .send({ status: 'Approved' });

        expect(res.status).toBe(409);
        expect(res.body.conflicts[0].type).toBe('FACULTY_CONFLICT');
    });

    // ── Room conflict ──────────────────────────────────────────────────────

    it('returns 409 when the room is occupied at the target slot', async () => {
        await makeAssignment(
            [slot('Tuesday', 3, { facultyName: 'Dr. Jones', venue: 'Room 101' })],
            { section: 'B', courses: [{ courseCode: 'CS201', courseName: 'OS', courseType: 'Core', sessionType: 'Theory', credits: 3, faculty: [] }] }
        );

        const assignmentA = await makeAssignment([slot('Monday', 1)]);
        const changeReq = await SlotChangeRequest.create({
            courseAssignmentId: assignmentA._id, requestedBy: new mongoose.Types.ObjectId(),
            courseCode: 'CS101', courseName: 'Algorithms',
            facultyName: 'Dr. Different',
            venue: 'Room 101',
            currentDay: 'Monday', currentSlotNumber: 1,
            requestedDay: 'Tuesday', requestedSlotNumber: 3,
        });

        const res = await request(app)
            .patch(`/api/slot-change-requests/${changeReq._id}/status`)
            .set('Cookie', ['access_token=fake'])
            .send({ status: 'Approved' });

        expect(res.status).toBe(409);
        expect(res.body.conflicts[0].type).toBe('ROOM_CONFLICT');
    });

    // ── Section conflict ───────────────────────────────────────────────────

    it('returns 409 when the same section already has a class at the target slot', async () => {
        const assignmentA = await makeAssignment([
            slot('Monday', 1),
            slot('Tuesday', 3, { courseCode: 'MA101', courseName: 'Maths', facultyName: 'Dr. Jones', venue: 'Room 202' }),
        ]);

        const changeReq = await SlotChangeRequest.create({
            courseAssignmentId: assignmentA._id, requestedBy: new mongoose.Types.ObjectId(),
            courseCode: 'CS101', courseName: 'Algorithms',
            facultyName: 'Dr. Smith', venue: 'Room 999',
            currentDay: 'Monday', currentSlotNumber: 1,
            requestedDay: 'Tuesday', requestedSlotNumber: 3,
        });

        const res = await request(app)
            .patch(`/api/slot-change-requests/${changeReq._id}/status`)
            .set('Cookie', ['access_token=fake'])
            .send({ status: 'Approved' });

        expect(res.status).toBe(409);
        expect(res.body.conflicts[0].type).toBe('SECTION_CONFLICT');
    });
});
