import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Video from '../models/Video.js';
import User from '../models/User.js';
import { storage } from '../firebase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for video uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueId}${extension}`);
  }
});

const upload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, MOV, and AVI videos are allowed.'));
    }
  }
});

// Video upload endpoint
router.post('/upload', verifyToken, upload.single('videoFile'), async (req, res) => {
  try {
    const { title, description, codeContent, language } = req.body;
    const userId = req.user.uid;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    
    // Get video file path
    const videoUrl = `/uploads/${req.file.filename}`;
    
    // Create video document in Firestore
    const newVideo = await Video.create({
      title,
      description,
      codeContent,
      language,
      videoUrl,
      userId,
      userName: req.user.name || 'Anonymous',
      userAvatar: req.user.picture || null
    });
    
    res.status(201).json(newVideo);
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(400).json({ error: error.message || 'Failed to upload video' });
  }
});

// Get video feed
router.get('/feed', async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load feed' });
  }
});

// Like/unlike video
router.post('/:id/like', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    const userId = req.body.userId;

    const index = video.likes.indexOf(userId);
    if (index === -1) {
      video.likes.push(userId);
    } else {
      video.likes.splice(index, 1);
    }

    await video.save();
    res.json(video);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;