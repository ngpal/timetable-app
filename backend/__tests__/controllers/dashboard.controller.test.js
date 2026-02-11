
import { jest } from '@jest/globals';

const mockFaculty = { countDocuments: jest.fn() };
const mockCourse = { countDocuments: jest.fn() };
const mockClassroom = { countDocuments: jest.fn() };

jest.unstable_mockModule('../../models/faculty.js', () => ({ default: mockFaculty }));
jest.unstable_mockModule('../../models/course.js', () => ({ default: mockCourse }));
jest.unstable_mockModule('../../models/classroom.js', () => ({ default: mockClassroom }));

const { getDashboardStats } = await import('../../controllers/dashboard.controller.js');

describe('Dashboard Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            statusCode: 200,
            json: jest.fn().mockReturnThis(),
            status: function(code) { this.statusCode = code; return this; }
        };
        jest.clearAllMocks();
    });

    describe('getDashboardStats', () => {
        it('should return correct counts', async () => {
            mockFaculty.countDocuments.mockResolvedValue(10);
            mockCourse.countDocuments.mockResolvedValue(20);
            mockClassroom.countDocuments.mockResolvedValue(5);

            await getDashboardStats(req, res);

            expect(mockFaculty.countDocuments).toHaveBeenCalled();
            expect(mockCourse.countDocuments).toHaveBeenCalled();
            expect(mockClassroom.countDocuments).toHaveBeenCalled();
            
            expect(res.statusCode).toBe(200);
            expect(res.json).toHaveBeenCalledWith({
                facultyCount: 10,
                courseCount: 20,
                roomCount: 5
            });
        });

        it('should handle errors', async () => {
            mockFaculty.countDocuments.mockRejectedValue(new Error('DB Error'));

            await getDashboardStats(req, res);

            expect(res.statusCode).toBe(500);
        });
    });
});
