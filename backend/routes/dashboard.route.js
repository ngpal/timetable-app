import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalFaculty:
 *                   type: number
 *                 totalCourses:
 *                   type: number
 *                 totalClassrooms:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/stats', verifyAdmin, getDashboardStats);

export default router;
