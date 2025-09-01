const mongoose = require('mongoose');

// Collection Schema
const collectionSchema = new mongoose.Schema({
  name: {
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
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  private: {
    type: Boolean,
    default: false
  },
  colorTransform: {
    type: Boolean,
    default: false
  },
  positionTransform: {
    type: Boolean,
    default: false
  },
  author: {
    type: String,
    default: 'Admin'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String // IP addresses or user IDs
  }],
  puzzles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Puzzle'
  }],
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
collectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Collection', collectionSchema);
