import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    department: { type: String, required: true },
    designation: { type: String, required: true }, // Guest, HOD, etc.
    facultyType: { 
        type: String, 
        enum: ['Full-time', 'Ad-hoc', 'Half-time'], 
        required: true 
    },
    workConstraints: {
        maxHoursPerWeek: { type: Number, default: 40 },
        availableDays: [String] 
    }
}, { timestamps: true });

const Faculty = mongoose.model('Faculty', facultySchema);
export default Faculty;