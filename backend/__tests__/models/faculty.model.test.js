
import mongoose from 'mongoose';
import Faculty from '../../models/faculty.js';

describe('Faculty Model', () => {
    
    test('should validate a correct faculty member', () => {
        const faculty = new Faculty({
            userId: new mongoose.Types.ObjectId(),
            name: 'Dr. Smith',
            email: 'smith@example.com',
            department: 'CSE',
            designation: 'Professor',
            facultyType: 'Full-time',
            workConstraints: { maxHoursPerWeek: 40 }
        });
        
        const error = faculty.validateSync();
        expect(error).toBeUndefined();
    });

    test('should require required fields', () => {
        const faculty = new Faculty({});
        
        const error = faculty.validateSync();
        expect(error).toBeDefined();
        expect(error.errors['userId']).toBeDefined();
        expect(error.errors['name']).toBeDefined();
        expect(error.errors['email']).toBeDefined();
        expect(error.errors['department']).toBeDefined();
        expect(error.errors['designation']).toBeDefined();
    });

    test('should enforce enum for facultyType', () => {
        const faculty = new Faculty({
            userId: new mongoose.Types.ObjectId(),
            name: 'Dr. Smith',
            email: 'smith@example.com',
            department: 'CSE',
            designation: 'Professor',
            facultyType: 'Invalid_Type' 
        });
        
        const error = faculty.validateSync();
        expect(error).toBeDefined();
        expect(error.errors['facultyType']).toBeDefined();
    });

    test('should apply default work constraints', () => {
        const faculty = new Faculty({
            userId: new mongoose.Types.ObjectId(),
            name: 'Dr. Defaults',
            email: 'def@example.com',
            department: 'ME',
            designation: 'Lecturer',
            facultyType: 'Ad-hoc'
        });
        
        expect(faculty.workConstraints.maxHoursPerWeek).toBe(40);
        expect(faculty.workConstraints.maxHoursPerDay).toBe(6);
    });
});
