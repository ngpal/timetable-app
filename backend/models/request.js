import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    subject: { type: String, required: true },
    currentDate: { type: String, required: true },
    currentSlot: { type: String, required: true },
    targetDate: { type: String, required: true },
    targetSlot: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

const Request = mongoose.model('Request', requestSchema);
export default Request;
