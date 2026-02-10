
import { jest } from '@jest/globals';

// Define mocks before importing the module under test
// Use unstable_mockModule for ESM support if needed, but strict jest.mock might fail with ESM top-level
// For now, let's try a different approach:
// We will mock the dependencies using jest.unstable_mockModule which is required for ESM

const mockCourseAssignment = {
    findById: jest.fn()
};
const mockFaculty = {
    find: jest.fn()
};

jest.unstable_mockModule('../../models/courseAssignment.js', () => ({
    default: mockCourseAssignment
}));
jest.unstable_mockModule('../../models/faculty.js', () => ({
    default: mockFaculty
}));
jest.unstable_mockModule('../../services/constraintValidator.js', () => ({
    validateHardConstraints: jest.fn(() => []),
    calculateSoftConstraintScore: jest.fn(() => ({ totalScore: 100, breakdown: {} }))
}));

// Mock dynamic imports
// The controller uses `await import(...)`. 
// We can mock the modules they point to. 
jest.unstable_mockModule('../../models/classroom.js', () => ({
    default: { find: jest.fn().mockResolvedValue([]) }
}));
jest.unstable_mockModule('../../services/geneticAlgorithm.js', () => ({
    default: class {
        run() { return { bestTimetable: {}, fitness: 100 }; }
    }
}));


// Import dynamically after mocking
const { validateTimetable, generateTimetable } = await import('../../controllers/generator.controller.js');

describe('Generator Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {}
        };
        res = {
            statusCode: 200,
            data: null,
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                this.data = data;
                return this;
            }
        };
        jest.spyOn(console, 'error').mockImplementation(() => {}); // Spy and suppress
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('validateTimetable', () => {
        it('should return 400 if courseAssignmentId is missing', async () => {
            req.body = {};
            await validateTimetable(req, res);
            expect(res.statusCode).toBe(400);
            expect(res.data.success).toBe(false);
        });

        it('should return 404 if assignment not found', async () => {
            req.body = { courseAssignmentId: 'validId' };
            
            // Mock Mongoose chain
            const mockPopulate = jest.fn().mockReturnValue(null); // Finally returns null (not found)
            
            mockCourseAssignment.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: mockPopulate 
                })
            });

            await validateTimetable(req, res);
            expect(res.statusCode).toBe(404);
        });

        it('should validate successfully', async () => {
            req.body = { courseAssignmentId: 'validId' };
            
            const mockAssignment = { _id: 'validId', timetableSlots: [] };
            
            // The controller has: .findById().populate('courses.courseId').populate('courses.faculty.facultyId')
            
            const mockPopulate2 = jest.fn().mockResolvedValue(mockAssignment);
            const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
            
            mockCourseAssignment.findById.mockReturnValue({
                populate: mockPopulate1
            });
            
            mockFaculty.find.mockResolvedValue([]);

            await validateTimetable(req, res);
            
            if (!res.data.success) {
                const fs = await import('fs');
                fs.writeFileSync('test_error.log', JSON.stringify({
                    error: res.data.message, // Controller sends message, not error object usually
                    fullError: res.data.error,
                    consoleErrors: console.error.mock.calls
                }, null, 2));
            }

            expect(res.statusCode).toBe(200);
            expect(res.data.success).toBe(true);
            expect(res.data.isValid).toBe(true);
        });
    });

    describe('generateTimetable', () => {
        it('should generate timetable successfully', async () => {
            req.body = { 
                courseAssignmentId: 'validId',
                config: { populationSize: 10 }
            };
            
            // Mock findById for assignment
            // It has .populate('courses.faculty.facultyId')
            // Only ONE populate here based on my code reading of generateTimetable
            
            const mockAssignment = { 
                _id: 'validId', 
                department: 'CSE', 
                section: 'A',
                courses: [] 
            };
            
            mockCourseAssignment.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockAssignment)
            });
            
            mockFaculty.find.mockResolvedValue([]);
            
            // Classroom find is already mocked in unstable_mockModule setup

            await generateTimetable(req, res);
            
            if (!res.data.success) {
                 console.log('Generate Test Fatal:', res.data.message, res.data.error, console.error.mock.calls);
            }

            expect(res.statusCode).toBe(200);
            expect(res.data.success).toBe(true);
            expect(res.data.data.fitness).toBe(100);
        });
    });
});
