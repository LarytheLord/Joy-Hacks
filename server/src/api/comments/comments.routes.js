const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Models
const Comment = mongoose.model('Comment', require('../../models/Comment'));
const Video = mongoose.model('Video', require('../../models/Video'));

// Middleware to check authentication
const auth = passport.authenticate('jwt', { session: false });

// @route   POST api/comments/:videoId
// @desc    Create a comment on a video
// @access  Private
router.post('/:videoId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const { videoId } = req.params;
    
    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Create new comment
    const newComment = new Comment({
      user: req.user.id,
      video: videoId,
      text
    });
    
    const comment = await newComment.save();
    
    // Populate user info
    await comment.populate('user', 'username name avatar');
    
    res.json(comment);
  } catch (err) {
    console.error('Error creating comment:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/comments/reply/:commentId
// @desc    Reply to a comment
// @access  Private
router.post('/reply/:commentId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const { commentId } = req.params;
    
    // Check if parent comment exists
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Create new reply comment
    const newReply = new Comment({
      user: req.user.id,
      video: parentComment.video,
      text,
      parentComment: commentId
    });
    
    const reply = await newReply.save();
    
    // Populate user info
    await reply.populate('user', 'username name avatar');
    
    res.json(reply);
  } catch (err) {
    console.error('Error creating reply:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/comments/video/:videoId
// @desc    Get comments for a video
// @access  Public
router.get('/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get top-level comments (no parent)
    const comments = await Comment.find({ 
      video: videoId,
      parentComment: { $exists: false }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username name avatar');
    
    // Get total count for pagination
    const total = await Comment.countDocuments({ 
      video: videoId,
      parentComment: { $exists: false }
    });
    
    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error getting comments:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/comments/replies/:commentId
// @desc    Get replies to a comment
// @access  Public
router.get('/replies/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get replies to the comment
    const replies = await Comment.find({ parentComment: commentId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username name avatar');
    
    // Get total count for pagination
    const total = await Comment.countDocuments({ parentComment: commentId });
    
    res.json({
      replies,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error getting replies:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    // Find comment
    let comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Update comment
    comment.text = text;
    comment.isEdited = true;
    
    await comment.save();
    
    res.json(comment);
  } catch (err) {
    console.error('Error updating comment:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check user (allow comment owner or video owner to delete)
    const video = await Video.findById(comment.video);
    
    if (comment.user.toString() !== req.user.id && video.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: req.params.id });
    
    // Delete the comment
    await comment.remove();
    
    res.json({ message: 'Comment removed' });
  } catch (err) {
    console.error('Error deleting comment:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/comments/like/:id
// @desc    Like a comment
// @access  Private
router.post('/like/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if the comment has already been liked by this user
    if (comment.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Comment already liked' });
    }
    
    // Add user id to likes array
    comment.likes.unshift(req.user.id);
    
    await comment.save();
    
    res.json(comment.likes);
  } catch (err) {
    console.error('Error liking comment:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/comments/unlike/:id
// @desc    Unlike a comment
// @access  Private
router.post('/unlike/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if the comment has not yet been liked by this user
    if (!comment.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Comment has not yet been liked' });
    }
    
    // Remove user id from likes array
    comment.likes = comment.likes.filter(like => like.toString() !== req.user.id);
    
    await comment.save();
    
    res.json(comment.likes);
  } catch (err) {
    console.error('Error unliking comment:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;