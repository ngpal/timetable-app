import User from '../models/user.js';
import CourseAssignment from '../models/courseAssignment.js';
import Notification from '../models/notification.js';
import SlotChangeRequest from '../models/slotChangeRequest.js';
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

/**
 * Get aggregated dashboard stats for the student
 * Returns: timetable summary, request stats, recent notifications
 */
export const getStudentDashboardStats = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return next(errorHandler(404, 'User not found'));

        const studentDetails = extractStudentDetails(user.email);
        if (!studentDetails) {
            return next(errorHandler(400, 'Could not identify section from roll number.'));
        }

        const { section, department } = studentDetails;

        // Fetch timetable
        const timetable = await CourseAssignment.findOne({
            department, section, isActive: true
        }).populate('courses.faculty.facultyId', 'name email');

        // Compute timetable stats
        let timetableStats = {
            totalCourses: 0,
            totalWeeklyHours: 0,
            theoryHours: 0,
            labHours: 0,
            facultyCount: 0,
            sectionInfo: `${department} - Section ${section}`
        };

        if (timetable) {
            const slots = timetable.timetableSlots || [];
            const nonContinuationSlots = slots.filter(s => !s.isSpanContinuation);

            timetableStats.totalCourses = timetable.courses?.length || 0;
            timetableStats.totalWeeklyHours = nonContinuationSlots.reduce(
                (sum, s) => sum + (s.spanSlots || 1), 0
            );
            timetableStats.theoryHours = nonContinuationSlots
                .filter(s => s.sessionType !== 'Lab')
                .reduce((sum, s) => sum + (s.spanSlots || 1), 0);
            timetableStats.labHours = nonContinuationSlots
                .filter(s => s.sessionType === 'Lab')
                .reduce((sum, s) => sum + (s.spanSlots || 1), 0);

            // Count distinct faculty
            const facultySet = new Set();
            timetable.courses?.forEach(c => {
                c.faculty?.forEach(f => {
                    if (f.facultyId?._id) facultySet.add(f.facultyId._id.toString());
                });
            });
            timetableStats.facultyCount = facultySet.size;
        }

        // Fetch slot change requests for this section's timetable
        let requestStats = { total: 0, pendingFaculty: 0, pendingAdmin: 0, approved: 0, rejected: 0 };
        let recentRequests = [];

        if (timetable) {
            const requests = await SlotChangeRequest.find({
                courseAssignmentId: timetable._id
            }).sort({ createdAt: -1 });

            requestStats.total = requests.length;
            requestStats.pendingFaculty = requests.filter(r => r.status === 'Pending_Faculty').length;
            requestStats.pendingAdmin = requests.filter(r => r.status === 'Pending_Admin').length;
            requestStats.approved = requests.filter(r => r.status === 'Approved').length;
            requestStats.rejected = requests.filter(r => r.status === 'Rejected').length;

            recentRequests = requests.slice(0, 5).map(r => ({
                _id: r._id,
                courseCode: r.courseCode,
                courseName: r.courseName,
                currentDay: r.currentDay,
                currentSlotNumber: r.currentSlotNumber,
                requestedDay: r.requestedDay,
                requestedSlotNumber: r.requestedSlotNumber,
                status: r.status,
                createdAt: r.createdAt
            }));
        }

        // Fetch recent notifications (last 10)
        const notifications = await Notification.find({
            department, section
        }).sort({ createdAt: -1 }).limit(10);

        res.status(200).json({
            success: true,
            timetableStats,
            requestStats,
            recentRequests,
            notifications,
            studentDetails
        });
    } catch (error) {
        next(error);
    }
};
