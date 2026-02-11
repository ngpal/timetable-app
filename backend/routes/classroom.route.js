import express from 'express';
import { getClassrooms, addClassroom, updateClassroom, deleteClassroom } from '../controllers/classroom.controller.js';
import { verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/rooms/all:
 *   get:
 *     summary: Get all classrooms
 *     tags: [Classrooms]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all classrooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   roomId:
 *                     type: string
 *                     description: Unique room identifier (e.g., "101", "LAB1")
 *                   roomName:
 *                     type: string
 *                     description: Room name (e.g., "Lecture Hall 1")
 *                   roomType:
 *                     type: string
 *                     enum: [Classroom, Lab]
 *                     description: Type of room
 *                   capacity:
 *                     type: number
 *                     description: Maximum number of students
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
router.get('/all', verifyAdmin, getClassrooms);

/**
 * @swagger
 * /api/rooms/add:
 *   post:
 *     summary: Add a new classroom
 *     tags: [Classrooms]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - roomName
 *               - capacity
 *             properties:
 *               roomId:
 *                 type: string
 *                 description: Unique room identifier (must be unique)
 *               roomName:
 *                 type: string
 *                 description: Room name
 *               roomType:
 *                 type: string
 *                 enum: [Classroom, Lab]
 *                 default: Classroom
 *                 description: Type of room
 *               capacity:
 *                 type: number
 *                 description: Maximum capacity
 *           example:
 *             roomId: "C-107"
 *             roomName: "Computer Lab 1"
 *             roomType: "Lab"
 *             capacity: 55
 *     responses:
 *       201:
 *         description: Classroom created successfully
 *       400:
 *         description: Bad request (e.g., roomId already exists)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/add', verifyAdmin, addClassroom);

/**
 * @swagger
 * /api/rooms/update/{id}:
 *   put:
 *     summary: Update a classroom
 *     tags: [Classrooms]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Classroom ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomId:
 *                 type: string
 *               roomName:
 *                 type: string
 *               roomType:
 *                 type: string
 *                 enum: [Classroom, Lab]
 *               capacity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Classroom updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Classroom not found
 */
router.put('/update/:id', verifyAdmin, updateClassroom);

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: Delete a classroom
 *     tags: [Classrooms]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Classroom ID
 *     responses:
 *       200:
 *         description: Classroom deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Classroom not found
 */
router.delete('/:id', verifyAdmin, deleteClassroom);

export default router;