import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/stats', verifyAdmin, getDashboardStats);

export default router;
