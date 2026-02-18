import express from 'express';
import { createRequest, getAllRequests, updateRequestStatus } from '../controllers/request.controller.js';

const router = express.Router();

router.post('/create', createRequest);
router.get('/all', getAllRequests);
router.put('/:id/status', updateRequestStatus);

export default router;
