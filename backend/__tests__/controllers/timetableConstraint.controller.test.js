
import { jest } from '@jest/globals';

class MockConstraint {
    constructor(data) {
        Object.assign(this, data);
    }
    save() {
        return Promise.resolve({ _id: '123', ...this });
    }
    static find() { return { populate: () => ({ sort: () => Promise.resolve([]) }) }; }
    static findById() { return { populate: () => Promise.resolve({ _id: '123' }) }; }
    static findOne() { return { populate: () => Promise.resolve({}) }; }
    static findByIdAndUpdate() { return Promise.resolve({}); }
    static findByIdAndDelete() { return Promise.resolve({}); }
}

jest.unstable_mockModule('../../models/timetableConstraint.js', () => ({ default: MockConstraint }));

const { 
    getAllConstraints, 
    createConstraint, 
    getDefaultConstraint 
} = await import('../../controllers/timetableConstraint.controller.js');

describe('TimetableConstraint Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {}, query: {} };
        res = {
            statusCode: 200,
            json: jest.fn().mockReturnThis(),
            status: function(code) { this.statusCode = code; return this; }
        };
        jest.clearAllMocks();
    });

    describe('createConstraint', () => {
        it('should create constraint successfully', async () => {
            req.body = { academicYear: '2025' };
            await createConstraint(req, res);
            expect(res.statusCode).toBe(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Constraint created successfully'
            }));
        });
    });

    describe('getDefaultConstraint', () => {
        it('should return default template', async () => {
            await getDefaultConstraint(req, res);
            expect(res.statusCode).toBe(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                academicYear: '2025-2026',
                hardConstraints: expect.any(Object)
            }));
        });
    });
});
