import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema({
    // Basic Information
    roomId: { type: String, required: true, unique: true }, // "C204", "LAB1"
    roomName: { type: String }, // Optional - will default to fullRoomId if not provided
    
    // Amrita-specific Location
    building: { type: String, required: true }, // "ABIII", "AB-I", "TAG"
    floor: { type: String }, // "TF" (Third Floor), "SF" (Second Floor), "GF"
    block: { type: String }, // "C", "D", "E"
    
    // Full Room Identifier (as shown in Amrita timetables)
    fullRoomId: { type: String, required: true }, // "ABIII - C204", "ABIII - TF-CP LAB 1"
    
    // Room Type
    roomType: { 
        type: String, 
        enum: ['Classroom', 'Lab', 'Computer Lab', 'Hardware Lab', 'Seminar Hall', 'Auditorium', 'Conference Room'], 
        default: 'Classroom' 
    },
    
    // Lab-specific
    labType: { type: String }, // "CP LAB", "HW LAB", "SF-HW LAB", "TF-CP LAB"
    
    // Capacity
    capacity: { type: Number, required: true },
    
    // Facilities
    facilities: [{ 
        type: String,
        enum: ['Projector', 'AC', 'Whiteboard', 'Smart Board', 'Audio System', 'Video Conferencing', 'Computers']
    }],
    
    // Availability
    isAvailable: { type: Boolean, default: true },
    
    // Blocked Slots (for maintenance, events, etc.)
    blockedSlots: [{
        day: { 
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        slotNumbers: [{ type: Number, min: 1, max: 12 }],
        reason: { type: String }, // "Maintenance", "Reserved for Event"
        date: { type: Date } // Specific date if applicable
    }],
    
    // Additional Info
    notes: { type: String }
    
}, { timestamps: true });

// Index for quick lookups
classroomSchema.index({ building: 1, floor: 1 });
classroomSchema.index({ roomType: 1 });
classroomSchema.index({ fullRoomId: 1 });

const Classroom = mongoose.model('Classroom', classroomSchema);
export default Classroom;