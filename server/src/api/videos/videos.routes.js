const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

// Models
const Video = mongoose.model('Video', require('../../models/Video'));
const User = mongoose.model('User', require('../../models/User'));
const Comment = mongoose.model('Comment', require('../../models/Comment'));

// Middleware to check authentication
const auth = passport.authenticate('jwt', { session: false });

// Configure AWS S3 (in production, use environment variables)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Configure multer for video uploads
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME || 'joy-hacks-uploads',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `videos/${Date.now().toString()}-${file.originalname}`);
    }
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Not a video! Please upload a video file.'), false);
    }
  }
});

// Configure multer for thumbnail uploads
const uploadThumbnail = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME || 'joy-hacks-uploads',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `thumbnails/${Date.now().toString()}-${file.originalname}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for thumbnails
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image file for the thumbnail.'), false);
    }
  }
});

// @route   POST api/videos
// @desc    Upload a new video
// @access  Private
router.post('/', [
  auth,
  upload.single('video'),
  uploadThumbnail.single('thumbnail')
], async (req, res) => {
  try {
    const { title, description, code, programmingLanguage, output, hashtags, duration } = req.body;
    
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: 'Please upload a video file' });
    }
    
    // Create new video
    const newVideo = new Video({
      user: req.user.id,
      title,
      description,
      videoUrl: req.files.video[0].location,
      thumbnailUrl: req.files.thumbnail ? req.files.thumbnail[0].location : '', // Use default thumbnail if none provided
      code,
      programmingLanguage,
      output,
      hashtags: hashtags ? hashtags.split(',').map(tag => tag.trim()) : [],
      duration: parseInt(duration) || 60 // Default to max duration if not specified
    });
    
    const video = await newVideo.save();
    
    // Populate user info
    await video.populate('user', 'username name avatar');
    
    res.json(video);
  } catch (err) {
    console.error('Error uploading video:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/videos
// @desc    Get all videos (with pagination)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const videos = await Video.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username name avatar');
    
    const total = await Video.countDocuments({ isPublished: true });
    
    res.json({
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error getting videos:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/videos/trending
// @desc    Get trending videos based on views and likes
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Calculate trending score based on views and likes
    // This is a simple algorithm that can be improved
    const videos = await Video.aggregate([
      { $match: { isPublished: true } },
      { $addFields: {
        likesCount: { $size: "$likes" },
        // Trending score: (views * 0.7) + (likes * 1.5)
        trendingScore: { 
          $add: [
            { $multiply: ["$views", 0.7] },
            { $multiply: [{ $size: "$likes" }, 1.5] }
          ]
        }
      }},
      { $sort: { trendingScore: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);
    
    // Populate user info
    await Video.populate(videos, { path: 'user', select: 'username name avatar' });
    
    const total = await Video.countDocuments({ isPublished: true });
    
    res.json({
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error getting trending videos:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/videos/:id
// @desc    Get video by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('user', 'username name avatar')
      .populate({
        path: 'likes',
        select: 'username name avatar',
        options: { limit: 10 }
      });
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Increment view count
    video.views += 1;
    await video.save();
    
    res.json(video);
  } catch (err) {
    console.error('Error getting video:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/videos/:id
// @desc    Update video
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, hashtags, isPublished } = req.body;
    
    // Find video
    let video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check user
    if (video.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Update fields
    if (title) video.title = title;
    if (description) video.description = description;
    if (hashtags) video.hashtags = hashtags.split(',').map(tag => tag.trim());
    if (isPublished !== undefined) video.isPublished = isPublished;
    
    await video.save();
    
    res.json(video);
  } catch (err) {
    console.error('Error updating video:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/videos/:id
// @desc    Delete a video
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check user
    if (video.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Delete video from S3
    // Extract key from URL
    const videoKey = video.videoUrl.split('/').slice(-2).join('/');
    const thumbnailKey = video.thumbnailUrl.split('/').slice(-2).join('/');
    
    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME || 'joy-hacks-uploads',
      Delete: {
        Objects: [
          { Key: videoKey },
          { Key: thumbnailKey }
        ]
      }
    };
    
    // Delete from S3
    s3.deleteObjects(deleteParams, (err, data) => {
      if (err) console.error('Error deleting from S3:', err);
    });
    
    // Delete comments associated with the video
    await Comment.deleteMany({ video: req.params.id });
    
    // Delete video from database
    await video.remove();
    
    res.json({ message: 'Video removed' });
  } catch (err) {
    console.error('Error deleting video:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/videos/like/:id
// @desc    Like a video
// @access  Private
router.post('/like/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if the video has already been liked by this user
    if (video.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Video already liked' });
    }
    
    // Add user id to likes array
    video.likes.unshift(req.user.id);
    
    await video.save();
    
    res.json(video.likes);
  } catch (err) {
    console.error('Error liking video:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/videos/unlike/:id
// @desc    Unlike a video
// @access  Private
router.post('/unlike/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if the video has not yet been liked by this user
    if (!video.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Video has not yet been liked' });
    }
    
    // Remove user id from likes array
    video.likes = video.likes.filter(like => like.toString() !== req.user.id);
    
    await video.save();
    
    res.json(video.likes);
  } catch (err) {
    console.error('Error unliking video:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/videos/language/:lang
// @desc    Get videos by programming language
// @access  Public
router.get('/language/:lang', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const videos = await Video.find({ 
      programmingLanguage: req.params.lang,
      isPublished: true 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username name avatar');
    
    const total = await Video.countDocuments({ 
      programmingLanguage: req.params.lang,
      isPublished: true 
    });
    
    res.json({
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error getting videos by language:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/videos/hashtag/:tag
// @desc    Get videos by hashtag
// @access  Public
router.get('/hashtag/:tag', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const videos = await Video.find({ 
      hashtags: req.params.tag,
      isPublished: true 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username name avatar');
    
    const total = await Video.countDocuments({ 
      hashtags: req.params.tag,
      isPublished: true 
    });
    
    res.json({
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error getting videos by hashtag:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/videos/search/:query
// @desc    Search videos by title or description
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const videos = await Video.find({
      $and: [
        { isPublished: true },
        { $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { hashtags: { $regex: searchQuery, $options: 'i' } }
        ]}
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username name avatar');
    
    const total = await Video.countDocuments({
      $and: [
        { isPublished: true },
        { $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { hashtags: { $regex: searchQuery, $options: 'i' } }
        ]}
      ]
    });
    
    res.json({
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error searching videos:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;