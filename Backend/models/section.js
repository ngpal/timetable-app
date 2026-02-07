import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
    // Academic Information
    academicYear: { type: String, required: true }, // "2025-2026"
    semester: { 
        type: String, 
        required: true,
        enum: ['Odd', 'Even']
    }, // "Odd", "Even"
    department: { type: String, required: true }, // "CSE", "ECE", "ME"
    section: { type: String, required: true }, // "A", "B", "C", "D"
    year: { type: Number, required: true, min: 1, max: 4 }, // 1, 2, 3, 4
    program: { 
        type: String, 
        default: 'B.Tech',
        enum: ['B.Tech', 'M.Tech', 'MCA', 'MBA']
    },
    
    // Student Information
    studentCount: { type: Number, default: 60 },
    
    // Class Advisors
    classAdvisors: [{
        facultyId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Faculty' 
        },
        name: String // Denormalized for quick access
    }],
    
    // Contact Information
    mailId: { type: String }, // "d_cse6d@cb.amrita.edu, p_swapna@cb.amrita.edu"
    
    // Assigned Courses for this section
    courses: [{
        courseId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Course' 
        },
        courseCode: String, // Denormalized
        courseName: String, // Denormalized
        faculty: [{
            facultyId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Faculty' 
            },
            name: String, // Denormalized
            role: { 
                type: String, 
                enum: ['Incharge', 'Assisting'] 
            }
        }],
        defaultVenue: String // "ABIII - C204"
    }],
    
    // Timetable Reference
    timetableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseAssignment'
    },
    
    // Status
    isActive: { type: Boolean, default: true }
    
}, { timestamps: true });

// Compound index for unique section identification
sectionSchema.index({ 
    academicYear: 1, 
    semester: 1, 
    department: 1, 
    section: 1 
}, { unique: true });

// Index for quick lookups
sectionSchema.index({ department: 1, year: 1 });

const Section = mongoose.model('Section', sectionSchema);
export default Section;
