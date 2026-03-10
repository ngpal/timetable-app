/**
 * Extracts student roll number details from Amrita email.
 * Pattern: cb.en.u4cse21341@cb.students.amrita.edu or similar
 */
export const extractStudentDetails = (email) => {
    // Regex to match the roll number part before the @
    // Example: cb.en.u4cse21341
    const match = email.split('@')[0];
    
    // Extract last 3 digits
    const digitsMatch = match.match(/(\d{3})$/);
    if (!digitsMatch) return null;

    const rollNumber = parseInt(digitsMatch[1]);
    
    // Section Mapping (Draft logic)
    // 001-085 (A), 086-170 (B), 171-255 (C), 256-341 (D)
    let section = 'A';
    if (rollNumber >= 1 && rollNumber <= 85) section = 'A';
    else if (rollNumber >= 86 && rollNumber <= 170) section = 'B';
    else if (rollNumber >= 171 && rollNumber <= 255) section = 'C';
    else if (rollNumber >= 256) section = 'D';

    // Extract department from email
    // Example: cb.en.u4cse21341 -> CSE
    const deptMatch = match.match(/[a-z]{3}(?=\d)/i);
    let department = deptMatch ? deptMatch[0].toUpperCase() : 'CSE';

    return { rollNumber, section, department };
};
