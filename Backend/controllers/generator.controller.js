import { validateHardConstraints, calculateSoftConstraintScore } from '../services/constraintValidator.js';
import CourseAssignment from '../models/courseAssignment.js';
import Faculty from '../models/faculty.js';


export const validateTimetable = async (req, res) => {
  try {
    const { courseAssignmentId } = req.body;

    if (!courseAssignmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course assignment ID is required' 
      });
    }

    // Fetch course assignment
    const assignment = await CourseAssignment.findById(courseAssignmentId)
      .populate('courses.courseId')
      .populate('courses.faculty.facultyId');

    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course assignment not found' 
      });
    }

    // Fetch all faculty for workload analysis
    const allFaculty = await Faculty.find({});

    // Validate hard constraints
    const violations = validateHardConstraints(assignment);

    // Calculate soft constraint score
    const softScore = calculateSoftConstraintScore(assignment, allFaculty);

    // Determine if timetable is valid
    const isValid = violations.length === 0;

    res.json({
      success: true,
      isValid,
      violations,
      softScore: softScore.totalScore,
      softScoreBreakdown: softScore.breakdown,
      summary: {
        totalSlots: assignment.timetableSlots?.length || 0,
        hardViolations: violations.length,
        qualityScore: softScore.totalScore
      }
    });

  } catch (error) {
    console.error('Error validating timetable:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to validate timetable',
      error: error.message 
    });
  }
};


export const getConstraints = async (req, res) => {
  try {
    const { HARD_CONSTRAINTS, SOFT_CONSTRAINTS } = await import('../models/constraint.js');
    
    res.json({
      success: true,
      hardConstraints: Object.values(HARD_CONSTRAINTS),
      softConstraints: Object.values(SOFT_CONSTRAINTS)
    });
  } catch (error) {
    console.error('Error fetching constraints:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch constraints',
      error: error.message 
    });
  }
};

export default {
  validateTimetable,
  getConstraints
};
