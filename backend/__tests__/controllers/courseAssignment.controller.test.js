
import { jest } from '@jest/globals';

// internal mock class to handle constructor calls
class MockModel {
    constructor(data) { Object.assign(this, data); }
    save() { return Promise.resolve({ _id: 'new_id', ...this }); }
    static find() { return { populate: () => ({ populate: () => ({ sort: () => Promise.resolve([]) }) }) }; }
    static findOne() { return { sort: () => ({ populate: () => ({ populate: () => Promise.resolve({}) }) }) }; }
    static findById() { return Promise.resolve({}); }
    static findByIdAndUpdate() { return Promise.resolve({}); }
    static findByIdAndDelete() { return Promise.resolve({}); }
}

// Spies for verification
MockModel.findOne = jest.fn();
MockModel.findById = jest.fn();

jest.unstable_mockModule('../../models/courseAssignment.js', () => ({ default: MockModel }));

const { 
    getCourseAssignment, 
    createCourseAssignment, 
    updateTimetableSlot 
} = await import('../../controllers/courseAssignment.controller.js');

describe('CourseAssignment Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {}, query: {} };
        res = {
            statusCode: 200,
            json: jest.fn().mockReturnThis(),
            status: function(code) { this.statusCode = code; return this; }
        };
        jest.clearAllMocks();
        
        // Quiet console during tests
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        
        MockModel.findOne.mockReset();
        MockModel.findById.mockReset();
    });

    describe('getCourseAssignment', () => {
        it('should return assignment if found', async () => {
            req.query = { academicYear: '2025', semester: 'Odd' };
            const mockData = { _id: 'a1', ...req.query };
            
            // Chain: findOne -> sort -> populate -> populate
            const populateChain = { populate: jest.fn().mockResolvedValue(mockData) };
            const sortChain = { populate: jest.fn().mockReturnValue(populateChain) };
            const queryChain = { sort: jest.fn().mockReturnValue(sortChain) };
            
            MockModel.findOne.mockReturnValue(queryChain);

            await getCourseAssignment(req, res);

            expect(MockModel.findOne).toHaveBeenCalledWith(expect.objectContaining({
                academicYear: '2025'
            }));
            expect(res.statusCode).toBe(200);
            expect(res.json).toHaveBeenCalledWith(mockData);
        });

        it('should return 404 if not found', async () => {
            const populateChain = { populate: jest.fn().mockResolvedValue(null) };
            const sortChain = { populate: jest.fn().mockReturnValue(populateChain) };
            const queryChain = { sort: jest.fn().mockReturnValue(sortChain) };
            
            MockModel.findOne.mockReturnValue(queryChain);

            await getCourseAssignment(req, res);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('createCourseAssignment', () => {
        it('should create new assignment', async () => {
            req.body = { academicYear: '2025', department: 'CSE' };
            
            await createCourseAssignment(req, res);

            expect(res.statusCode).toBe(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Course assignment created successfully'
            }));
        });
    });

    describe('updateTimetableSlot', () => {
        it('should update existing slot', async () => {
            req.params.id = 'a1';
            req.body = { day: 'Monday', slotNumber: 1, slotData: { type: 'Theory' } };
            
            const mockDoc = {
                timetableSlots: [{ day: 'Monday', slotNumber: 1, type: 'Old' }],
                save: jest.fn().mockResolvedValue(true)
            };
            
            MockModel.findById.mockResolvedValue(mockDoc);

            await updateTimetableSlot(req, res);

            expect(MockModel.findById).toHaveBeenCalledWith('a1');
            expect(mockDoc.save).toHaveBeenCalled();
            expect(mockDoc.timetableSlots[0].type).toBe('Theory');
            expect(res.statusCode).toBe(200);
        });

        it('should add new slot if not exists', async () => {
            req.params.id = 'a1';
            req.body = { day: 'Friday', slotNumber: 2, slotData: { type: 'Lab' } };
            
            const mockDoc = {
                timetableSlots: [],
                save: jest.fn().mockResolvedValue(true)
            };
            
            MockModel.findById.mockResolvedValue(mockDoc);

            await updateTimetableSlot(req, res);

            expect(mockDoc.timetableSlots).toHaveLength(1);
            expect(mockDoc.timetableSlots[0].day).toBe('Friday');
        });
    });
});
