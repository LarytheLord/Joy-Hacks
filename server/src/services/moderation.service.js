const axios = require('axios');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { logger } = require('../utils/logger');

// Configure rate limiting for moderation API calls
const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 1, // per second
});

class ModerationService {
  constructor() {
    this.cache = new Map();
  }

  async moderateText(content) {
    try {
      await rateLimiter.consume('text_moderation');
      
      // Cache check to avoid duplicate moderation
      const hash = this.hashContent(content);
      if (this.cache.has(hash)) {
        return this.cache.get(hash);
      }

      const response = await axios.post(
        'https://api.openai.com/v1/moderations',
        { input: content },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data.results[0];
      this.cache.set(hash, result);
      
      return {
        flagged: result.flagged,
        categories: result.categories,
        scores: result.category_scores
      };
    } catch (error) {
      logger.error('Text moderation failed:', error);
      return { error: 'Content moderation service unavailable' };
    }
  }

  async moderateImage(imageUrl) {
    try {
      await rateLimiter.consume('image_moderation');
      
      const response = await axios.post(
        'https://vision.googleapis.com/v1/images:annotate',
        {
          requests: [{
            image: { source: { imageUri: imageUrl } },
            features: [{ type: 'SAFE_SEARCH_DETECTION' }]
          }]
        },
        { params: { key: process.env.GOOGLE_API_KEY } }
      );

      const result = response.data.responses[0].safeSearchAnnotation;
      return {
        adult: result.adult,
        violence: result.violence,
        medical: result.medical,
        spoof: result.spoof,
        racy: result.racy
      };
    } catch (error) {
      logger.error('Image moderation failed:', error);
      return { error: 'Image moderation service unavailable' };
    }
  }

  async moderateVideo(videoUrl) {
    // Implementation for video moderation using cloud provider APIs
    // This would typically involve analyzing video frames and audio
    return { pending: true }; // Return placeholder for async processing
  }

  hashContent(content) {
    // Simple content hashing for cache
    return Buffer.from(content).toString('base64').slice(0, 64);
  }
}

module.exports = new ModerationService();