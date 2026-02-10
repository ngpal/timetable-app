
import { validateHardConstraints } from '../../services/constraintValidator.js';
import { HARD_CONSTRAINTS } from '../../models/constraint.js';

describe('Constraint Validator', () => {
    
    test('should detect invalid slot numbers', () => {
        const slots = [
            { day: 'Monday', slotNumber: 9, courseName: 'Invalid Class' }
        ];
        
        const violations = validateHardConstraints({ timetableSlots: slots });
        const overflow = violations.find(v => v.constraintId === 'INVALID_SLOT_TIME');
        
        expect(overflow).toBeDefined();
        expect(overflow.description).toMatch(/outside valid hours/);
    });

    test('should detect faculty double booking', () => {
        const slots = [
            { day: 'Monday', slotNumber: 1, facultyName: 'Dr. A', courseName: 'C1' },
            { day: 'Monday', slotNumber: 1, facultyName: 'Dr. A', courseName: 'C2' }
        ];
        
        const violations = validateHardConstraints({ timetableSlots: slots });
        const conflict = violations.find(v => v.constraintId === HARD_CONSTRAINTS.NO_FACULTY_CONFLICT.id);
        
        expect(conflict).toBeDefined();
    });

    test('should allow same faculty in different slots', () => {
        const slots = [
            { day: 'Monday', slotNumber: 1, facultyName: 'Dr. A', courseName: 'C1' },
            { day: 'Monday', slotNumber: 2, facultyName: 'Dr. A', courseName: 'C2' }
        ];
        
        const violations = validateHardConstraints({ timetableSlots: slots });
        expect(violations.length).toBe(0);
    });

    test('should detect room double booking', () => {
        const slots = [
            { day: 'Monday', slotNumber: 1, venue: 'Room 1', courseName: 'C1' },
            { day: 'Monday', slotNumber: 1, venue: 'Room 1', courseName: 'C2' }
        ];
        
        const violations = validateHardConstraints({ timetableSlots: slots });
        const conflict = violations.find(v => v.constraintId === HARD_CONSTRAINTS.NO_ROOM_CONFLICT.id);
        
        expect(conflict).toBeDefined();
    });
});
