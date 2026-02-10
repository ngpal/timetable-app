
import mongoose from 'mongoose';
import CourseAssignment from '../../models/courseAssignment.js';

describe('CourseAssignment Model', () => {
    
    test('should validate a correct assignment', () => {
        const assignment = new CourseAssignment({
            academicYear: '2025-2026',
            semester: 'Odd',
            department: 'CSE',
            section: 'A',
            courses: []
        });
        
        const error = assignment.validateSync();
        expect(error).toBeUndefined();
    });

    test('should require required fields', () => {
        const assignment = new CourseAssignment({});
        
        const error = assignment.validateSync();
        expect(error).toBeDefined();
        expect(error.errors['academicYear']).toBeDefined();
        expect(error.errors['semester']).toBeDefined();
        expect(error.errors['department']).toBeDefined();
        expect(error.errors['section']).toBeDefined();
    });

    test('should enforce enum values for semester', () => {
        const assignment = new CourseAssignment({
            academicYear: '2025-2026',
            semester: 'Summer', // Invalid
            department: 'CSE',
            section: 'A'
        });
        
        const error = assignment.validateSync();
        expect(error).toBeDefined();
        expect(error.errors['semester']).toBeDefined();
    });
});
