import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true }, // e.g., 101, LAB1
    roomName: { type: String, required: true }, // e.g., Lecture Hall 1
    roomType: { 
        type: String, 
        enum: ['Classroom', 'Lab'], 
        default: 'Classroom' 
    },
    capacity: { type: Number, required: true }
}, { timestamps: true });

const Classroom = mongoose.model('Classroom', classroomSchema);
export default Classroom;