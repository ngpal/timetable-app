import express from 'express';
import {
    getAllCourseAssignments,
    getCourseAssignment,
    createCourseAssignment,
    updateCourseAssignment,
    updateTimetableSlot,
    updateSlot,
    deleteCourseAssignment,
    getFacultyTimetable,
    getMyTimetable
} from '../controllers/courseAssignment.controller.js';

import { generateSampleTimetable } from '../controllers/sampleData.controller.js';
import { verifyAdmin, verifyUser } from '../utils/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Course Assignments
 *   description: API for managing course assignments and timetables
 */

/**
 * @swagger
 * /api/timetable:
 *   get:
 *     summary: Get all course assignments
 *     tags: [Course Assignments]
 */
router.get('/', verifyUser, getAllCourseAssignments);

/**
 * @swagger
 * /api/timetable/find:
 *   get:
 *     summary: Get course assignment by parameters
 *     tags: [Course Assignments]
 */
router.get('/find', verifyUser, getCourseAssignment);

/**
 * @swagger
 * /api/timetable/my-timetable:
 *   get:
 *     summary: Get timetable for currently logged-in faculty
 *     tags: [Course Assignments]
 */
router.get('/my-timetable', verifyUser, getMyTimetable);

/**
 * @swagger
 * /api/timetable/faculty-timetable:
 *   get:
 *     summary: Get faculty timetable by facultyId
 *     tags: [Course Assignments]
 */
router.get('/faculty-timetable', verifyUser, getFacultyTimetable);

/**
 * @swagger
 * /api/timetable:
 *   post:
 *     summary: Create new course assignment
 *     tags: [Course Assignments]
 */
router.post('/', verifyAdmin, createCourseAssignment);

/**
 * @swagger
 * /api/timetable/{id}:
 *   put:
 *     summary: Update course assignment
 *     tags: [Course Assignments]
 */
router.put('/:id', verifyAdmin, updateCourseAssignment);

/**
 * @swagger
 * /api/timetable/{id}/slots:
 *   put:
 *     summary: Update timetable slots
 *     tags: [Course Assignments]
 */
router.put('/:id/slots', verifyAdmin, updateTimetableSlot);

/**
 * @swagger
 * /api/timetable/{id}/slot:
 *   put:
 *     summary: Update specific slot
 *     tags: [Course Assignments]
 */
router.put('/:id/slot', verifyAdmin, updateSlot);

/**
 * @swagger
 * /api/timetable/{id}:
 *   delete:
 *     summary: Delete course assignment
 *     tags: [Course Assignments]
 */
router.delete('/:id', verifyAdmin, deleteCourseAssignment);

/**
 * @swagger
 * /api/timetable/sample/generate:
 *   post:
 *     summary: Generate sample timetable data
 *     tags: [Course Assignments]
 */
router.post('/sample/generate', verifyAdmin, generateSampleTimetable);

export default router;