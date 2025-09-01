const mongoose = require('mongoose');

// User Progress Schema (for tracking user stats without requiring login)
const userProgressSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  userId: {
    type: String, // Optional: for future user accounts
    default: null
  },
  puzzleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Puzzle',
    required: true
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  bestTime: {
    type: Number // Time in seconds
  },
  bestMoves: {
    type: Number // Minimum number of moves to solve
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
userProgressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
userProgressSchema.index({ ip: 1, puzzleId: 1 }, { unique: true });
userProgressSchema.index({ ip: 1, collectionId: 1 });
userProgressSchema.index({ puzzleId: 1 });

module.exports = mongoose.model('UserProgress', userProgressSchema);
