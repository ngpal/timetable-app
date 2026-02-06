import express from 'express';
import { getFaculty, addFaculty, deleteFaculty,updateFaculty } from '../controllers/faculty.controller.js';
import { verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/faculty/all:
 *   get:
 *     summary: Get all faculty members
 *     tags: [Faculty]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all faculty members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                     description: Reference to User model
 *                   department:
 *                     type: string
 *                   designation:
 *                     type: string
 *                     description: e.g., Guest, HOD, Professor
 *                   facultyType:
 *                     type: string
 *                     enum: [Full-time, Ad-hoc, Half-time]
 *                   workConstraints:
 *                     type: object
 *                     properties:
 *                       maxHoursPerWeek:
 *                         type: number
 *                         default: 40
 *                       availableDays:
 *                         type: array
 *                         items:
 *                           type: string
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
router.get('/all', verifyAdmin, getFaculty);

/**
 * @swagger
 * /api/faculty/add:
 *   post:
 *     summary: Add a new faculty member
 *     tags: [Faculty]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - department
 *               - designation
 *               - facultyType
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID reference (MongoDB ObjectId)
 *               department:
 *                 type: string
 *                 description: Department name
 *               designation:
 *                 type: string
 *                 description: e.g., Guest, HOD, Professor, Assistant Professor
 *               facultyType:
 *                 type: string
 *                 enum: [Full-time, Ad-hoc, Half-time]
 *                 description: Employment type
 *               workConstraints:
 *                 type: object
 *                 properties:
 *                   maxHoursPerWeek:
 *                     type: number
 *                     default: 40
 *                   availableDays:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: e.g., ["Monday", "Tuesday", "Wednesday"]
 *           example:
 *             userId: "65a8f3b2c4e5670012abcdef"
 *             department: "Computer Science"
 *             designation: "Assistant Professor"
 *             facultyType: "Full-time"
 *             workConstraints:
 *               maxHoursPerWeek: 40
 *               availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
 *     responses:
 *       201:
 *         description: Faculty member created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/add', verifyAdmin, addFaculty);

/**
 * @swagger
 * /api/faculty/update/{id}:
 *   put:
 *     summary: Update a faculty member
 *     tags: [Faculty]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Faculty member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Faculty member updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Faculty member not found
 */
router.put('/update/:id', verifyAdmin, updateFaculty);

/**
 * @swagger
 * /api/faculty/{id}:
 *   delete:
 *     summary: Delete a faculty member
 *     tags: [Faculty]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Faculty member ID
 *     responses:
 *       200:
 *         description: Faculty member deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Faculty member not found
 */
router.delete('/:id', verifyAdmin, deleteFaculty);


export default router;