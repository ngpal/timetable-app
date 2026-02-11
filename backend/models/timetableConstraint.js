import mongoose from "mongoose";

const timetableConstraintSchema = new mongoose.Schema({
    // Metadata
    academicYear: { type: String, required: true }, // e.g., "2025-2026"
    semester: { 
        type: String, 
        enum: ['Odd', 'Even'], 
        required: true 
    },
    department: { type: String, required: true },
    
    // Hard Constraints (MUST be satisfied)
    hardConstraints: {
        // Time-related constraints
        workingDays: {
            type: [String],
            default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        dailyStartTime: { type: String, default: '08:00' },
        dailyEndTime: { type: String, default: '16:35' },
        slotDuration: { type: Number, default: 60 }, // in minutes
        lunchBreak: {
            startTime: { type: String, default: '13:15' },
            endTime: { type: String, default: '14:05' }
        },
        
        // Faculty constraints
        maxConsecutiveHoursPerFaculty: { type: Number, default: 3 },
        maxHoursPerDayPerFaculty: { type: Number, default: 6 },
        maxHoursPerWeekPerFaculty: { type: Number, default: 40 },
        
        // Room constraints
        noRoomOverlap: { type: Boolean, default: true }, // One class per room at a time
        labCoursesRequireLab: { type: Boolean, default: true }, // Lab courses must be in lab rooms
        
        // Course constraints
        minGapBetweenSameCourse: { type: Number, default: 1 }, // days
        maxConsecutiveSlotsPerCourse: { type: Number, default: 2 },
        
        // Student constraints (if applicable)
        noStudentConflict: { type: Boolean, default: true }, // Same batch can't have multiple classes
    },
    
    // Soft Constraints (Preferences, can be violated with penalty)
    softConstraints: {
        // Faculty preferences
        preferredTimeSlots: [{
            facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
            preferredDays: [String],
            preferredStartTime: String,
            preferredEndTime: String,
            priority: { type: Number, min: 1, max: 10, default: 5 } // 10 = highest priority
        }],
        
        // Optimization preferences
        minimizeGapsInSchedule: { 
            enabled: { type: Boolean, default: true },
            weight: { type: Number, default: 5 } // Penalty weight
        },
        balancedDailyWorkload: {
            enabled: { type: Boolean, default: true },
            weight: { type: Number, default: 7 }
        },
        maximizeRoomUtilization: {
            enabled: { type: Boolean, default: false },
            weight: { type: Number, default: 3 }
        },
        avoidFirstLastSlots: {
            enabled: { type: Boolean, default: false },
            weight: { type: Number, default: 2 }
        },
        
        // Course distribution preferences
        spreadCoursesAcrossWeek: {
            enabled: { type: Boolean, default: true },
            weight: { type: Number, default: 6 }
        },
        
        // Custom constraints
        customRules: [{
            name: String,
            description: String,
            weight: { type: Number, default: 5 }
        }]
    },
    
    // Additional settings
    isActive: { type: Boolean, default: true },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }
}, { timestamps: true });

// Index for quick lookups
timetableConstraintSchema.index({ academicYear: 1, semester: 1, department: 1 });

const TimetableConstraint = mongoose.model('TimetableConstraint', timetableConstraintSchema);
export default TimetableConstraint;
