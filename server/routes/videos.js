const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const Video = require('../models/Video');
const { uploadToS3, generateThumbnail } = require('../services/storage');
const { executeCode } = require('../services/codeExecution');

const router = express.Router();

// Configure multer for video upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Not a video file'), false);
    }
  },
});

// @desc    Upload a new video
// @route   POST /api/videos
// @access  Private
router.post('/', protect, upload.single('video'), async (req, res) => {
  try {
    const { title, description, code, language, tags } = req.body;

    // Upload video to S3
    const videoUrl = await uploadToS3(req.file.buffer, 'videos');

    // Generate thumbnail
    const thumbnailUrl = await generateThumbnail(req.file.buffer);

    // Execute code and get output
    const output = await executeCode(code, language);

    // Create video in database
    const video = await Video.create({
      user: req.user._id,
      title,
      description,
      videoUrl,
      thumbnailUrl,
      code,
      language,
      output,
      tags: tags ? JSON.parse(tags) : [],
      duration: req.body.duration
    });

    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all videos
// @route   GET /api/videos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find()
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments();

    res.json({
      videos,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get video by ID
// @route   GET /api/videos/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Like/Unlike video
// @route   PUT /api/videos/:id/like
// @access  Private
router.put('/:id/like', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const likeIndex = video.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      video.likes.push(req.user._id);
    } else {
      video.likes.splice(likeIndex, 1);
    }

    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await video.remove();
    res.json({ message: 'Video removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;