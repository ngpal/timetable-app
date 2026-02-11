
import Course from '../../models/course.js';

describe('Course Model', () => {
    
    test('should validate a correct course', () => {
        const course = new Course({
            courseCode: 'CS101',
            courseName: 'Intro to CS',
            credits: 3,
            department: 'CSE',
            semester: 1,
            year: 1,
            sessionTypes: [{ type: 'Theory', hoursPerWeek: 3 }]
        });
        
        const error = course.validateSync();
        expect(error).toBeUndefined();
    });

    test('should require courseCode and Name', () => {
        const course = new Course({ department: 'CSE' });
        
        const error = course.validateSync();
        expect(error).toBeDefined();
        expect(error.errors['courseCode']).toBeDefined();
        expect(error.errors['courseName']).toBeDefined();
    });

    test('should enforce courseType enum', () => {
        const course = new Course({
            courseCode: 'CS101',
            courseName: 'Intro',
            department: 'CSE',
            courseType: 'Invalid'
        });
        
        const error = course.validateSync();
        expect(error).toBeDefined();
        expect(error.errors['courseType']).toBeDefined();
    });
});
