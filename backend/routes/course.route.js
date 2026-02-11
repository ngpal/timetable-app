import express from 'express';
import { getCourses, addCourse, updateCourse, deleteCourse } from '../controllers/course.controller.js';
import { verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/courses/all:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   courseCode:
 *                     type: string
 *                     description: Unique course code (e.g., "CS101")
 *                   courseName:
 *                     type: string
 *                     description: Course name
 *                   theoryHours:
 *                     type: number
 *                     description: Theory hours per week
 *                   labHours:
 *                     type: number
 *                     description: Lab hours per week
 *                   department:
 *                     type: string
 *                     description: Department offering the course
 *                   totalLoad:
 *                     type: number
 *                     description: Virtual field - sum of theory and lab hours
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/all', verifyAdmin, getCourses);

/**
 * @swagger
 * /api/courses/add:
 *   post:
 *     summary: Add a new course
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseCode
 *               - courseName
 *               - department
 *             properties:
 *               courseCode:
 *                 type: string
 *                 description: Unique course code (must be unique)
 *               courseName:
 *                 type: string
 *                 description: Course name
 *               theoryHours:
 *                 type: number
 *                 default: 0
 *                 description: Theory hours per week
 *               labHours:
 *                 type: number
 *                 default: 0
 *                 description: Lab hours per week
 *               department:
 *                 type: string
 *                 description: Department offering the course
 *           example:
 *             courseCode: "CS301"
 *             courseName: "Data Structures and Algorithms"
 *             theoryHours: 3
 *             labHours: 2
 *             department: "Computer Science"
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Bad request (e.g., courseCode already exists)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/add', verifyAdmin, addCourse);

/**
 * @swagger
 * /api/courses/update/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               credits:
 *                 type: number
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course not found
 */
router.put('/update/:id', verifyAdmin, updateCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course not found
 */
router.delete('/:id', verifyAdmin, deleteCourse);

export default router;