import { db } from '../firebase.js';

const videosCollection = db.collection('videos');

const Video = {
  /**
   * Create a new video in Firestore
   * @param {Object} videoData - Video data including title, description, etc.
   * @returns {Object} Created video with ID
   */
  async create(videoData) {
    const docRef = await videosCollection.add({
      ...videoData,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: [],
      comments: []
    });
    return { id: docRef.id, ...videoData };
  },

  /**
   * Get a video by ID
   * @param {string} videoId - Video ID
   * @returns {Object|null} Video object or null if not found
   */
  async getById(videoId) {
    const doc = await videosCollection.doc(videoId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  /**
   * Update a video
   * @param {string} videoId - Video ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated video
   */
  async update(videoId, updateData) {
    await videosCollection.doc(videoId).update({
      ...updateData,
      updatedAt: new Date()
    });
    return this.getById(videoId);
  },

  /**
   * Get all videos for the feed
   * @returns {Array} Array of videos
   */
  async getFeed() {
    const snapshot = await videosCollection.orderBy('createdAt', 'desc').limit(20).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Like or unlike a video
   * @param {string} videoId - Video ID
   * @param {string} userId - User ID
   * @returns {Object} Updated video
   */
  async toggleLike(videoId, userId) {
    const video = await this.getById(videoId);
    if (!video) throw new Error('Video not found');
    
    const likes = video.likes || [];
    const index = likes.indexOf(userId);
    
    if (index === -1) {
      likes.push(userId);
    } else {
      likes.splice(index, 1);
    }
    
    return this.update(videoId, { likes });
  },

  /**
   * Add a comment to a video
   * @param {string} videoId - Video ID
   * @param {Object} comment - Comment object with userId, text, etc.
   * @returns {Object} Updated video
   */
  async addComment(videoId, comment) {
    const video = await this.getById(videoId);
    if (!video) throw new Error('Video not found');
    
    const comments = video.comments || [];
    comments.push({
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date()
    });
    
    return this.update(videoId, { comments });
  }
};

export default Video;