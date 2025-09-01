const express = require('express');
const router = express.Router();
const Puzzle = require('../models/Puzzle');
const Collection = require('../models/Collection');
const UserProgress = require('../models/UserProgress');

// Get specific puzzle by ID
router.get('/:id', async (req, res) => {
  try {
    const puzzle = await Puzzle.findById(req.params.id);
    
    if (!puzzle) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    // Check if puzzle's collection is private
    const collection = await Collection.findById(puzzle.collectionId);
    if (collection && collection.private && !req.headers['x-admin-key']) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    res.json(puzzle);
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    res.status(500).json({ error: 'Failed to fetch puzzle' });
  }
});

// Update puzzle views
router.post('/:id/view', async (req, res) => {
  try {
    await Puzzle.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating views:', error);
    res.status(500).json({ error: 'Failed to update views' });
  }
});

// Like puzzle
router.post('/:id/like', async (req, res) => {
  try {
    const userIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    
    const puzzle = await Puzzle.findById(req.params.id);
    if (!puzzle) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    // Check if user already liked
    if (puzzle.likedBy.includes(userIp)) {
      return res.status(400).json({ error: 'Already liked' });
    }
    
    // Add like
    puzzle.likes += 1;
    puzzle.likedBy.push(userIp);
    await puzzle.save();
    
    res.json({ success: true, likes: puzzle.likes });
  } catch (error) {
    console.error('Error liking puzzle:', error);
    res.status(500).json({ error: 'Failed to like puzzle' });
  }
});

// Record puzzle attempt
router.post('/:id/attempt', async (req, res) => {
  try {
    const userIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const puzzleId = req.params.id;
    
    // Update puzzle attempt count
    await Puzzle.findByIdAndUpdate(puzzleId, { $inc: { attemptCount: 1 } });
    
    // Update or create user progress
    const puzzle = await Puzzle.findById(puzzleId);
    if (!puzzle) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    await UserProgress.findOneAndUpdate(
      { ip: userIp, puzzleId: puzzleId },
      {
        $inc: { attempts: 1 },
        collectionId: puzzle.collectionId,
        ip: userIp,
        puzzleId: puzzleId
      },
      { upsert: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording attempt:', error);
    res.status(500).json({ error: 'Failed to record attempt' });
  }
});

// Record puzzle completion
router.post('/:id/complete', async (req, res) => {
  try {
    const userIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const puzzleId = req.params.id;
    const { solved, moves, time } = req.body;
    
    const puzzle = await Puzzle.findById(puzzleId);
    if (!puzzle) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    if (solved) {
      // Update puzzle completion count
      await Puzzle.findByIdAndUpdate(puzzleId, { 
        $inc: { completedCount: 1 },
        $push: { 
          completedBy: { 
            ip: userIp, 
            moves: moves || 0,
            completedAt: new Date()
          }
        }
      });
      
      // Update user progress
      const progress = await UserProgress.findOneAndUpdate(
        { ip: userIp, puzzleId: puzzleId },
        {
          completed: true,
          completedAt: new Date(),
          $min: { bestMoves: moves || 999 },
          collectionId: puzzle.collectionId
        },
        { upsert: true, new: true }
      );
      
      // Update best time if provided
      if (time && (!progress.bestTime || time < progress.bestTime)) {
        progress.bestTime = time;
        await progress.save();
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording completion:', error);
    res.status(500).json({ error: 'Failed to record completion' });
  }
});

// Create new puzzle (admin only)
router.post('/', async (req, res) => {
  try {
    // Simple admin check
    if (!req.headers['x-admin-key'] || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Admin access required' });
    }
    
    const {
      name,
      description,
      collectionId,
      difficulty,
      category,
      nextToPlay,
      initialPosition,
      variations
    } = req.body;
    
    // Validate collection exists
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(400).json({ error: 'Collection not found' });
    }
    
    const puzzle = new Puzzle({
      name,
      description,
      collectionId,
      difficulty,
      category,
      nextToPlay,
      initialPosition,
      variations
    });
    
    await puzzle.save();
    
    // Add puzzle to collection
    collection.puzzles.push(puzzle._id);
    await collection.save();
    
    res.status(201).json(puzzle);
  } catch (error) {
    console.error('Error creating puzzle:', error);
    res.status(500).json({ error: 'Failed to create puzzle' });
  }
});

// Update puzzle (admin only)
router.put('/:id', async (req, res) => {
  try {
    // Simple admin check
    if (!req.headers['x-admin-key'] || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Admin access required' });
    }
    
    const puzzle = await Puzzle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!puzzle) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    res.json(puzzle);
  } catch (error) {
    console.error('Error updating puzzle:', error);
    res.status(500).json({ error: 'Failed to update puzzle' });
  }
});

// Delete puzzle (admin only)
router.delete('/:id', async (req, res) => {
  try {
    // Simple admin check
    if (!req.headers['x-admin-key'] || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Admin access required' });
    }
    
    const puzzle = await Puzzle.findById(req.params.id);
    if (!puzzle) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    // Remove puzzle from collection
    await Collection.findByIdAndUpdate(
      puzzle.collectionId,
      { $pull: { puzzles: puzzle._id } }
    );
    
    // Delete user progress for this puzzle
    await UserProgress.deleteMany({ puzzleId: req.params.id });
    
    // Delete the puzzle
    await Puzzle.findByIdAndDelete(req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting puzzle:', error);
    res.status(500).json({ error: 'Failed to delete puzzle' });
  }
});

module.exports = router;
