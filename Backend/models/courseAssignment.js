import mongoose from "mongoose";

const timetableSlotSchema = new mongoose.Schema({
    day: { 
        type: String, 
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        required: true 
    },
    slotNumber: { 
        type: Number, 
        min: 1, 
        max: 12, 
        required: true 
    },
    slotType: { 
        type: String, 
        enum: ['Theory', 'Lab', 'Project', 'CIR', 'Break', 'Elective', 'Occupied', 'Discussion'],
        default: 'Theory'
    },
    courseCode: { type: String }, // e.g., '23CSE311'
    courseName: { type: String }, // For display purposes
    venue: { type: String }, // e.g., 'ABIII - C204'
    spanSlots: { type: Number, default: 1 }, // For merged cells (labs typically span 2-3 slots)
    notes: { type: String }, // e.g., 'Discussion/Evaluation Hour AB3- C204'
    occupiedBy: { type: String }, // e.g., 'III B.Tech-F' for blocked slots
    faculty: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Faculty' 
    }]
});

const courseAssignmentSchema = new mongoose.Schema({
    // Academic Information
    academicYear: { type: String, required: true }, // e.g., "2025-2026"
    semester: { 
        type: String, 
        enum: ['Odd', 'Even'], 
        required: true 
    },
    department: { type: String, required: true }, // e.g., "CSE"
    section: { type: String, required: true }, // e.g., "D"
    program: { type: String, default: 'B.Tech' }, // e.g., "B.Tech", "M.Tech"
    
    // Course Information
    courses: [{
        courseCode: { type: String, required: true },
        courseName: { type: String, required: true },
        courseType: { 
            type: String, 
            enum: ['Theory', 'Lab', 'Elective', 'Project'],
            default: 'Theory'
        },
        credits: { type: Number, default: 3 },
        faculty: [{
            facultyId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Faculty' 
            },
            role: { 
                type: String, 
                enum: ['Incharge', 'Assisting'],
                default: 'Incharge'
            }
        }],
        venue: { type: String } // Default venue for this course
    }],
    
    // Timetable Slots
    timetableSlots: [timetableSlotSchema],
    
    // Class Information
    classAdvisors: [{
        facultyId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Faculty' 
        },
        name: { type: String }
    }],
    
    mailId: { type: String }, // Class email ID
    
    // Metadata
    isActive: { type: Boolean, default: true },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }
}, { timestamps: true });

// Index for quick lookups
courseAssignmentSchema.index({ 
    academicYear: 1, 
    semester: 1, 
    department: 1, 
    section: 1 
});

const CourseAssignment = mongoose.model('CourseAssignment', courseAssignmentSchema);
export default CourseAssignment;
