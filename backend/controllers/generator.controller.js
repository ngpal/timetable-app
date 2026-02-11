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


export const generateTimetable = async (req, res) => {
  try {
    const { courseAssignmentId, config } = req.body;

    if (!courseAssignmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course assignment ID is required' 
      });
    }

    // Fetch Course Assignment with populated references
    const assignment = await CourseAssignment.findById(courseAssignmentId)
      .populate('courses.faculty.facultyId'); 
      // Note: Logic in GA currently expects course.faculty to be a single object.
      

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    //  Fetch necessary resources
    const allFaculty = await Faculty.find({});
    
    // Import Classroom model dynamically or added to imports
    const { default: Classroom } = await import('../models/classroom.js');
    const rooms = await Classroom.find({});

    
    //  Initialize GA
    const { default: GeneticAlgorithm } = await import('../services/geneticAlgorithm.js');
    
    // Merge default config with request config
    const gaConfig = {
      courses: assignment.courses,
      faculty: allFaculty,
      rooms: rooms,
      populationSize: config?.populationSize || 50,
      maxGenerations: config?.maxGenerations || 100,
      mutationRate: config?.mutationRate || 0.1,
      eliteSize: config?.eliteSize || 5,
      constraints: config?.hardConstraints || {} // Pass hard constraints config
    };

    const ga = new GeneticAlgorithm(gaConfig);

    //  Run GA
    console.log(`Starting GA for Assignment ${assignment.department} ${assignment.section}...`);
    const result = ga.run();

    // Return result (don't save yet, let user review)
    res.json({
      success: true,
      data: {
        fitness: result.fitness,
        generations: result.generations,
        timetable: result.bestTimetable,
        // We can also return a simplified view or stats
      }
    });

  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate timetable',
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
  getConstraints,
  generateTimetable
};
