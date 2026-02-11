
import User from '../../models/user.js';

describe('User Model', () => {
    
    test('should validate a correct user', () => {
        const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Student'
        });
        
        const error = user.validateSync();
        expect(error).toBeUndefined();
    });

    test('should require name and email', () => {
        const user = new User({});
        
        const error = user.validateSync();
        expect(error).toBeDefined();
        expect(error.errors['name']).toBeDefined();
        expect(error.errors['email']).toBeDefined();
    });

    test('should apply default role', () => {
        const user = new User({
            name: 'Jane Doe',
            email: 'jane@example.com'
        });
        
        expect(user.role).toBe('Student');
    });

    test('should enforce role enum', () => {
        const user = new User({
            name: 'Hacker',
            email: 'hacker@test.com',
            role: 'SuperAdmin' // Invalid
        });
        
        const error = user.validateSync();
        expect(error).toBeDefined();
        expect(error.errors['role']).toBeDefined();
    });
});
