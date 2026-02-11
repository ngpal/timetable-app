
import TimetableConstraint from '../../models/timetableConstraint.js';

describe('TimetableConstraint Model', () => {
    
    test('should validate a correct constraint', () => {
        const constraint = new TimetableConstraint({
            academicYear: '2025-2026',
            semester: 'Odd',
            department: 'CSE'
        });
        
        const error = constraint.validateSync();
        expect(error).toBeUndefined();
    });

    test('should require academic metadata', () => {
        const constraint = new TimetableConstraint({});
        
        const error = constraint.validateSync();
        expect(error).toBeDefined();
        expect(error.errors['academicYear']).toBeDefined();
        expect(error.errors['semester']).toBeDefined();
        expect(error.errors['department']).toBeDefined();
    });

    test('should apply default hard constraints', () => {
        const constraint = new TimetableConstraint({
            academicYear: '2025-2026',
            semester: 'Odd',
            department: 'CSE'
        });
        
        expect(constraint.hardConstraints.workingDays).toHaveLength(5);
        expect(constraint.hardConstraints.slotDuration).toBe(60);
        expect(constraint.hardConstraints.maxHoursPerDayPerFaculty).toBe(6);
    });

    test('should enforce semester enum', () => {
        const constraint = new TimetableConstraint({
            academicYear: '2025-2026',
            department: 'CSE',
            semester: 'Summer' // Invalid
        });
        
        const error = constraint.validateSync();
        expect(error).toBeDefined();
        expect(error.errors['semester']).toBeDefined();
    });
});
