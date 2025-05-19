const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VideoSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  programmingLanguage: {
    type: String,
    required: true,
    enum: ['JavaScript', 'Python', 'C++', 'Java', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin', 'Other']
  },
  output: {
    type: String
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  hashtags: [{
    type: String,
    trim: true
  }],
  duration: {
    type: Number, // in seconds
    required: true,
    max: 60 // max 60 seconds
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
VideoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better search performance
VideoSchema.index({ programmingLanguage: 1 });
VideoSchema.index({ hashtags: 1 });
VideoSchema.index({ user: 1 });
VideoSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Video', VideoSchema);