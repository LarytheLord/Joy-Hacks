import express from 'express';
import Video from '../models/Video.js';

const router = express.Router();

// Video upload endpoint
router.post('/upload', async (req, res) => {
  try {
    const { title, description, codeContent, videoUrl, userId } = req.body;
    
    const newVideo = new Video({
      title,
      description,
      codeContent,
      videoUrl,
      user: userId,
      likes: [],
      comments: []
    });

    await newVideo.save();
    res.status(201).json(newVideo);
  } catch (error) {
    res.status(400).json({ error: error.message });
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