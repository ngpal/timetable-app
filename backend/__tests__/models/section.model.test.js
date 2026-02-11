
import Section from '../../models/Section.js';

describe('Section Model', () => {
    
    test('should validate a correct section', () => {
        const section = new Section({
            academicYear: '2025-2026',
            semester: 'Odd',
            department: 'CSE',
            section: 'A',
            year: 3,
            program: 'B.Tech',
            studentCount: 65
        });
        
        const error = section.validateSync();
        expect(error).toBeUndefined();
    });

    test('should require identification fields', () => {
        const section = new Section({ department: 'CSE' });
        
        const error = section.validateSync();
        expect(error).toBeDefined();
        expect(error.errors['academicYear']).toBeDefined();
        expect(error.errors['semester']).toBeDefined();
        expect(error.errors['section']).toBeDefined();
        expect(error.errors['year']).toBeDefined();
    });

    test('should enforce program enum', () => {
        const section = new Section({
            academicYear: '2025-2026',
            semester: 'Odd',
            department: 'CSE',
            section: 'A',
            year: 3,
            program: 'Ph.D' // Invalid
        });
        
        const error = section.validateSync();
        expect(error).toBeDefined();
        expect(error.errors['program']).toBeDefined();
    });
});
