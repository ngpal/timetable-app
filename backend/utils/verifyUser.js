import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export const verifyAdmin = (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized - no token found' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token is not valid or expired' });

    // Check if the role is Admin
    if (user.role !== 'Admin') {
      return res.status(403).json({ message: `Only Admins can perform this action. Your role: ${user.role}` });
    }

    req.user = user;
    next();
  });
};

export const verifyUser = (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized - no token found' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token is not valid or expired' });
    req.user = user;
    next();
  });
};