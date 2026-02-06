import express from 'express';
import { getFaculty, addFaculty, deleteFaculty,updateFaculty } from '../controllers/faculty.controller.js';
import { verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/all', verifyAdmin, getFaculty);
router.post('/add', verifyAdmin, addFaculty);
router.put('/update/:id', verifyAdmin, updateFaculty);
router.delete('/:id', verifyAdmin, deleteFaculty);


export default router;