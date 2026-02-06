import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export const verifyAdmin = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Unauthorized");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json("Token is not valid");
    
    // Check if the role is Admin
    if (user.role !== 'Admin') {
      return res.status(403).json("Only Admins can perform this action");
    }
    
    req.user = user;
    next();
  });
};