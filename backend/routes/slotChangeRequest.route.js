import express from 'express';
import { createRequest, getAllRequests, approveOrRejectRequest } from '../controllers/slotChangeRequest.controller.js';
import { verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/slot-change-requests:
 *   post:
 *     summary: Submit a new slot change request
 *     tags: [SlotChangeRequests]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verifyAdmin, createRequest); // Using verifyAdmin for now as per system policy

/**
 * @swagger
 * /api/slot-change-requests:
 *   get:
 *     summary: Get all slot change requests (Admin only)
 *     tags: [SlotChangeRequests]
 */
router.get('/', verifyAdmin, getAllRequests);

/**
 * @swagger
 * /api/slot-change-requests/{id}/status:
 *   patch:
 *     summary: Approve or Reject a request
 *     tags: [SlotChangeRequests]
 */
router.patch('/:id/status', verifyAdmin, approveOrRejectRequest);

export default router;
