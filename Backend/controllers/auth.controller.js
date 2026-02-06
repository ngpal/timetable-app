import User from '../models/user.js';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { name, email, avatar } = req.body;
  
  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Determine Role based on email pattern
      let assignedRole = 'Faculty'; // Default for @cb.amrita.edu
      
      if (email.includes('.students.')) {
        assignedRole = 'Student'; // Pattern: cb.sc.u4... @cb.students.amrita.edu
      }

      if (email === 'leela592023@gmail.com') {
        assignedRole = 'Admin';
      }

      user = await User.create({ 
        name, 
        email, 
        role: assignedRole 
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET
    );

    res.cookie('access_token', token, { httpOnly: true })
       .status(200)
       .json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};