import Request from '../models/request.js';

export const createRequest = async (req, res) => {
    try {
        const { secureKey } = req.body;
        // Simple hardcoded key check
        if (secureKey !== "CR123") {
            return res.status(401).json({ success: false, message: "Invalid Secure Key. Authorization denied." });
        }

        const newRequest = new Request(req.body);
        await newRequest.save();
        res.status(201).json({ success: true, message: "Reschedule request submitted successfully!" });
    } catch (error) {
        console.error("Error creating request:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, requests });
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Approved' or 'Rejected'

        const updatedRequest = await Request.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.status(200).json({ success: true, message: `Request ${status} successfully!` });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
