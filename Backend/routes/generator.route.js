import express from 'express';
import { validateTimetable, getConstraints } from '../controllers/generator.controller.js';

const router = express.Router();

// Validate timetable against constraints
router.post('/validate', validateTimetable);

// Get constraint definitions
router.get('/constraints', getConstraints);



export default router;
