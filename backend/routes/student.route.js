import express from 'express';
import { getStudentTimetable, getStudentNotifications, getStudentDashboardStats } from '../controllers/student.controller.js';
import { verifyUser } from '../utils/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/student/timetable:
 *   get:
 *     summary: Get timetable for the logged-in student's section
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 */
router.get('/timetable', verifyUser, getStudentTimetable);

/**
 * @swagger
 * /api/student/notifications:
 *   get:
 *     summary: Get notifications for the logged-in student's section
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 */
router.get('/notifications', verifyUser, getStudentNotifications);

/**
 * @swagger
 * /api/student/dashboard-stats:
 *   get:
 *     summary: Get aggregated dashboard stats for the student
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 */
router.get('/dashboard-stats', verifyUser, getStudentDashboardStats);

export default router;
