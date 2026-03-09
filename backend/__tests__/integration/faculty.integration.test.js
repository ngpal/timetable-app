import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { connectDB, closeDB, clearDB } from './setup.js';
import Faculty from '../../models/faculty.js';
import cookieParser from 'cookie-parser';

// Create an Express app instance for testing
const app = express();
app.use(express.json());
app.use(cookieParser());

// Mock the verifyAdmin middleware directly
import { jest } from '@jest/globals';

jest.unstable_mockModule('../../utils/verifyUser.js', () => ({
    verifyAdmin: (req, res, next) => {
        req.user = { id: new mongoose.Types.ObjectId().toString(), role: 'Admin' };
        next();
    }
}));

// Import the router dynamically AFTER mocking the middleware
const { default: facultyRouter } = await import('../../routes/faculty.route.js');
app.use('/api/faculty', facultyRouter);

beforeAll(async () => {
    await connectDB();
}, 120000);

afterEach(async () => {
    await clearDB();
    jest.clearAllMocks();
});

afterAll(async () => {
    await closeDB();
});

describe('Faculty API Integration Tests', () => {

    const sampleFaculty = {
        userId: new mongoose.Types.ObjectId().toString(),
        name: 'Dr. John Doe',
        email: 'johndoe@example.com',
        department: 'Computer Science',
        designation: 'Professor',
        facultyType: 'Full-time',
        workConstraints: {
            maxHoursPerWeek: 40,
            availableDays: ['Monday', 'Tuesday']
        }
    };

    describe('POST /api/faculty/add', () => {
        it('should add a new faculty member successfully', async () => {
            const response = await request(app)
                .post('/api/faculty/add')
                .set('Cookie', ['access_token=fake_token'])
                .send(sampleFaculty);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('faculty');
            expect(response.body.faculty).toHaveProperty('_id');
            expect(response.body.faculty.department).toBe('Computer Science');

            // Verify it was saved to the DB
            const facultyInDb = await Faculty.findById(response.body.faculty._id);
            expect(facultyInDb).not.toBeNull();
            expect(facultyInDb.designation).toBe('Professor');
        });

        it('should return 400 if required fields are missing', async () => {
            const incompleteFaculty = {
                department: 'Mathematics',
                name: 'Dr. Incomplete' // explicit missing email
            };
            const response = await request(app)
                .post('/api/faculty/add')
                .set('Cookie', ['access_token=fake_token'])
                .send(incompleteFaculty);

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/faculty/all', () => {
        it('should return an empty array when no faculty exist', async () => {
            const response = await request(app)
                .get('/api/faculty/all')
                .set('Cookie', ['access_token=fake_token']);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBe(0);
        });

        it('should return all faculty members', async () => {
            await Faculty.create(sampleFaculty);
            await Faculty.create({
                userId: new mongoose.Types.ObjectId().toString(),
                name: 'Dr. Jane Smith',
                email: 'janesmith@example.com',
                department: 'Physics',
                designation: 'Assistant Professor',
                facultyType: 'Ad-hoc'
            });

            const response = await request(app)
                .get('/api/faculty/all')
                .set('Cookie', ['access_token=fake_token']);
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
        });
    });

    describe('PUT /api/faculty/update/:id', () => {
        it('should update an existing faculty member', async () => {
            const faculty = await Faculty.create(sampleFaculty);

            const updateData = { designation: 'HOD' };
            const response = await request(app)
                .put(`/api/faculty/update/${faculty._id}`)
                .set('Cookie', ['access_token=fake_token'])
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.designation).toBe('HOD');

            const updatedInDb = await Faculty.findById(faculty._id);
            expect(updatedInDb.designation).toBe('HOD');
        });

        it('should return 404 for a non-existent faculty ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .put(`/api/faculty/update/${fakeId}`)
                .set('Cookie', ['access_token=fake_token'])
                .send({ designation: 'HOD' });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/faculty/:id', () => {
        it('should delete a faculty member', async () => {
            const faculty = await Faculty.create(sampleFaculty);

            const response = await request(app)
                .delete(`/api/faculty/${faculty._id}`)
                .set('Cookie', ['access_token=fake_token']);

            expect(response.status).toBe(200);
            expect(response.body).toBe('Faculty and User record deleted');

            const deletedInDb = await Faculty.findById(faculty._id);
            expect(deletedInDb).toBeNull();
        });

        it('should return 404 if faculty is not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .delete(`/api/faculty/${fakeId}`)
                .set('Cookie', ['access_token=fake_token']);
            expect(response.status).toBe(404);
        });
    });
});
