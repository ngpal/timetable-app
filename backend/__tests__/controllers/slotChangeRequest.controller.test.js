import { jest } from '@jest/globals';
import mongoose from 'mongoose';

// Mock models and services
const mockRequestSave = jest.fn();
const mockAssignmentSave = jest.fn();
const mockAssignmentMarkModified = jest.fn();

const MockSlotChangeRequest = jest.fn().mockImplementation((data) => ({
    ...data,
    save: mockRequestSave,
    _id: new mongoose.Types.ObjectId(),
}));
MockSlotChangeRequest.findById = jest.fn();
MockSlotChangeRequest.find = jest.fn();

const MockCourseAssignment = {
    findById: jest.fn(),
};

const mockValidateConstraints = jest.fn();

// Use unstable_mockModule for ESM mocking
jest.unstable_mockModule('../../models/slotChangeRequest.js', () => ({
    default: MockSlotChangeRequest
}));
jest.unstable_mockModule('../../models/courseAssignment.js', () => ({
    default: MockCourseAssignment
}));
jest.unstable_mockModule('../../services/constraintValidator.js', () => ({
    validateSlotChangeConstraints: mockValidateConstraints
}));

const { createRequest, getAllRequests, approveOrRejectRequest } = await import('../../controllers/slotChangeRequest.controller.js');

describe('SlotChangeRequest Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, params: {}, query: {}, user: { id: 'user123' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('createRequest', () => {
        it('should return 400 if required fields are missing', async () => {
            req.body = { courseCode: 'CS101' };
            await createRequest(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });

        it('should return 404 if CourseAssignment not found', async () => {
            req.body = {
                courseAssignmentId: new mongoose.Types.ObjectId(),
                courseCode: 'CS101', facultyName: 'Dr. Smith', venue: 'R1',
                currentDay: 'Monday', currentSlotNumber: 1,
                requestedDay: 'Tuesday', requestedSlotNumber: 2
            };
            MockCourseAssignment.findById.mockResolvedValue(null);
            await createRequest(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
        });

        it('should create a request successfully', async () => {
            const aid = new mongoose.Types.ObjectId();
            req.body = {
                courseAssignmentId: aid,
                courseCode: 'CS101', courseName: 'Algo', facultyName: 'Dr. Smith', venue: 'R1',
                currentDay: 'Monday', currentSlotNumber: 1,
                requestedDay: 'Tuesday', requestedSlotNumber: 2,
                reason: 'Need swap'
            };
            MockCourseAssignment.findById.mockResolvedValue({
                _id: aid,
                timetableSlots: [{ day: 'Monday', slotNumber: 1 }]
            });
            mockRequestSave.mockResolvedValue({ ...req.body, status: 'Pending' });

            await createRequest(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(mockRequestSave).toHaveBeenCalled();
        });
    });

    describe('approveOrRejectRequest', () => {
        it('should return 404 if request not found', async () => {
            req.params.id = new mongoose.Types.ObjectId();
            req.body.status = 'Approved';
            MockSlotChangeRequest.findById.mockResolvedValue(null);
            await approveOrRejectRequest(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
        });

        it('should reject successfully', async () => {
            const rid = new mongoose.Types.ObjectId();
            const mockReq = { 
                _id: rid, status: 'Pending', 
                save: mockRequestSave 
            };
            MockSlotChangeRequest.findById.mockResolvedValue(mockReq);
            req.params.id = rid;
            req.body.status = 'Rejected';
            req.body.adminNote = 'No room';

            await approveOrRejectRequest(req, res, next);
            expect(mockReq.status).toBe('Rejected');
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 409 if constraints fail on approval', async () => {
            const rid = new mongoose.Types.ObjectId();
            const mockReq = { _id: rid, status: 'Pending', save: mockRequestSave };
            MockSlotChangeRequest.findById.mockResolvedValue(mockReq);
            mockValidateConstraints.mockResolvedValue({ 
                valid: false, 
                conflicts: [{ type: 'ROOM_CONFLICT', message: 'Busy' }] 
            });

            req.params.id = rid;
            req.body.status = 'Approved';

            await approveOrRejectRequest(req, res, next);
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('Constraint violation')
            }));
        });

        it('should approve and update slot if valid', async () => {
            const aid = new mongoose.Types.ObjectId();
            const rid = new mongoose.Types.ObjectId();
            const mockReq = { 
                _id: rid, courseAssignmentId: aid, 
                status: 'Pending', save: mockRequestSave,
                currentDay: 'Mon', currentSlotNumber: 1,
                requestedDay: 'Tue', requestedSlotNumber: 2
            };
            const mockAssignment = {
                _id: aid,
                timetableSlots: [{ day: 'Mon', slotNumber: 1 }],
                save: mockAssignmentSave,
                markModified: mockAssignmentMarkModified
            };

            MockSlotChangeRequest.findById.mockResolvedValue(mockReq);
            mockValidateConstraints.mockResolvedValue({ valid: true });
            MockCourseAssignment.findById.mockResolvedValue(mockAssignment);

            req.params.id = rid;
            req.body.status = 'Approved';

            await approveOrRejectRequest(req, res, next);

            expect(mockAssignment.timetableSlots[0].day).toBe('Tue');
            expect(mockAssignment.timetableSlots[0].slotNumber).toBe(2);
            expect(mockAssignmentMarkModified).toHaveBeenCalledWith('timetableSlots');
            expect(mockAssignmentSave).toHaveBeenCalled();
            expect(mockReq.status).toBe('Approved');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
