import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    // Basic Information
    name: { type: String, required: true }, // "Dr. Vedaj J Padman"
    email: { type: String, required: true, unique: true }, // "p_swapna@cb.amrita.edu"
    phoneNumber: { type: String },
    
    // Academic Information
    department: { type: String, required: true }, // "CSE", "ECE", "ME"
    designation: { type: String, required: true }, // "Assistant Professor", "Associate Professor", "Professor", "HOD"
    facultyType: { 
        type: String, 
        enum: ['Full-time', 'Ad-hoc', 'Half-time', 'Visiting'], 
        required: true 
    },
    
    // Amrita-specific: Class Advisor Role
    isClassAdvisor: { type: Boolean, default: false },
    advisorFor: [{
        department: String,
        section: String,
        academicYear: String,
        semester: String
    }],
    
    // Work Constraints
    workConstraints: {
        maxHoursPerWeek: { type: Number, default: 40 },
        maxHoursPerDay: { type: Number, default: 6 },
        maxConsecutiveHours: { type: Number, default: 3 },
        availableDays: { 
            type: [String], 
            default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] 
        }
    },
    
    // Time Slot Preferences (for Amrita's 12-slot system)
    preferredTimeSlots: [{
        day: { 
            type: String, 
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] 
        },
        slotNumbers: [{ type: Number, min: 1, max: 12 }] // Preferred slots 1-12
    }],
    
    unavailableSlots: [{
        day: String,
        slotNumbers: [Number],
        reason: String // "Personal", "Meeting", "Other commitment"
    }],
    
    // Additional Info
    specialization: [String], // ["Machine Learning", "Data Science"]
    qualifications: String, // "Ph.D. in Computer Science"
    
}, { timestamps: true });

// Index for quick lookups
facultySchema.index({ email: 1 });
facultySchema.index({ department: 1 });

const Faculty = mongoose.model('Faculty', facultySchema);
export default Faculty;