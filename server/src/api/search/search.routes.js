const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Models
const Video = mongoose.model('Video', require('../../models/Video'));
const User = mongoose.model('User', require('../../models/User'));

// @route   GET api/search
// @desc    Search videos, users, and hashtags
// @access  Public
router.get('/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Search videos
    const videos = await Video.find({
      $and: [
        { isPublished: true },
        { $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { hashtags: { $regex: searchQuery, $options: 'i' } },
          { programmingLanguage: { $regex: searchQuery, $options: 'i' } }
        ]}
      ]
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username name avatar');
    
    // Search users
    const users = await User.find({
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { name: { $regex: searchQuery, $options: 'i' } },
        { programmingLanguages: { $regex: searchQuery, $options: 'i' } }
      ]
    })
      .select('username name avatar bio programmingLanguages')
      .limit(5);
    
    // Get trending hashtags that match the query
    const hashtagResults = await Video.aggregate([
      { $match: { isPublished: true } },
      { $unwind: "$hashtags" },
      { $match: { hashtags: { $regex: searchQuery, $options: 'i' } } },
      { $group: {
        _id: "$hashtags",
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const hashtags = hashtagResults.map(tag => ({
      name: tag._id,
      count: tag.count
    }));
    
    res.json({
      videos,
      users,
      hashtags
    });
  } catch (err) {
    console.error('Error searching:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/search/trending/hashtags
// @desc    Get trending hashtags
// @access  Public
router.get('/trending/hashtags', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const hashtagResults = await Video.aggregate([
      { $match: { isPublished: true } },
      { $unwind: "$hashtags" },
      { $group: {
        _id: "$hashtags",
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
    
    const hashtags = hashtagResults.map(tag => ({
      name: tag._id,
      count: tag.count
    }));
    
    res.json(hashtags);
  } catch (err) {
    console.error('Error getting trending hashtags:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/search/trending/languages
// @desc    Get trending programming languages
// @access  Public
router.get('/trending/languages', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const languageResults = await Video.aggregate([
      { $match: { isPublished: true } },
      { $group: {
        _id: "$programmingLanguage",
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
    
    const languages = languageResults.map(lang => ({
      name: lang._id,
      count: lang.count
    }));
    
    res.json(languages);
  } catch (err) {
    console.error('Error getting trending languages:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/search/trending/creators
// @desc    Get trending creators
// @access  Public
router.get('/trending/creators', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Find users with most followers
    const users = await User.aggregate([
      { $project: {
        username: 1,
        name: 1,
        avatar: 1,
        followersCount: { $size: "$followers" }
      }},
      { $sort: { followersCount: -1 } },
      { $limit: limit }
    ]);
    
    res.json(users);
  } catch (err) {
    console.error('Error getting trending creators:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/search/recommendations
// @desc    Get personalized video recommendations
// @access  Private
router.get('/recommendations', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = req.user;
    
    // Get user's preferred programming languages
    const userLanguages = user.programmingLanguages || [];
    
    // Get videos from users the current user is following
    const followingVideos = await Video.find({
      user: { $in: user.following },
      isPublished: true
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username name avatar');
    
    // Get videos with user's preferred programming languages
    const languageVideos = await Video.find({
      programmingLanguage: { $in: userLanguages },
      user: { $ne: user._id }, // Exclude user's own videos
      isPublished: true
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username name avatar');
    
    // Get trending videos
    const trendingVideos = await Video.aggregate([
      { $match: { 
        isPublished: true,
        user: { $ne: mongoose.Types.ObjectId(user._id) } // Exclude user's own videos
      }},
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
      { $limit: 5 }
    ]);
    
    // Populate user info for trending videos
    await Video.populate(trendingVideos, { path: 'user', select: 'username name avatar' });
    
    res.json({
      followingVideos,
      languageVideos,
      trendingVideos
    });
  } catch (err) {
    console.error('Error getting recommendations:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;