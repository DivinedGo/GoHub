const mongoose = require('mongoose');

// Move Schema for puzzle variations
const moveSchema = new mongoose.Schema({
  row: {
    type: Number,
    required: true,
    min: 0,
    max: 18
  },
  col: {
    type: Number,
    required: true,
    min: 0,
    max: 18
  },
  color: {
    type: String,
    required: true,
    enum: ['black', 'white']
  },
  moveNumber: {
    type: Number,
    required: true
  }
}, { _id: false });

// Variation Schema
const variationSchema = new mongoose.Schema({
  moves: [moveSchema],
  correct: {
    type: Boolean,
    required: true
  },
  comment: {
    type: String,
    maxlength: 200
  }
}, { _id: false });

// Puzzle Schema
const puzzleSchema = new mongoose.Schema({
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
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  category: {
    type: String,
    required: true,
    enum: ['life-and-death', 'tesuji', 'endgame', 'opening', 'middle-game', 'capturing', 'connection', 'other'],
    default: 'life-and-death'
  },
  nextToPlay: {
    type: String,
    required: true,
    enum: ['black', 'white']
  },
  initialPosition: {
    type: [[String]], // 19x19 array, null for empty, 'black' or 'white' for stones
    required: true,
    validate: {
      validator: function(position) {
        return position.length === 19 && position.every(row => row.length === 19);
      },
      message: 'Initial position must be 19x19 array'
    }
  },
  variations: [variationSchema],
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
  attemptCount: {
    type: Number,
    default: 0
  },
  completedCount: {
    type: Number,
    default: 0
  },
  completedBy: [{
    ip: String,
    completedAt: { type: Date, default: Date.now },
    moves: Number
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
puzzleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
puzzleSchema.index({ collectionId: 1, createdAt: 1 });
puzzleSchema.index({ difficulty: 1 });
puzzleSchema.index({ category: 1 });

module.exports = mongoose.model('Puzzle', puzzleSchema);
