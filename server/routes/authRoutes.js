import express from 'express';
import { getAuth } from 'firebase-admin/auth';
import User from '../models/User.js';

const router = express.Router();

// User registration with Firebase
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Create Firebase user
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: username
    });

    // Create local user profile
    const newUser = new User({
      uid: userRecord.uid,
      username,
      email,
      bio: '',
      avatar: '',
      languages: []
    });

    await newUser.save();
    res.status(201).json({ uid: userRecord.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  // Authentication handled by Firebase client SDK
  res.json({ success: true });
});

export default router;