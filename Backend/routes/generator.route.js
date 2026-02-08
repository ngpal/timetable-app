import express from 'express';
import { validateTimetable, getConstraints } from '../controllers/generator.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Generator
 *   description: Timetable generation and validation APIs
 */

/**
 * @swagger
 * /api/generator/validate:
 *   post:
 *     summary: Validate a timetable against constraints
 *     tags: [Generator]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseAssignmentId
 *             properties:
 *               courseAssignmentId:
 *                 type: string
 *                 description: ID of the course assignment to validate
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Validation results with constraint violations and quality score
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 isValid:
 *                   type: boolean
 *                   example: false
 *                 violations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       constraintId:
 *                         type: string
 *                         example: "NO_FACULTY_CONFLICT"
 *                       description:
 *                         type: string
 *                         example: "Faculty Dr. Kumar is scheduled in multiple places"
 *                       details:
 *                         type: object
 *                 softScore:
 *                   type: number
 *                   example: 78
 *                   description: Quality score from 0-100
 *                 softScoreBreakdown:
 *                   type: object
 *                   properties:
 *                     WORKLOAD_BALANCE:
 *                       type: number
 *                       example: 85
 *                     NO_BACK_TO_BACK_3HR:
 *                       type: number
 *                       example: 90
 *                     LUNCH_BREAK:
 *                       type: number
 *                       example: 100
 *                     MINIMIZE_ROOM_CHANGES:
 *                       type: number
 *                       example: 70
 *                     DAILY_BALANCE:
 *                       type: number
 *                       example: 80
 *                     AVOID_SINGLE_HOUR_GAPS:
 *                       type: number
 *                       example: 75
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalSlots:
 *                       type: number
 *                       example: 23
 *                     hardViolations:
 *                       type: number
 *                       example: 2
 *                     qualityScore:
 *                       type: number
 *                       example: 78
 *       400:
 *         description: Bad request - missing courseAssignmentId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Course assignment ID is required"
 *       404:
 *         description: Course assignment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Course assignment not found"
 *       500:
 *         description: Server error
 */
router.post('/validate', validateTimetable);

/**
 * @swagger
 * /api/generator/constraints:
 *   get:
 *     summary: Get all constraint definitions
 *     tags: [Generator]
 *     description: Returns all hard and soft constraints used for timetable validation and generation
 *     responses:
 *       200:
 *         description: List of hard and soft constraints with their properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 hardConstraints:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "NO_FACULTY_CONFLICT"
 *                       name:
 *                         type: string
 *                         example: "No Faculty Conflict"
 *                       description:
 *                         type: string
 *                         example: "Faculty cannot be scheduled in two places at the same time"
 *                       priority:
 *                         type: number
 *                         example: 10
 *                 softConstraints:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "WORKLOAD_BALANCE"
 *                       name:
 *                         type: string
 *                         example: "Faculty Workload Balance"
 *                       description:
 *                         type: string
 *                         example: "Distribute teaching hours evenly across faculty"
 *                       weight:
 *                         type: number
 *                         example: 10
 *                       maxScore:
 *                         type: number
 *                         example: 100
 *       500:
 *         description: Server error
 */
router.get('/constraints', getConstraints);

/**
 * @swagger
 * /api/generator/generate:
 *   post:
 *     summary: Generate an optimized timetable
 *     tags: [Generator]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseAssignmentId
 *             properties:
 *               courseAssignmentId:
 *                 type: string
 *               config:
 *                 type: object
 *                 properties:
 *                   populationSize:
 *                     type: number
 *                     default: 50
 *                   maxGenerations:
 *                     type: number
 *                     default: 100
 *     responses:
 *       200:
 *         description: Generated timetable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     fitness:
 *                       type: number
 *                     timetable:
 *                       type: object
 *       400:
 *         description: Bad request
 *       404:
 *         description: Assignment not found
 */
import { generateTimetable } from '../controllers/generator.controller.js';
router.post('/generate', generateTimetable);

export default router;
