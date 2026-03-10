import SlotChangeRequest from '../models/slotChangeRequest.js';
import CourseAssignment from '../models/courseAssignment.js';
import Notification from '../models/notification.js';
import User from '../models/user.js';
import Faculty from '../models/faculty.js';
import { validateSlotChangeConstraints } from '../services/constraintValidator.js';
import { findAvailableClassroom } from '../services/classroomService.js';
import { errorHandler } from '../utils/error.js';

/**
 * Create a new slot change request (CR -> Faculty)
 */
export const createRequest = async (req, res, next) => {
    try {
        if (req.user.role === 'Student' && !req.user.isCR) {
            return next(errorHandler(403, 'Only Class Representatives or Faculty can request slot changes'));
        }

        const {
            courseAssignmentId,
            courseCode,
            courseName,
            facultyName,
            venue,
            currentDay,
            currentSlotNumber,
            requestedDay,
            requestedSlotNumber,
            reason
        } = req.body;

        if (!courseAssignmentId || !courseCode || !facultyName || !venue || !currentDay || 
            currentSlotNumber === undefined || !requestedDay || requestedSlotNumber === undefined) {
            return next(errorHandler(400, 'Missing required fields'));
        }

        // Verify assignment exists and has that slot
        const assignment = await CourseAssignment.findById(courseAssignmentId);
        if (!assignment) {
            return next(errorHandler(404, 'CourseAssignment not found'));
        }

        const slotExists = assignment.timetableSlots.some(
            s => s.day === currentDay && s.slotNumber === currentSlotNumber
        );
        if (!slotExists) {
            return next(errorHandler(400, 'The specified current slot does not exist in this assignment'));
        }

        // Find the facultyId for this course from the assignment
        const courseInfo = assignment.courses.find(c => c.courseCode === courseCode);
        const facultyMember = courseInfo?.faculty.find(f => f.role === 'Incharge') || courseInfo?.faculty[0];
        const facultyId = facultyMember?.facultyId;

        const newRequest = new SlotChangeRequest({
            courseAssignmentId,
            requestedBy: req.user.id,
            facultyId: facultyId,
            courseCode,
            courseName,
            facultyName,
            venue: venue,
            currentDay,
            currentSlotNumber,
            requestedDay,
            requestedSlotNumber,
            reason,
            status: req.user.role === 'Faculty' ? 'Pending_Admin' : 'Pending_Faculty'
        });

        await newRequest.save();
        res.status(201).json({
            message: req.user.role === 'Faculty' 
                ? 'Slot change request submitted to Admin' 
                : 'Slot change request submitted to Faculty',
            request: newRequest
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all requests
 */
export const getAllRequests = async (req, res, next) => {
    try {
        const { status, facultyId } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (facultyId) filter.facultyId = facultyId;

        // If faculty is viewing, show only their pending requests
        if (req.user.role === 'Faculty') {
            const faculty = await Faculty.findOne({ userId: req.user.id });
            if (faculty) filter.facultyId = faculty._id;
        }

        const requests = await SlotChangeRequest.find(filter)
            .populate({ path: 'requestedBy', select: 'name email role' })
            .sort({ createdAt: -1 });

        return res.status(200).json(requests);
    } catch (error) {
        next(error);
    }
};

/**
 * Faculty Approval Step (Moves to Pending_Admin)
 */
export const approveByFaculty = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, message } = req.body; // status: 'Approved' or 'Rejected'

        const request = await SlotChangeRequest.findById(id);
        if (!request) return next(errorHandler(404, 'Request not found'));

        if (request.status !== 'Pending_Faculty') {
            return next(errorHandler(400, `Request is already ${request.status}`));
        }

        if (status === 'Rejected') {
            request.status = 'Rejected';
            request.adminNote = message || 'Rejected by Faculty';
            await request.save();
            return res.status(200).json({ message: 'Request rejected by faculty', request });
        }

        // Move to Admin step
        request.status = 'Pending_Admin';
        await request.save();

        res.status(200).json({ 
            message: 'Faculty approved. Request forwarded to Admin.', 
            request 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin Approval Step (Triggers auto-classroom and updates timetable)
 */
export const approveByAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        const requestDoc = await SlotChangeRequest.findById(id);
        if (!requestDoc) return next(errorHandler(404, 'Request not found'));

        if (requestDoc.status !== 'Pending_Admin') {
            return next(errorHandler(400, 'Request must be approved by faculty first or is already finalized'));
        }

        if (status === 'Rejected') {
            requestDoc.status = 'Rejected';
            requestDoc.adminNote = adminNote;
            await requestDoc.save();
            return res.status(200).json({ message: 'Request rejected by Admin', request: requestDoc });
        }

        // Automatic Classroom Assignment
        const venue = await findAvailableClassroom(
            requestDoc.requestedDay, 
            requestDoc.requestedSlotNumber,
            { roomType: 'Classroom' } // Default to Classroom, could be dynamic
        );

        if (!venue) {
            return res.status(409).json({
                success: false,
                message: 'No available classroom found for the requested slot. Admin must manually resolve or reject.'
            });
        }

        // Update the request with assigned venue
        requestDoc.assignedVenue = venue;

        // Perform standard constraint validation (Faculty/Section conflicts)
        // We modify requestDoc briefly to check if the new venue causes room conflicts
        // but since we checked availability in findAvailableClassroom, it should be fine.
        const validation = await validateSlotChangeConstraints(requestDoc);
        if (!validation.valid) {
            return res.status(409).json({
                message: 'Constraint violation at target slot',
                conflicts: validation.conflicts
            });
        }

        // Execute Timetable Update
        const assignment = await CourseAssignment.findById(requestDoc.courseAssignmentId);
        let slotFound = false;
        assignment.timetableSlots.forEach(slot => {
            if (slot.day === requestDoc.currentDay && slot.slotNumber === requestDoc.currentSlotNumber) {
                slot.day = requestDoc.requestedDay;
                slot.slotNumber = requestDoc.requestedSlotNumber;
                slot.venue = venue; // Assign the new venue
                slotFound = true;
            } else if (slot.day === requestDoc.currentDay && 
                       slot.slotNumber > requestDoc.currentSlotNumber && 
                       slot.isSpanContinuation) {
                slot.day = requestDoc.requestedDay;
                // Note: venue update for continuation slots? Yes.
                slot.venue = venue;
            }
        });

        if (!slotFound) return next(errorHandler(400, 'Original slot no longer exists'));

        assignment.markModified('timetableSlots');
        await assignment.save();

        requestDoc.status = 'Approved';
        requestDoc.adminNote = adminNote;
        await requestDoc.save();

        // Notify students
        await Notification.create({
            department: assignment.department,
            section: assignment.section,
            type: 'Reschedule',
            message: `Timetable Update: ${requestDoc.courseName} moved to ${requestDoc.requestedDay} Slot ${requestDoc.requestedSlotNumber} in ${venue}.`
        });

        res.status(200).json({
            message: 'Request approved by Admin. Classroom auto-assigned.',
            request: requestDoc,
            assignment
        });

    } catch (error) {
        next(error);
    }
};

// Keep old method for backward compatibility if needed, or delete
export const approveOrRejectRequest = approveByAdmin; 

