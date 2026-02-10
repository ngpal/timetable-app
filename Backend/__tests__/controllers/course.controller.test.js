
import { jest } from '@jest/globals';

// Mock Module
const mockCourse = {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
};

jest.unstable_mockModule('../../models/course.js', () => ({ default: mockCourse }));

// Import Controller
const { getCourses, addCourse, updateCourse, deleteCourse } = await import('../../controllers/course.controller.js');

describe('Course Controller', () => {
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

    describe('addCourse', () => {
        it('should create a course successfully', async () => {
            req.body = {
                courseCode: 'CS101',
                courseName: 'Intro',
                department: 'CSE'
            };
            mockCourse.create.mockResolvedValue({ _id: 'c1', ...req.body });

            await addCourse(req, res);

            expect(mockCourse.create).toHaveBeenCalled();
            expect(res.statusCode).toBe(201);
        });

        it('should handle creation errors', async () => {
            req.body = {};
            mockCourse.create.mockRejectedValue(new Error('Required fields missing'));

            await addCourse(req, res);

            expect(res.statusCode).toBe(400);
        });
    });

    describe('updateCourse', () => {
        it('should update course if found', async () => {
            req.params.id = 'c1';
            req.body = { courseName: 'Updated' };
            
            mockCourse.findByIdAndUpdate.mockResolvedValue({ _id: 'c1', courseName: 'Updated' });

            await updateCourse(req, res);

            expect(mockCourse.findByIdAndUpdate).toHaveBeenCalledWith('c1', expect.objectContaining({ courseName: 'Updated' }), { new: true });
            expect(res.statusCode).toBe(200);
        });

        it('should return 404 if course not found', async () => {
            req.params.id = 'c1';
            mockCourse.findByIdAndUpdate.mockResolvedValue(null);

            await updateCourse(req, res);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('deleteCourse', () => {
        it('should delete course', async () => {
            req.params.id = 'c1';
            mockCourse.findByIdAndDelete.mockResolvedValue({});

            await deleteCourse(req, res);

            expect(mockCourse.findByIdAndDelete).toHaveBeenCalledWith('c1');
            expect(res.statusCode).toBe(200);
        });
    });
});
