import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    // Basic Information
    courseCode: { type: String, required: true, unique: true }, // "23CSE311"
    courseName: { type: String, required: true }, // "Software Engineering"
    
    // Academic Information
    credits: { type: Number, required: true, default: 3 }, // 2, 3, 4
    semester: { type: Number, min: 1, max: 8 }, // 1-8
    year: { type: Number, min: 1, max: 4 }, // 1-4
    
    // Course Type
    courseType: {
        type: String,
        enum: ['Core', 'Elective', 'Professional Elective', 'Open Elective', 'Lab', 'Project', 'Seminar'],
        default: 'Core'
    },
    
    electiveCategory: { type: String }, // "PE-III", "OE-I", "PE-II"
    
    // Hours
    theoryHours: { type: Number, default: 0 },
    labHours: { type: Number, default: 0 },
    
    // Session Types (NEW - supports multiple session types for one course)
    sessionTypes: [{
        type: {
            type: String,
            enum: ['Theory', 'Lab', 'Tutorial', 'Project'],
            required: true
        },
        hoursPerWeek: {
            type: Number,
            required: true
        },
        requiresLab: {
            type: Boolean,
            default: false
        },
        labType: String,
        requiresAssistingFaculty: {
            type: Boolean,
            default: false
        }
    }],
    
    // Lab Requirements (kept for backward compatibility)
    requiresLab: { type: Boolean, default: false },
    labComponent: {
        hasLab: { type: Boolean, default: false },
        labHours: { type: Number, default: 0 },
        requiresAssistingFaculty: { type: Boolean, default: false },
        labType: { type: String }
    },
    
    // Department
    department: { type: String, required: true }, // "CSE", "ECE", "ME"
    
    // Prerequisites
    prerequisites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    
    // Additional Info
    description: { type: String },
    syllabus: { type: String }, // URL or text
    
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
});

// Virtual for total load
courseSchema.virtual('totalLoad').get(function() {
    return this.theoryHours + this.labHours;
});

// Index for quick lookups
courseSchema.index({ department: 1, semester: 1 });

const Course = mongoose.model('Course', courseSchema);
export default Course;