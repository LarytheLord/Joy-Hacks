import express from 'express';
import { auth } from '../firebase.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify token
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// User registration with Firebase
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: username
    });
    
    // Create user in Firestore
    const newUser = await User.create({
      uid: userRecord.uid,
      email,
      username,
      avatar: null,
      bio: ''
    });
    
    res.status(201).json({ uid: userRecord.uid })
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message || 'Failed to register user' });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message || 'Failed to get user' });
  }
});

// User login is handled by Firebase Authentication on the client side
// This endpoint is for custom token creation if needed
router.post('/token', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'UID is required' });
    }
    
    // Create custom token
    const customToken = await auth.createCustomToken(uid);
    res.json({ token: customToken });
  } catch (error) {
    console.error('Token creation error:', error);
    res.status(500).json({ error: error.message || 'Failed to create token' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { username, bio, avatar } = req.body;
    
    // Update user
    const updatedUser = await User.update(userId, {
      username,
      bio,
      avatar
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

export default router;