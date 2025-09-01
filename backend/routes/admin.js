const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const Puzzle = require('../models/Puzzle');
const UserProgress = require('../models/UserProgress');

// Middleware to check admin access
const requireAdmin = (req, res, next) => {
  if (!req.headers['x-admin-key'] || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Admin access required' });
  }
  next();
};

// Get all collections (including private ones)
router.get('/collections', requireAdmin, async (req, res) => {
  try {
    const collections = await Collection.find()
      .sort({ createdAt: -1 })
      .populate('puzzles', 'name difficulty');
    
    res.json(collections);
  } catch (error) {
    console.error('Error fetching admin collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Get all puzzles for admin
router.get('/puzzles', requireAdmin, async (req, res) => {
  try {
    const puzzles = await Puzzle.find()
      .sort({ createdAt: -1 })
      .populate('collectionId', 'name')
      .select('name description difficulty category collectionId views likes completedCount attemptCount createdAt');
    
    res.json(puzzles);
  } catch (error) {
    console.error('Error fetching admin puzzles:', error);
    res.status(500).json({ error: 'Failed to fetch puzzles' });
  }
});

// Get admin statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    // Get basic counts
    const totalCollections = await Collection.countDocuments();
    const totalPuzzles = await Puzzle.countDocuments();
    const totalProgress = await UserProgress.countDocuments();
    
    // Get completion stats
    const completionStats = await UserProgress.aggregate([
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: '$attempts' },
          totalCompleted: { $sum: { $cond: ['$completed', 1, 0] } },
          uniqueUsers: { $addToSet: '$ip' }
        }
      }
    ]);
    
    const stats = completionStats[0] || { totalAttempts: 0, totalCompleted: 0, uniqueUsers: [] };
    const totalUsers = stats.uniqueUsers.length;
    const averageSuccessRate = stats.totalAttempts > 0 
      ? Math.round((stats.totalCompleted / stats.totalAttempts) * 100) 
      : 0;
    
    // Get most popular collections
    const popularCollections = await Collection.find()
      .sort({ views: -1, likes: -1 })
      .limit(5)
      .select('name views likes');
    
    // Get puzzle difficulty distribution
    const difficultyDistribution = await Puzzle.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get category distribution
    const categoryDistribution = await Puzzle.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalCollections,
      totalPuzzles,
      totalUsers,
      totalAttempts: stats.totalAttempts,
      totalSolved: stats.totalCompleted,
      averageSuccessRate,
      popularCollections,
      difficultyDistribution,
      categoryDistribution
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get detailed collection statistics
router.get('/collections/:id/stats', requireAdmin, async (req, res) => {
  try {
    const collectionId = req.params.id;
    
    // Get collection info
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Get puzzles in collection
    const puzzles = await Puzzle.find({ collectionId })
      .select('name difficulty views likes completedCount attemptCount');
    
    // Get user progress for this collection
    const userProgress = await UserProgress.find({ collectionId })
      .select('ip attempts completed completedAt bestMoves');
    
    // Calculate stats
    const totalPuzzles = puzzles.length;
    const totalViews = puzzles.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = puzzles.reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalAttempts = puzzles.reduce((sum, p) => sum + (p.attemptCount || 0), 0);
    const totalCompleted = puzzles.reduce((sum, p) => sum + (p.completedCount || 0), 0);
    
    const uniqueUsers = [...new Set(userProgress.map(p => p.ip))].length;
    const completedUsers = [...new Set(userProgress.filter(p => p.completed).map(p => p.ip))].length;
    
    res.json({
      collection: {
        name: collection.name,
        views: collection.views,
        likes: collection.likes
      },
      totalPuzzles,
      totalViews,
      totalLikes,
      totalAttempts,
      totalCompleted,
      uniqueUsers,
      completedUsers,
      completionRate: totalAttempts > 0 ? Math.round((totalCompleted / totalAttempts) * 100) : 0,
      puzzleStats: puzzles.map(p => ({
        name: p.name,
        difficulty: p.difficulty,
        views: p.views || 0,
        likes: p.likes || 0,
        attempts: p.attemptCount || 0,
        completed: p.completedCount || 0,
        successRate: (p.attemptCount || 0) > 0 ? Math.round(((p.completedCount || 0) / (p.attemptCount || 0)) * 100) : 0
      }))
    });
  } catch (error) {
    console.error('Error fetching collection stats:', error);
    res.status(500).json({ error: 'Failed to fetch collection statistics' });
  }
});

// Get user activity (recent attempts/completions)
router.get('/activity', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    // Get recent progress updates
    const recentActivity = await UserProgress.find()
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('puzzleId', 'name')
      .populate('collectionId', 'name')
      .select('ip attempts completed completedAt updatedAt puzzleId collectionId');
    
    res.json(recentActivity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Clean up old data (admin utility)
router.delete('/cleanup', requireAdmin, async (req, res) => {
  try {
    const daysOld = parseInt(req.query.days) || 30;
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    // Remove old user progress entries without completion
    const result = await UserProgress.deleteMany({
      completed: false,
      updatedAt: { $lt: cutoffDate }
    });
    
    res.json({ 
      success: true, 
      deletedEntries: result.deletedCount,
      message: `Cleaned up ${result.deletedCount} old progress entries older than ${daysOld} days`
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ error: 'Failed to perform cleanup' });
  }
});

// Export data (admin utility)
router.get('/export', requireAdmin, async (req, res) => {
  try {
    const type = req.query.type || 'all';
    
    let data = {};
    
    if (type === 'all' || type === 'collections') {
      data.collections = await Collection.find().lean();
    }
    
    if (type === 'all' || type === 'puzzles') {
      data.puzzles = await Puzzle.find().lean();
    }
    
    if (type === 'all' || type === 'progress') {
      data.userProgress = await UserProgress.find().lean();
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="gopuzzles-export-${Date.now()}.json"`);
    res.json(data);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router;
