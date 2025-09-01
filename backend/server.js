const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gopuzzles', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Import routes
const collectionRoutes = require('./routes/collections');
const puzzleRoutes = require('./routes/puzzles');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

// API routes
app.use('/api/collections', collectionRoutes);
app.use('/api/puzzles', puzzleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Serve HTML files for routes (for Vercel routing)
app.get('/puzzles', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/puzzles.html'));
});

app.get('/puzzle-collections/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/puzzle-collection.html'));
});

app.get('/puzzles/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/puzzle.html'));
});

app.get('/puzzlesadmin27988794', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/puzzlesadmin27988794.html'));
});

app.get('/puzzlesadmincreate27988794', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/puzzlesadmincreate27988794.html'));
});

// Catch all handler for SPA routing
app.get('*', (req, res) => {
  // Check if it's an API route
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // Serve the main page for other routes
  res.sendFile(path.join(__dirname, '../frontend/puzzles.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
