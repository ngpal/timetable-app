import mongoose from 'mongoose';

const slotChangeRequestSchema = new mongoose.Schema({
    courseAssignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseAssignment',
        required: true,
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    courseCode: {
        type: String,
        required: true,
    },
    courseName: {
        type: String,
        required: true,
    },
    facultyName: {
        type: String, // Denormalized for fast conflict check
        required: true,
    },
    venue: {
        type: String, // Denormalized for fast conflict check
        required: true,
    },
    currentDay: {
        type: String,
        required: true,
    },
    currentSlotNumber: {
        type: Number,
        required: true,
    },
    requestedDay: {
        type: String,
        required: true,
    },
    requestedSlotNumber: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    reason: {
        type: String,
    },
    adminNote: {
        type: String,
    },
}, { timestamps: true });

// Index for efficient look-up by Admin
slotChangeRequestSchema.index({ status: 1, createdAt: -1 });

const SlotChangeRequest = mongoose.model('SlotChangeRequest', slotChangeRequestSchema);

export default SlotChangeRequest;
