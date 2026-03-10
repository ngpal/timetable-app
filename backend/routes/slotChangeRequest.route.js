import express from 'express';
import { createRequest, getAllRequests, approveByFaculty, approveByAdmin } from '../controllers/slotChangeRequest.controller.js';
import { verifyAdmin, verifyUser } from '../utils/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/slot-change-requests:
 *   post:
 *     summary: Submit a new slot change request (CR -> Faculty)
 *     tags: [SlotChangeRequests]
 */
router.post('/', verifyUser, createRequest);

/**
 * @swagger
 * /api/slot-change-requests:
 *   get:
 *     summary: Get slot change requests (Admin or Faculty specific)
 *     tags: [SlotChangeRequests]
 */
router.get('/', verifyUser, getAllRequests); // Logic inside controller filters for Faculty

/**
 * @swagger
 * /api/slot-change-requests/{id}/faculty-approve:
 *   patch:
 *     summary: Faculty approval step (Moves to Pending_Admin)
 *     tags: [SlotChangeRequests]
 */
router.patch('/:id/faculty-approve', verifyUser, approveByFaculty);

/**
 * @swagger
 * /api/slot-change-requests/{id}/admin-approve:
 *   patch:
 *     summary: Admin approval step (Auto-classroom assignment and finalize)
 *     tags: [SlotChangeRequests]
 */
router.patch('/:id/admin-approve', verifyAdmin, approveByAdmin);

export default router;
