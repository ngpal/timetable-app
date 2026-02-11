
import { jest } from '@jest/globals';

const mockClassroom = {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
};

jest.unstable_mockModule('../../models/classroom.js', () => ({ default: mockClassroom }));

const { getClassrooms, addClassroom, updateClassroom, deleteClassroom } = await import('../../controllers/classroom.controller.js');

describe('Classroom Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {
            statusCode: 200,
            json: jest.fn().mockReturnThis(),
            status: function(code) { this.statusCode = code; return this; }
        };
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('addClassroom', () => {
        it('should create classroom with auto-generated fullRoomId', async () => {
            req.body = {
                roomId: '101',
                building: 'Main',
                floor: '1st',
                capacity: 50
            };

            mockClassroom.create.mockImplementation((data) => Promise.resolve({ _id: 'r1', ...data }));

            await addClassroom(req, res);

            expect(mockClassroom.create).toHaveBeenCalledWith(expect.objectContaining({
                fullRoomId: expect.stringContaining('Main - 1st 101'),
                roomId: '101'
            }));
            expect(res.statusCode).toBe(201);
        });
    });

    describe('updateClassroom', () => {
        it('should update classroom details', async () => {
            req.params.id = 'r1';
            req.body = { roomId: '102', building: 'Main' };
            
            mockClassroom.findByIdAndUpdate.mockResolvedValue({ _id: 'r1', roomId: '102' });

            await updateClassroom(req, res);

            expect(mockClassroom.findByIdAndUpdate).toHaveBeenCalled();
            expect(res.statusCode).toBe(200);
        });
    });

    describe('deleteClassroom', () => {
        it('should delete classroom', async () => {
            req.params.id = 'r1';
            mockClassroom.findByIdAndDelete.mockResolvedValue({});

            await deleteClassroom(req, res);

            expect(mockClassroom.findByIdAndDelete).toHaveBeenCalledWith('r1');
            expect(res.statusCode).toBe(200);
        });
    });
});
