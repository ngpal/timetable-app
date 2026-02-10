import User from '../models/user.js';
import Faculty from '../models/faculty.js';
import jwt from 'jsonwebtoken';

// Helper: Extract department from Amrita email
const extractDepartment = (email) => {
  const match = email.match(/^([a-z]+)_/i);
  if (match) {
    const dept = match[1].toUpperCase();
    const deptMap = {
      'CSE': 'Computer Science',
      'ECE': 'Electronics and Communication',
      'EEE': 'Electrical and Electronics',
      'ME': 'Mechanical',
      'CE': 'Civil',
      'CHE': 'Chemical',
      'AE': 'Aerospace',
      'IT': 'Information Technology'
    };
    return deptMap[dept] || dept;
  }
  return 'General';
};

// Admin email list (Amrita Coimbatore)
const ADMIN_EMAILS = [
  'leela592023@gmail.com',
  'p3208470@gmail.com'
];

export const login = async (req, res) => {
  const { name, email, avatar } = req.body;
  
  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Determine Role based on Amrita email pattern
      let assignedRole = 'Faculty'; // Default for @cb.amrita.edu
      
      // Amrita student email patterns
      if (email.includes('.students.amrita.edu')) {
        assignedRole = 'Student'; // Pattern: cb.sc.u4xxx@cb.students.amrita.edu
      }
      
      // Amrita faculty email patterns
      else if (email.endsWith('@cb.amrita.edu') || email.endsWith('@amrita.edu')) {
        assignedRole = 'Faculty';
      }
      
      // Check admin list
      if (ADMIN_EMAILS.includes(email)) {
        assignedRole = 'Admin';
      }

      // Create user
      user = await User.create({ 
        name, 
        email, 
        role: assignedRole 
      });

      // Auto-create Faculty profile for faculty users
      if (assignedRole === 'Faculty') {
        const department = extractDepartment(email);
        
        try {
          await Faculty.create({
            userId: user._id,
            name: name,
            email: email,
            department: department,
            designation: 'Assistant Professor', // Default
            facultyType: 'Full-time',
            workConstraints: {
              maxHoursPerWeek: 40,
              maxHoursPerDay: 6,
              maxConsecutiveHours: 3,
              availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            }
          });
          console.log(`✅ Auto-created faculty profile for ${name} (${department})`);
        } catch (facultyError) {
          console.error('Error creating faculty profile:', facultyError.message);
          // Continue even if faculty creation fails
        }
      }
    }

    // Generate JWT token with expiration
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Set secure cookie
    res.cookie('access_token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    .status(200)
    .json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout endpoint
export const logout = async (req, res) => {
  try {
    res.clearCookie('access_token')
       .status(200)
       .json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};