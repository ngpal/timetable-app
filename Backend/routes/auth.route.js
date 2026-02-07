import express from  'express';
import { verifyAdmin } from '../utils/verifyUser.js';
import { login, logout } from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with Microsoft OAuth data
 *     description: This endpoint receives user data from Microsoft OAuth and creates/updates user in database. In production, this is called by the frontend after Microsoft authentication.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name from Microsoft
 *               email:
 *                 type: string
 *                 description: User's email from Microsoft (determines role)
 *               avatar:
 *                 type: string
 *                 description: User's profile picture URL (optional)
 *           example:
 *             name: "John Doe"
 *             email: "test@gmail.com"
 *       
 *     responses:
 *       200:
 *         description: Login successful, JWT cookie set
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [Admin, Faculty, Student]
 *       500:
 *         description: Server error
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clears authentication cookie and logs out the user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logout);

/**
 * @swagger
 * /api/auth/edit:
 *   post:
 *     summary: Edit timetable (placeholder endpoint)
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Timetable updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/edit', verifyAdmin, (req, res) => {
  res.json("Timetable updated successfully");
});

export default router;



