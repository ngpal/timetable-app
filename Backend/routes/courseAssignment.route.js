import express from 'express';
import {
    getAllCourseAssignments,
    getCourseAssignment,
    createCourseAssignment,
    updateCourseAssignment,
    updateTimetableSlot,
    updateSlot,
    deleteCourseAssignment
} from '../controllers/courseAssignment.controller.js';
import { verifyAdmin } from '../utils/verifyUser.js';

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
 *     responses:
 *       200:
 *         description: List of all course assignments
 *       500:
 *         description: Server error
 */
router.get('/', verifyAdmin, getAllCourseAssignments);

/**
 * @swagger
 * /api/timetable/find:
 *   get:
 *     summary: Get course assignment by parameters
 *     tags: [Course Assignments]
 *     parameters:
 *       - in: query
 *         name: academicYear
 *         required: true
 *       - in: query
 *         name: semester
 *         required: true
 *       - in: query
 *         name: department
 *         required: true
 *       - in: query
 *         name: section
 *         required: true
 *     responses:
 *       200:
 *         description: Course assignment found
 *       404:
 *         description: Not found
 */
router.get('/find', verifyAdmin, getCourseAssignment);

/**
 * @swagger
 * /api/timetable:
 *   post:
 *     summary: Create new course assignment
 *     tags: [Course Assignments]
 *     responses:
 *       201:
 *         description: Created successfully
 */
router.post('/', verifyAdmin, createCourseAssignment);

/**
 * @swagger
 * /api/timetable/{id}:
 *   put:
 *     summary: Update course assignment
 *     tags: [Course Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put('/:id', verifyAdmin, updateCourseAssignment);

/**
 * @swagger
 * /api/timetable/{id}/slots:
 *   put:
 *     summary: Update a specific timetable slot
 *     tags: [Course Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Slot updated successfully
 */
router.put('/:id/slots', verifyAdmin, updateTimetableSlot);

/**
 * @swagger
 * /api/timetable/{id}/slot:
 *   put:
 *     summary: Update specific slot in timetable
 *     tags: [Course Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Slot updated successfully
 */
router.put('/:id/slot', verifyAdmin, updateSlot);

/**
 * @swagger
 * /api/timetable/{id}:
 *   delete:
 *     summary: Delete course assignment
 *     tags: [Course Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.delete('/:id', verifyAdmin, deleteCourseAssignment);

/**
 * @swagger
 * /api/timetable/sample/generate:
 *   post:
 *     summary: Generate sample timetable data for testing
 *     tags: [Course Assignments]
 *     responses:
 *       201:
 *         description: Sample data created
 */
import { generateSampleTimetable } from '../controllers/sampleData.controller.js';
router.post('/sample/generate', verifyAdmin, generateSampleTimetable);

export default router;
