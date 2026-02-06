import express from 'express';
import { getClassrooms, addClassroom, updateClassroom, deleteClassroom } from '../controllers/classroom.controller.js';
import { verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/all', verifyAdmin, getClassrooms);
router.post('/add', verifyAdmin, addClassroom);
router.put('/update/:id', verifyAdmin, updateClassroom);
router.delete('/:id', verifyAdmin, deleteClassroom);

export default router;