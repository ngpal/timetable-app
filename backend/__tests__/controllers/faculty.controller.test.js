
import { jest } from '@jest/globals';

// Mocks
const mockUser = {
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
};

const mockFaculty = {
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
};

// Mock modules
jest.unstable_mockModule('../../models/user.js', () => ({ default: mockUser }));
jest.unstable_mockModule('../../models/faculty.js', () => ({ default: mockFaculty }));

// Import controller
const { getFaculty, addFaculty, updateFaculty, deleteFaculty } = await import('../../controllers/faculty.controller.js');

describe('Faculty Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {
            statusCode: 200,
            data: null,
            status: function(code) { this.statusCode = code; return this; },
            json: function(data) { this.data = data; return this; }
        };
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('addFaculty', () => {
        it('should create user and faculty successfully', async () => {
            req.body = {
                name: 'Dr. New',
                email: 'new@test.com',
                department: 'CSE',
                facultyType: 'Full-time',
                designation: 'Prof'
            };

            const mockCreatedUser = { _id: 'u1', name: 'Dr. New' };
            const mockCreatedFaculty = { _id: 'f1', userId: 'u1', name: 'Dr. New' };

            mockUser.create.mockResolvedValue(mockCreatedUser);
            mockFaculty.create.mockResolvedValue(mockCreatedFaculty);

            await addFaculty(req, res);

            expect(mockUser.create).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Dr. New',
                email: 'new@test.com',
                role: 'Faculty'
            }));
            expect(mockFaculty.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'u1',
                department: 'CSE'
            }));
            expect(res.statusCode).toBe(201);
            expect(res.data.user).toBeDefined();
            expect(res.data.faculty).toBeDefined();
        });

        it('should handle errors during creation', async () => {
            req.body = { name: 'Fail' };
            mockUser.create.mockRejectedValue(new Error('User fail'));

            await addFaculty(req, res);

            expect(res.statusCode).toBe(400);
            expect(res.data.message).toMatch(/User fail/);
        });
    });

    describe('deleteFaculty', () => {
        it('should delete both faculty and user', async () => {
            req.params.id = 'f1';
            const mockFacultyRecord = { _id: 'f1', userId: 'u1' };

            mockFaculty.findById.mockResolvedValue(mockFacultyRecord);
            mockUser.findByIdAndDelete.mockResolvedValue({});
            mockFaculty.findByIdAndDelete.mockResolvedValue({});

            await deleteFaculty(req, res);

            expect(mockUser.findByIdAndDelete).toHaveBeenCalledWith('u1');
            expect(mockFaculty.findByIdAndDelete).toHaveBeenCalledWith('f1');
            expect(res.statusCode).toBe(200);
        });
    });
});
