import Classroom from '../models/classroom.js';
import CourseAssignment from '../models/courseAssignment.js';

/**
 * Finds an available classroom for a given slot.
 * 
 * @param {string} day - 'Monday', 'Tuesday', etc.
 * @param {number} slotNumber - 1 to 12
 * @param {Object} requirements - { roomType: 'Classroom'|'Lab', capacity: number }
 * @returns {Promise<string|null>} - Returns fullRoomId or null if none found
 */
export const findAvailableClassroom = async (day, slotNumber, requirements = {}) => {
    const { roomType = 'Classroom', capacity = 0 } = requirements;

    // 1. Find all classrooms of correct type and capacity
    const potentialRooms = await Classroom.find({
        roomType,
        capacity: { $gte: capacity },
        isAvailable: true
    });

    if (potentialRooms.length === 0) return null;

    // 2. Get all ACTIVE assignments to check current usage
    const allAssignments = await CourseAssignment.find({ isActive: true });

    // 3. Filter rooms by availability in the specific slot
    for (const room of potentialRooms) {
        // Check if blocked in Classroom model
        const isBlocked = room.blockedSlots.some(b => 
            b.day === day && b.slotNumbers.includes(slotNumber)
        );
        if (isBlocked) continue;

        // Check if occupied in any CourseAssignment
        const isOccupied = allAssignments.some(assignment => 
            assignment.timetableSlots.some(slot => 
                slot.day === day && 
                slot.slotNumber === slotNumber && 
                slot.venue === room.fullRoomId &&
                !slot.isSpanContinuation
            )
        );

        if (!isOccupied) {
            return room.fullRoomId;
        }
    }

    return null;
};
