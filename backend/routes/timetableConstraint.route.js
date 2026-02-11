import express from 'express';
import {
    getAllConstraints,
    getConstraintById,
    getActiveConstraint,
    createConstraint,
    updateConstraint,
    deleteConstraint,
    getDefaultConstraint
} from '../controllers/timetableConstraint.controller.js';
import { verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Timetable Constraints
 *   description: API for managing timetable generation constraints
 */

/**
 * @swagger
 * /api/constraints:
 *   get:
 *     summary: Get all timetable constraints
 *     tags: [Timetable Constraints]
 *     responses:
 *       200:
 *         description: List of all constraints
 *       500:
 *         description: Server error
 */
router.get('/', verifyAdmin, getAllConstraints);

/**
 * @swagger
 * /api/constraints/default:
 *   get:
 *     summary: Get default constraint template
 *     tags: [Timetable Constraints]
 *     responses:
 *       200:
 *         description: Default constraint template
 *       500:
 *         description: Server error
 */
router.get('/default', getDefaultConstraint);

/**
 * @swagger
 * /api/constraints/active:
 *   get:
 *     summary: Get active constraint for specific parameters
 *     tags: [Timetable Constraints]
 *     parameters:
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *         required: true
 *         description: Academic year (e.g., 2025-2026)
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *           enum: [Odd, Even]
 *         required: true
 *         description: Semester
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         required: true
 *         description: Department name
 *     responses:
 *       200:
 *         description: Active constraint found
 *       404:
 *         description: No active constraint found
 *       500:
 *         description: Server error
 */
router.get('/active', verifyAdmin, getActiveConstraint);

/**
 * @swagger
 * /api/constraints/{id}:
 *   get:
 *     summary: Get constraint by ID
 *     tags: [Timetable Constraints]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Constraint ID
 *     responses:
 *       200:
 *         description: Constraint details
 *       404:
 *         description: Constraint not found
 *       500:
 *         description: Server error
 */
router.get('/:id', verifyAdmin, getConstraintById);

/**
 * @swagger
 * /api/constraints:
 *   post:
 *     summary: Create new timetable constraint
 *     tags: [Timetable Constraints]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - academicYear
 *               - semester
 *               - department
 *             properties:
 *               academicYear:
 *                 type: string
 *               semester:
 *                 type: string
 *                 enum: [Odd, Even]
 *               department:
 *                 type: string
 *               hardConstraints:
 *                 type: object
 *               softConstraints:
 *                 type: object
 *     responses:
 *       201:
 *         description: Constraint created successfully
 *       500:
 *         description: Server error
 */
router.post('/', verifyAdmin, createConstraint);

/**
 * @swagger
 * /api/constraints/{id}:
 *   put:
 *     summary: Update constraint by ID
 *     tags: [Timetable Constraints]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Constraint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Constraint updated successfully
 *       404:
 *         description: Constraint not found
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyAdmin, updateConstraint);

/**
 * @swagger
 * /api/constraints/{id}:
 *   delete:
 *     summary: Delete constraint by ID
 *     tags: [Timetable Constraints]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Constraint ID
 *     responses:
 *       200:
 *         description: Constraint deleted successfully
 *       404:
 *         description: Constraint not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyAdmin, deleteConstraint);

export default router;
