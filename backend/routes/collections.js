const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const Puzzle = require('../models/Puzzle');
const UserProgress = require('../models/UserProgress');

// Get all public collections
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find({ private: false })
      .sort({ createdAt: -1 })
      .populate('puzzles', 'name difficulty');
    
    res.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Get specific collection by ID
router.get('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Don't return private collections to non-admin users
    if (collection.private && !req.headers['x-admin-key']) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    res.json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

// Get puzzles in a collection
router.get('/:id/puzzles', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Don't return private collections to non-admin users
    if (collection.private && !req.headers['x-admin-key']) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const puzzles = await Puzzle.find({ collectionId: req.params.id })
      .sort({ createdAt: 1 })
      .select('name description difficulty category views likes completedCount attemptCount createdAt');
    
    res.json(puzzles);
  } catch (error) {
    console.error('Error fetching puzzles:', error);
    res.status(500).json({ error: 'Failed to fetch puzzles' });
  }
});

// Get user progress for a collection
router.get('/:id/progress', async (req, res) => {
  try {
    const userIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    
    const progress = await UserProgress.find({
      collectionId: req.params.id,
      ip: userIp
    }).select('puzzleId attempts completed completedAt bestTime bestMoves');
    
    // Convert to object with puzzleId as key
    const progressObj = {};
    progress.forEach(p => {
      progressObj[p.puzzleId] = {
        attempts: p.attempts,
        completed: p.completed,
        completedAt: p.completedAt,
        bestTime: p.bestTime,
        bestMoves: p.bestMoves
      };
    });
    
    res.json(progressObj);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// Update collection views
router.post('/:id/view', async (req, res) => {
  try {
    await Collection.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating views:', error);
    res.status(500).json({ error: 'Failed to update views' });
  }
});

// Like collection
router.post('/:id/like', async (req, res) => {
  try {
    const userIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Check if user already liked
    if (collection.likedBy.includes(userIp)) {
      return res.status(400).json({ error: 'Already liked' });
    }
    
    // Add like
    collection.likes += 1;
    collection.likedBy.push(userIp);
    await collection.save();
    
    res.json({ success: true, likes: collection.likes });
  } catch (error) {
    console.error('Error liking collection:', error);
    res.status(500).json({ error: 'Failed to like collection' });
  }
});

// Create new collection (admin only)
router.post('/', async (req, res) => {
  try {
    // Simple admin check - in production, use proper authentication
    if (!req.headers['x-admin-key'] || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Admin access required' });
    }
    
    const {
      name,
      description,
      difficulty,
      private: isPrivate,
      colorTransform,
      positionTransform
    } = req.body;
    
    const collection = new Collection({
      name,
      description,
      difficulty,
      private: isPrivate,
      colorTransform,
      positionTransform
    });
    
    await collection.save();
    
    res.status(201).json(collection);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Update collection (admin only)
router.put('/:id', async (req, res) => {
  try {
    // Simple admin check
    if (!req.headers['x-admin-key'] || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Admin access required' });
    }
    
    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    res.json(collection);
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

// Delete collection (admin only)
router.delete('/:id', async (req, res) => {
  try {
    // Simple admin check
    if (!req.headers['x-admin-key'] || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Admin access required' });
    }
    
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Delete all puzzles in the collection
    await Puzzle.deleteMany({ collectionId: req.params.id });
    
    // Delete user progress for this collection
    await UserProgress.deleteMany({ collectionId: req.params.id });
    
    // Delete the collection
    await Collection.findByIdAndDelete(req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

module.exports = router;
