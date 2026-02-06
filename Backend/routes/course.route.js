import express from 'express';
import { getCourses, addCourse, updateCourse, deleteCourse } from '../controllers/course.controller.js';
import { verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/all', verifyAdmin, getCourses);
router.post('/add', verifyAdmin, addCourse);
router.put('/update/:id', verifyAdmin, updateCourse);
router.delete('/:id', verifyAdmin, deleteCourse);

export default router;