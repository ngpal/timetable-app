import express from 'express';
import Request from '../models/request.js';

const router = express.Router();

// Secure Key (Hardcoded for now as per plan)
const CR_SECURE_KEY = "CR123";

// Create a new request
router.post('/create', async (req, res) => {
    try {
        const { secureKey, ...requestData } = req.body;

        if (secureKey !== CR_SECURE_KEY) {
            return res.status(403).json({ success: false, message: "Invalid Secure Key. Access Denied." });
        }

        const newRequest = new Request(requestData);
        await newRequest.save();

        res.status(201).json({ success: true, message: "Request submitted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all requests (for Faculty)
router.get('/all', async (req, res) => {
    try {
        const requests = await Request.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update request status (Approve/Reject)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const updatedRequest = await Request.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.status(200).json({ success: true, message: `Request ${status.toLowerCase()} successfully`, request: updatedRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
