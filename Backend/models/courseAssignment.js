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
    courseCode: { type: String },
    courseName: { type: String },
    sessionType: {
        type: String,
        enum: ['Theory', 'Lab', 'Tutorial', 'Project'],
        default: 'Theory'
    },
    facultyName: { type: String },
    venue: { type: String },
    spanSlots: { type: Number, default: 1 },
    isSpanContinuation: { type: Boolean, default: false },
    spanStartSlot: { type: Number },
    notes: { type: String },
    occupiedBy: { type: String },
    faculty: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Faculty' 
    }]
});

const courseAssignmentSchema = new mongoose.Schema({
    // Academic Information
    academicYear: { type: String, required: true },
    semester: { 
        type: String, 
        enum: ['Odd', 'Even'], 
        required: true 
    },
    department: { type: String, required: true },
    section: { type: String, required: true },
    program: { type: String, default: 'B.Tech' },
    
    // Course Information
    courses: [{
        courseCode: { type: String, required: true },
        courseName: { type: String, required: true },
        courseType: { 
            type: String, 
            enum: ['Core', 'Elective', 'Professional Elective', 'Open Elective', 'Lab', 'Project', 'Seminar'],
            default: 'Core'
        },
        sessionType: {
            type: String,
            enum: ['Theory', 'Lab', 'Tutorial', 'Project'],
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
    },
    
    // Generation Metadata
    generationStats: {
        fitness: { type: Number },
        generations: { type: Number },
        hardViolations: { type: Number },
        generatedAt: { type: Date }
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
