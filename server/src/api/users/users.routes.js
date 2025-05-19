const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

// Models
const User = mongoose.model('User', require('../../models/User'));
const Video = mongoose.model('Video', require('../../models/Video'));

// Middleware to check authentication
const auth = passport.authenticate('jwt', { session: false });

// Configure AWS S3 (in production, use environment variables)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Configure multer for file uploads
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME || 'joy-hacks-uploads',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `avatars/${Date.now().toString()}-${file.originalname}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// @route   GET api/users
// @desc    Get all users (with pagination)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments();
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error getting users:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error getting user:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, programmingLanguages } = req.body;
    
    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (bio) profileFields.bio = bio;
    if (programmingLanguages) profileFields.programmingLanguages = programmingLanguages;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
    
    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.put('/avatar', [auth, upload.single('avatar')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }
    
    // Update user with new avatar URL
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { avatar: req.file.location } },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
    
    res.json(user);
  } catch (err) {
    console.error('Error uploading avatar:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users/:id/videos
// @desc    Get videos by user ID
// @access  Public
router.get('/:id/videos', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const videos = await Video.find({ user: req.params.id, isPublished: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username name avatar');
    
    const total = await Video.countDocuments({ user: req.params.id, isPublished: true });
    
    res.json({
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error getting user videos:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/users/follow/:id
// @desc    Follow a user
// @access  Private
router.post('/follow/:id', auth, async (req, res) => {
  try {
    // Check if user exists
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already following
    if (userToFollow.followers.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already following this user' });
    }
    
    // Check if trying to follow self
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    
    // Add to following list of current user
    await User.findByIdAndUpdate(req.user.id, {
      $push: { following: req.params.id }
    });
    
    // Add to followers list of target user
    await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.user.id }
    });
    
    res.json({ message: 'User followed successfully' });
  } catch (err) {
    console.error('Error following user:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/users/unfollow/:id
// @desc    Unfollow a user
// @access  Private
router.post('/unfollow/:id', auth, async (req, res) => {
  try {
    // Check if user exists
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if actually following
    if (!userToUnfollow.followers.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }
    
    // Remove from following list of current user
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { following: req.params.id }
    });
    
    // Remove from followers list of target user
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user.id }
    });
    
    res.json({ message: 'User unfollowed successfully' });
  } catch (err) {
    console.error('Error unfollowing user:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users/:id/followers
// @desc    Get user followers
// @access  Public
router.get('/:id/followers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const user = await User.findById(req.params.id)
      .populate({
        path: 'followers',
        select: 'username name avatar bio',
        options: {
          limit: limit,
          skip: skip,
          sort: { createdAt: -1 }
        }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const total = user.followers.length;
    
    res.json({
      followers: user.followers,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error getting followers:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users/:id/following
// @desc    Get users that a user is following
// @access  Public
router.get('/:id/following', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const user = await User.findById(req.params.id)
      .populate({
        path: 'following',
        select: 'username name avatar bio',
        options: {
          limit: limit,
          skip: skip,
          sort: { createdAt: -1 }
        }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const total = user.following.length;
    
    res.json({
      following: user.following,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error getting following:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users/search/:query
// @desc    Search users by username or name
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find({
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { name: { $regex: searchQuery, $options: 'i' } }
      ]
    })
    .select('username name avatar bio programmingLanguages')
    .skip(skip)
    .limit(limit);
    
    const total = await User.countDocuments({
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { name: { $regex: searchQuery, $options: 'i' } }
      ]
    });
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error searching users:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;