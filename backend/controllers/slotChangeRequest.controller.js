import SlotChangeRequest from '../models/slotChangeRequest.js';
import CourseAssignment from '../models/courseAssignment.js';
import { validateSlotChangeConstraints } from '../services/constraintValidator.js';
import { errorHandler } from '../utils/error.js';

/**
 * Create a new slot change request
 */
export const createRequest = async (req, res, next) => {
    try {
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

        const newRequest = new SlotChangeRequest({
            courseAssignmentId,
            requestedBy: req.user.id,
            courseCode,
            courseName,
            facultyName,
            venue,
            currentDay,
            currentSlotNumber,
            requestedDay,
            requestedSlotNumber,
            reason
        });

        await newRequest.save();
        res.status(201).json({
            message: 'Slot change request submitted successfully',
            request: newRequest
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all requests (Admin view)
 */
export const getAllRequests = async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        }

        const requests = await SlotChangeRequest.find(filter)
            .populate({ path: 'requestedBy', select: 'email role', strictPopulate: false })
            .sort({ createdAt: -1 });

        return res.status(200).json(requests);
    } catch (error) {
        next(error);
    }
};

/**
 * Approve or Reject a request
 */
export const approveOrRejectRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return next(errorHandler(400, 'Status must be Approved or Rejected'));
        }

        const request = await SlotChangeRequest.findById(id);
        if (!request) {
            return next(errorHandler(404, 'Request not found'));
        }

        if (request.status !== 'Pending') {
            return next(errorHandler(400, `Request is already ${request.status}`));
        }

        if (status === 'Rejected') {
            request.status = 'Rejected';
            request.adminNote = adminNote;
            await request.save();
            return res.status(200).json({ message: 'Request rejected', request });
        }

        // Status is Approved - Validate Constraints
        const validation = await validateSlotChangeConstraints(request);

        if (!validation.valid) {
            return res.status(409).json({
                message: 'Constraint violation: cannot approve this move',
                conflicts: validation.conflicts
            });
        }

        // Constraints passed, execute move
        const assignment = await CourseAssignment.findById(request.courseAssignmentId);
        if (!assignment) {
            return next(errorHandler(404, 'CourseAssignment not found during approval'));
        }

        // Update the specific slot surgically
        let slotFound = false;
        assignment.timetableSlots.forEach(slot => {
            if (slot.day === request.currentDay && slot.slotNumber === request.currentSlotNumber) {
                // Move this slot
                slot.day = request.requestedDay;
                slot.slotNumber = request.requestedSlotNumber;
                slotFound = true;
            } else if (slot.day === request.currentDay && 
                       slot.slotNumber > request.currentSlotNumber && 
                       slot.isSpanContinuation) {
                
                // If it's a span continuation, shift its day too
                // (This assume span is contiguous correctly)
                slot.day = request.requestedDay;
            }
        });

        if (!slotFound) {
            return next(errorHandler(400, 'Original slot no longer exists in assignment'));
        }

        // Mark modified for subdocument changes
        assignment.markModified('timetableSlots');
        await assignment.save();

        request.status = 'Approved';
        request.adminNote = adminNote;
        await request.save();

        res.status(200).json({
            message: 'Request approved and timetable updated surgically',
            request,
            assignment
        });

    } catch (error) {
        next(error);
    }
};
