import { auth } from '../firebase.js';

/**
 * Middleware to verify Firebase authentication token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }
    
    // Verify token with Firebase Auth
    const decodedToken = await auth.verifyIdToken(token);
    
    // Add user data to request object
    req.user = decodedToken;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.admin === true) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Admin privileges required' });
  }
};