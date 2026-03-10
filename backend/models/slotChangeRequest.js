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
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
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
        type: String, // Current venue
        required: true,
    },
    assignedVenue: {
        type: String, // System assigned venue after Admin approval
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
        enum: ['Pending_Faculty', 'Pending_Admin', 'Approved', 'Rejected'],
        default: 'Pending_Faculty',
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
