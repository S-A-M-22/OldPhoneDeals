// File: backend/src/middleware/authUser.js

import jwt from 'jsonwebtoken';

export function authUser(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({message: 'Access denied: no token provided.'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //receiving userId, email
        req.user = decoded;
        next();

    } catch(error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Session expired. Please log in again.' });
        }
        return res.status(403).json({ message: 'Invalid token.' });
    }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: `Access denied. ${role} only.` });
    }
    next();
  };
}