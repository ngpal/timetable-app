import User from '../models/user.js';
import CourseAssignment from '../models/courseAssignment.js';
import Notification from '../models/notification.js';
import { extractStudentDetails } from '../utils/studentUtils.js';
import { errorHandler } from '../utils/error.js';

/**
 * Get the student's personal timetable based on their section
 */
export const getStudentTimetable = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return next(errorHandler(404, 'User not found'));

        // Identify section from email
        const studentDetails = extractStudentDetails(user.email);
        if (!studentDetails) {
            return next(errorHandler(400, 'Could not identify section from roll number. Ensure email is an Amrita student mail.'));
        }

        const { section, department } = studentDetails;

        // Fetch course assignment (timetable) for the student's section
        // We look for the active assignment for this department and section
        const timetable = await CourseAssignment.findOne({
            department: department,
            section: section,
            isActive: true
        }).populate('courses.faculty.facultyId', 'name email department');

        if (!timetable) {
            return res.status(200).json({
                success: true,
                message: `No active timetable found for ${department} Section ${section}`,
                studentDetails,
                timetableSlots: []
            });
        }

        res.status(200).json({
            success: true,
            studentDetails,
            timetable
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get notifications for the student's section
 */
export const getStudentNotifications = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return next(errorHandler(404, 'User not found'));

        const studentDetails = extractStudentDetails(user.email);
        if (!studentDetails) {
            return next(errorHandler(400, 'Could not identify section from roll number.'));
        }

        const { section, department } = studentDetails;

        const notifications = await Notification.find({
            department,
            section
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        next(error);
    }
};
