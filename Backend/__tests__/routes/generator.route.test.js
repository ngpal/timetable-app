
import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Mock the controller
jest.unstable_mockModule('../../controllers/generator.controller.js', () => ({
    validateTimetable: jest.fn((req, res) => res.status(200).json({ success: true, message: 'Validated' })),
    generateTimetable: jest.fn((req, res) => res.status(200).json({ success: true, message: 'Generated' })),
    getConstraints: jest.fn((req, res) => res.status(200).json({ success: true, constraints: [] }))
}));

// Import router after mocking
const { default: GeneratorRoute } = await import('../../routes/generator.route.js');
const { validateTimetable, generateTimetable, getConstraints } = await import('../../controllers/generator.controller.js');

const app = express();
app.use(express.json());
app.use('/api/generator', GeneratorRoute);

describe('Generator Routes', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /api/generator/validate should call validateTimetable controller', async () => {
        await request(app)
            .post('/api/generator/validate')
            .send({ courseAssignmentId: '123' });
        
        expect(validateTimetable).toHaveBeenCalled();
    });

    test('POST /api/generator/generate should call generateTimetable controller', async () => {
        await request(app)
            .post('/api/generator/generate')
            .send({ courseAssignmentId: '123' });
        
        expect(generateTimetable).toHaveBeenCalled();
    });

    test('GET /api/generator/constraints should call getConstraints controller', async () => {
        await request(app)
            .get('/api/generator/constraints');
        
        expect(getConstraints).toHaveBeenCalled();
    });
});
