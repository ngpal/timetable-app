import TimetableConstraint from '../models/timetableConstraint.js';

// Get all constraints
export const getAllConstraints = async (req, res) => {
    try {
        const constraints = await TimetableConstraint.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(constraints);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching constraints', error: error.message });
    }
};

// Get constraint by ID
export const getConstraintById = async (req, res) => {
    try {
        const constraint = await TimetableConstraint.findById(req.params.id)
            .populate('createdBy', 'name email');
        
        if (!constraint) {
            return res.status(404).json({ message: 'Constraint not found' });
        }
        
        res.status(200).json(constraint);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching constraint', error: error.message });
    }
};

// Get active constraint for specific academic year, semester, and department
export const getActiveConstraint = async (req, res) => {
    try {
        const { academicYear, semester, department } = req.query;
        
        const constraint = await TimetableConstraint.findOne({
            academicYear,
            semester,
            department,
            isActive: true
        }).populate('createdBy', 'name email');
        
        if (!constraint) {
            return res.status(404).json({ 
                message: 'No active constraint found for the specified parameters' 
            });
        }
        
        res.status(200).json(constraint);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active constraint', error: error.message });
    }
};

// Create new constraint
export const createConstraint = async (req, res) => {
    try {
        const constraintData = {
            ...req.body,
            createdBy: req.user?.id // Assuming user info is in req.user from auth middleware
        };
        
        const newConstraint = new TimetableConstraint(constraintData);
        const savedConstraint = await newConstraint.save();
        
        res.status(201).json({
            message: 'Constraint created successfully',
            constraint: savedConstraint
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating constraint', error: error.message });
    }
};

// Update constraint
export const updateConstraint = async (req, res) => {
    try {
        const updatedConstraint = await TimetableConstraint.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedConstraint) {
            return res.status(404).json({ message: 'Constraint not found' });
        }
        
        res.status(200).json({
            message: 'Constraint updated successfully',
            constraint: updatedConstraint
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating constraint', error: error.message });
    }
};

// Delete constraint
export const deleteConstraint = async (req, res) => {
    try {
        const deletedConstraint = await TimetableConstraint.findByIdAndDelete(req.params.id);
        
        if (!deletedConstraint) {
            return res.status(404).json({ message: 'Constraint not found' });
        }
        
        res.status(200).json({ message: 'Constraint deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting constraint', error: error.message });
    }
};

// Get default constraint template
export const getDefaultConstraint = async (req, res) => {
    try {
        const defaultConstraint = {
            academicYear: "2025-2026",
            semester: "Odd",
            department: "Computer Science",
            hardConstraints: {
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                dailyStartTime: '08:00',
                dailyEndTime: '18:15',
                slotDuration: 50, // minutes
                
                // Amrita University slot structure (12 slots)
                slots: [
                    { number: 1, start: '08:00', end: '08:50' },
                    { number: 2, start: '08:50', end: '09:40' },
                    { number: 3, start: '09:40', end: '10:30' },
                    // 15-minute break
                    { number: 4, start: '10:45', end: '11:35' },
                    { number: 5, start: '11:35', end: '12:25' },
                    { number: 6, start: '12:25', end: '13:15' },
                    // Lunch break: 13:15 - 14:05
                    { number: 7, start: '14:05', end: '14:55' },
                    { number: 8, start: '14:55', end: '15:45' },
                    { number: 9, start: '15:45', end: '16:35' },
                    { number: 10, start: '16:35', end: '17:25' },
                    { number: 11, start: '17:25', end: '18:15' },
                    { number: 12, start: '18:15', end: '19:05' }
                ],
                
                lunchBreak: {
                    startTime: '13:15',
                    endTime: '14:05'
                },
                
                maxConsecutiveHoursPerFaculty: 3,
                maxHoursPerDayPerFaculty: 6,
                maxHoursPerWeekPerFaculty: 40,
                noRoomOverlap: true,
                labCoursesRequireLab: true,
                minGapBetweenSameCourse: 1,
                maxConsecutiveSlotsPerCourse: 2,
                noStudentConflict: true,
                
                // Amrita-specific constraints
                labSlotSpan: 2, // Lab sessions typically span 2-3 slots
                projectReviewSlots: true,
                cirSlots: true // Continuous Internal Review slots
            },
            softConstraints: {
                minimizeGapsInSchedule: { enabled: true, weight: 5 },
                balancedDailyWorkload: { enabled: true, weight: 7 },
                maximizeRoomUtilization: { enabled: false, weight: 3 },
                avoidFirstLastSlots: { enabled: false, weight: 2 },
                spreadCoursesAcrossWeek: { enabled: true, weight: 6 },
                preferredTimeSlots: [],
                customRules: []
            },
            isActive: true
        };
        
        res.status(200).json(defaultConstraint);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching default constraint', error: error.message });
    }
};
