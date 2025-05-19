const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const moderationService = require('../../services/moderation.service');

const User = mongoose.model('User');
const Video = mongoose.model('Video');

const adminAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

// @route   GET /api/admin/users
// @desc    Get paginated list of all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
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
    console.error('Admin user fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/moderate
// @desc    Moderate user content
router.post('/moderate', adminAuth, async (req, res) => {
  try {
    const { contentId, contentType, action, reason } = req.body;
    
    let content;
    switch(contentType) {
      case 'video':
        content = await Video.findById(contentId);
        break;
      default:
        return res.status(400).json({ message: 'Invalid content type' });
    }

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Apply moderation action
    switch(action) {
      case 'approve':
        content.isApproved = true;
        content.moderationStatus = 'approved';
        break;
      case 'reject':
        content.isApproved = false;
        content.moderationStatus = 'rejected';
        content.moderationReason = reason;
        break;
      case 'remove':
        content.isRemoved = true;
        content.moderationStatus = 'removed';
        content.moderationReason = reason;
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    await content.save();
    res.json({ message: `Content ${action}d successfully` });
  } catch (err) {
    console.error('Moderation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users/:id/status
// @desc    Update user status (ban/suspend)
router.post('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { status, reason } = req.body;
    
    switch(status) {
      case 'active':
        user.isBanned = false;
        user.suspensionEnd = null;
        break;
      case 'banned':
        user.isBanned = true;
        user.banReason = reason;
        break;
      case 'suspended':
        user.suspensionEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        return res.status(400).json({ message: 'Invalid status' });
    }

    await user.save();
    res.json({ message: `User status updated to ${status}` });
  } catch (err) {
    console.error('User status update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;