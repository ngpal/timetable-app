import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Reschedule', 'General'],
        default: 'General'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for efficient look-up by section
notificationSchema.index({ department: 1, section: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
