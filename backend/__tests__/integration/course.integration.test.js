import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { connectDB, closeDB, clearDB } from './setup.js';
import Course from '../../models/course.js';
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
const { default: courseRouter } = await import('../../routes/course.route.js');
app.use('/api/courses', courseRouter);

beforeAll(async () => {
    await connectDB();
});

afterEach(async () => {
    await clearDB();
    jest.clearAllMocks();
});

afterAll(async () => {
    await closeDB();
});

describe('Course API Integration Tests', () => {

    const sampleCourse = {
        courseCode: 'CS101',
        courseName: 'Intro to Computer Science',
        department: 'Computer Science',
        theoryHours: 3,
        labHours: 2,
        semester: 1,
        year: 1
    };

    describe('POST /api/courses/add', () => {
        it('should add a new course successfully', async () => {
            const response = await request(app)
                .post('/api/courses/add')
                .set('Cookie', ['access_token=fake_token'])
                .send(sampleCourse);
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.courseCode).toBe('CS101');
            expect(response.body.totalLoad).toBe(5); // virtual property check (3 theory + 2 lab)

            // Verify it was saved to DB
            const courseInDb = await Course.findById(response.body._id);
            expect(courseInDb).not.toBeNull();
            expect(courseInDb.courseName).toBe('Intro to Computer Science');
        });

        it('should return 400 if course code already exists', async () => {
            await Course.init(); // Wait for unique indexes to build
            await Course.create(sampleCourse);

            // Attempt to add duplicate
            const response = await request(app)
                .post('/api/courses/add')
                .set('Cookie', ['access_token=fake_token'])
                .send(sampleCourse);
            
            expect(response.status).toBe(400);
            expect(response.body.message).toContain('duplicate key error');
        });

        it('should return 400 if required fields are missing', async () => {
            const incompleteCourse = { courseName: 'Invalid Course', department: 'CS' }; // Missing courseCode
            const response = await request(app)
                .post('/api/courses/add')
                .set('Cookie', ['access_token=fake_token'])
                .send(incompleteCourse);
            
            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/courses/all', () => {
        it('should return all courses', async () => {
            // Seed two courses
            await Course.create(sampleCourse);
            await Course.create({
                courseCode: 'CS102',
                courseName: 'Data Structures',
                department: 'Computer Science',
                theoryHours: 4,
                labHours: 0,
                semester: 2,
                year: 1
            });

            const response = await request(app)
                .get('/api/courses/all')
                .set('Cookie', ['access_token=fake_token']);
            
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
            expect(response.body[0].courseCode).toBe('CS101');
            expect(response.body[1].courseCode).toBe('CS102');
            expect(response.body[0].totalLoad).toBeDefined(); 
        });

        it('should return empty array if no courses exist', async () => {
            const response = await request(app)
                .get('/api/courses/all')
                .set('Cookie', ['access_token=fake_token']);
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });
    });

    describe('PUT /api/courses/update/:id', () => {
        it('should update an existing course', async () => {
            const course = await Course.create(sampleCourse);

            const updateData = { theoryHours: 4, courseName: 'Introduction to CS' };
            const response = await request(app)
                .put(`/api/courses/update/${course._id}`)
                .set('Cookie', ['access_token=fake_token'])
                .send(updateData);
            
            expect(response.status).toBe(200);
            expect(response.body.theoryHours).toBe(4);
            expect(response.body.courseName).toBe('Introduction to CS');

            // Verify DB update
            const updatedInDb = await Course.findById(course._id);
            expect(updatedInDb.theoryHours).toBe(4);
        });

        it('should return 404 if course not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .put(`/api/courses/update/${fakeId}`)
                .set('Cookie', ['access_token=fake_token'])
                .send({ theoryHours: 4 });
            
            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/courses/:id', () => {
        it('should delete a course', async () => {
            const course = await Course.create(sampleCourse);

            const response = await request(app)
                .delete(`/api/courses/${course._id}`)
                .set('Cookie', ['access_token=fake_token']);
            
            expect(response.status).toBe(200);
            expect(response.body).toBe('Course deleted successfully');

            const inDb = await Course.findById(course._id);
            expect(inDb).toBeNull();
        });

        it('should return 404 when trying to delete non-existent course', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .delete(`/api/courses/${fakeId}`)
                .set('Cookie', ['access_token=fake_token']);
            
            expect(response.status).toBe(404);
        });
    });
});
