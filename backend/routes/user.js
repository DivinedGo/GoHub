const express = require('express');
const router = express.Router();
const UserProgress = require('../models/UserProgress');
const Puzzle = require('../models/Puzzle');
const Collection = require('../models/Collection');

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const userIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    
    // Get user's progress
    const userProgress = await UserProgress.find({ ip: userIp });
    
    const totalSolved = userProgress.filter(p => p.completed).length;
    const totalAttempts = userProgress.reduce((sum, p) => sum + p.attempts, 0);
    
    // Get unique collections the user has attempted
    const collectionIds = [...new Set(userProgress.map(p => p.collectionId.toString()))];
    const collectionsCompleted = [];
    
    for (let collectionId of collectionIds) {
      const collectionProgress = userProgress.filter(p => p.collectionId.toString() === collectionId);
      const collectionPuzzles = await Puzzle.countDocuments({ collectionId });
      const completedInCollection = collectionProgress.filter(p => p.completed).length;
      
      if (completedInCollection === collectionPuzzles && collectionPuzzles > 0) {
        collectionsCompleted.push(collectionId);
      }
    }
    
    res.json({
      totalSolved,
      totalAttempts,
      collectionsCompleted: collectionsCompleted.length,
      averageRating: 0 // Placeholder for future rating system
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get user's progress for a specific collection
router.get('/progress/:collectionId', async (req, res) => {
  try {
    const userIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const collectionId = req.params.collectionId;
    
    const progress = await UserProgress.find({
      ip: userIp,
      collectionId: collectionId
    }).populate('puzzleId', 'name difficulty category');
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// Get user's recent activity
router.get('/activity', async (req, res) => {
  try {
    const userIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const limit = parseInt(req.query.limit) || 20;
    
    const recentActivity = await UserProgress.find({ ip: userIp })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('puzzleId', 'name difficulty')
      .populate('collectionId', 'name');
    
    res.json(recentActivity);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

// Get user's achievements/milestones
router.get('/achievements', async (req, res) => {
  try {
    const userIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    
    const progress = await UserProgress.find({ ip: userIp });
    const totalSolved = progress.filter(p => p.completed).length;
    const totalAttempts = progress.reduce((sum, p) => sum + p.attempts, 0);
    
    // Calculate achievements
    const achievements = [];
    
    // Solving milestones
    const solvingMilestones = [1, 5, 10, 25, 50, 100, 200, 500];
    for (let milestone of solvingMilestones) {
      if (totalSolved >= milestone) {
        achievements.push({
          type: 'solving',
          title: `${milestone} Puzzles Solved`,
          description: `You have solved ${milestone} puzzles!`,
          unlocked: true,
          unlockedAt: null // Would need to track this properly
        });
      }
    }
    
    // Perfect solver (100% success rate with at least 10 attempts)
    if (totalAttempts >= 10 && totalSolved === totalAttempts) {
      achievements.push({
        type: 'perfect',
        title: 'Perfect Solver',
        description: 'Solved every puzzle on the first try!',
        unlocked: true
      });
    }
    
    // Category specialist achievements
    const categoryProgress = {};
    for (let p of progress) {
      if (p.completed && p.puzzleId) {
        const puzzle = await Puzzle.findById(p.puzzleId).select('category');
        if (puzzle) {
          categoryProgress[puzzle.category] = (categoryProgress[puzzle.category] || 0) + 1;
        }
      }
    }
    
    Object.entries(categoryProgress).forEach(([category, count]) => {
      if (count >= 10) {
        achievements.push({
          type: 'category',
          title: `${category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Master`,
          description: `Solved ${count} ${category} puzzles`,
          unlocked: true
        });
      }
    });
    
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Get personalized recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const userIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    
    const userProgress = await UserProgress.find({ ip: userIp });
    const completedPuzzleIds = userProgress.filter(p => p.completed).map(p => p.puzzleId);
    
    // Get user's average difficulty
    const completedPuzzles = await Puzzle.find({ 
      _id: { $in: completedPuzzleIds } 
    }).select('difficulty category');
    
    const avgDifficulty = completedPuzzles.length > 0 
      ? Math.round(completedPuzzles.reduce((sum, p) => sum + p.difficulty, 0) / completedPuzzles.length)
      : 3; // Default to intermediate
    
    // Get user's preferred categories
    const categoryCount = {};
    completedPuzzles.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });
    
    const preferredCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b, 'life-and-death');
    
    // Find recommended puzzles
    const recommendations = await Puzzle.find({
      _id: { $nin: completedPuzzleIds },
      $or: [
        { difficulty: { $gte: avgDifficulty - 1, $lte: avgDifficulty + 1 } },
        { category: preferredCategory }
      ]
    })
    .populate('collectionId', 'name private')
    .select('name difficulty category collectionId views likes')
    .sort({ views: -1, likes: -1 })
    .limit(10);
    
    // Filter out private collections
    const filteredRecommendations = recommendations.filter(p => 
      !p.collectionId.private
    );
    
    res.json(filteredRecommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

module.exports = router;
