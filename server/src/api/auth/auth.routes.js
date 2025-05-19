const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User', require('../../models/User'));

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      name: name || username
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Create JWT payload
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'joy-hacks-secret-key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token: `Bearer ${token}`,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            avatar: user.avatar
          }
        });
      }
    );
  } catch (err) {
    console.error('Error in register:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/login
// @desc    Login user and return JWT token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'joy-hacks-secret-key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token: `Bearer ${token}`,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            avatar: user.avatar
          }
        });
      }
    );
  } catch (err) {
    console.error('Error in login:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/current
// @desc    Return current user
// @access  Private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      name: req.user.name,
      bio: req.user.bio,
      avatar: req.user.avatar,
      programmingLanguages: req.user.programmingLanguages,
      followers: req.user.followers,
      following: req.user.following
    });
  }
);

// @route   POST api/auth/google
// @desc    Google OAuth login/register
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { token, profile } = req.body;
    
    // Verify token with Firebase or Google API in a real implementation
    // For now, we'll assume the token is valid and use the profile data
    
    // Check if user exists
    let user = await User.findOne({ email: profile.email });
    
    if (user) {
      // User exists, update provider info if needed
      if (user.provider !== 'google') {
        user.provider = 'google';
        user.providerId = profile.id;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        username: `user_${Math.floor(Math.random() * 10000)}`, // Generate a random username
        email: profile.email,
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Random password
        name: profile.name,
        avatar: profile.picture,
        provider: 'google',
        providerId: profile.id,
        isVerified: true // Google accounts are already verified
      });
      
      await user.save();
    }
    
    // Create JWT payload
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email
    };
    
    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'joy-hacks-secret-key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token: `Bearer ${token}`,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            avatar: user.avatar
          }
        });
      }
    );
  } catch (err) {
    console.error('Error in Google auth:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/github
// @desc    GitHub OAuth login/register
// @access  Public
router.post('/github', async (req, res) => {
  try {
    const { token, profile } = req.body;
    
    // Verify token with GitHub API in a real implementation
    // For now, we'll assume the token is valid and use the profile data
    
    // Check if user exists by providerId since GitHub might not provide email
    let user = await User.findOne({ 
      $or: [
        { email: profile.email },
        { providerId: profile.id, provider: 'github' }
      ]
    });
    
    if (user) {
      // User exists, update provider info if needed
      if (user.provider !== 'github') {
        user.provider = 'github';
        user.providerId = profile.id;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        username: profile.login || `user_${Math.floor(Math.random() * 10000)}`,
        email: profile.email || `${profile.login}@github.user`, // Use GitHub username if email not provided
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Random password
        name: profile.name || profile.login,
        avatar: profile.avatar_url,
        provider: 'github',
        providerId: profile.id,
        isVerified: true // GitHub accounts are already verified
      });
      
      await user.save();
    }
    
    // Create JWT payload
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email
    };
    
    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'joy-hacks-secret-key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token: `Bearer ${token}`,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            avatar: user.avatar
          }
        });
      }
    );
  } catch (err) {
    console.error('Error in GitHub auth:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Set token and expiration
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();
    
    // In a real app, send email with reset link
    // For now, just return the token
    res.json({ 
      message: 'Password reset email sent',
      // In production, don't send the token in the response
      // This is just for development
      resetToken 
    });
  } catch (err) {
    console.error('Error in forgot password:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Find user by reset token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    res.json({ message: 'Password has been reset' });
  } catch (err) {
    console.error('Error in reset password:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;