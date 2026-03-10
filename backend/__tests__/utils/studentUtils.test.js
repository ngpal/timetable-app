import { extractStudentDetails } from '../../utils/studentUtils.js';

describe('studentUtils - extractStudentDetails', () => {
    test('should correctly identify Section A', () => {
        const email = 'cb.en.u4cse21001@cb.students.amrita.edu';
        const result = extractStudentDetails(email);
        expect(result.section).toBe('A');
        expect(result.department).toBe('CSE');
        expect(result.rollNumber).toBe(1);
    });

    test('should correctly identify Section B', () => {
        const email = 'cb.en.u4cse21086@cb.students.amrita.edu';
        const result = extractStudentDetails(email);
        expect(result.section).toBe('B');
        expect(result.rollNumber).toBe(86);
    });

    test('should correctly identify Section C', () => {
        const email = 'cb.en.u4cse21171@cb.students.amrita.edu';
        const result = extractStudentDetails(email);
        expect(result.section).toBe('C');
        expect(result.rollNumber).toBe(171);
    });

    test('should correctly identify Section D', () => {
        const email = 'cb.en.u4cse21341@cb.students.amrita.edu';
        const result = extractStudentDetails(email);
        expect(result.section).toBe('D');
        expect(result.rollNumber).toBe(341);
    });

    test('should extract department correctly (ECE)', () => {
        const email = 'cb.sc.u4ece21050@cb.students.amrita.edu';
        const result = extractStudentDetails(email);
        expect(result.department).toBe('ECE');
        expect(result.section).toBe('A');
    });

    test('should return null for invalid email patterns', () => {
        const email = 'invalid-email@gmail.com';
        const result = extractStudentDetails(email);
        expect(result).toBeNull();
    });
});
