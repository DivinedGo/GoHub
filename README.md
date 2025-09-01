# Go Puzzle Website

A comprehensive Go (Weiqi) puzzle platform with admin functionality for creating and managing puzzle collections.

## Features

### User Features
- Browse puzzle collections by difficulty and category
- Interactive Go board with proper coordinates and star points
- Solve puzzles with real-time feedback
- Track progress and statistics
- Like puzzles and collections
- Responsive design for mobile and desktop

### Admin Features
- Create and manage puzzle collections
- Interactive puzzle creation with Go board
- Add solution variations (correct and incorrect)
- Comprehensive statistics and analytics
- User activity monitoring

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Hosting**: Vercel

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=your_mongodb_connection_string
ADMIN_KEY=your_secret_admin_key
NODE_ENV=production
```

### 2. MongoDB Setup

The application requires a MongoDB database. You can use:
- MongoDB Atlas (recommended for production)
- Local MongoDB installation

### 3. Vercel Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Deploy: `vercel --prod`

Set environment variables in Vercel:
- `MONGODB_URI`: Your MongoDB connection string
- `ADMIN_KEY`: Secret key for admin access

### 4. Local Development

```bash
# Install backend dependencies
cd backend
npm install

# Start development server
npm run dev
```

## API Endpoints

### Public Endpoints
- `GET /api/collections` - Get all public collections
- `GET /api/collections/:id` - Get specific collection
- `GET /api/collections/:id/puzzles` - Get puzzles in collection
- `GET /api/puzzles/:id` - Get specific puzzle
- `POST /api/puzzles/:id/view` - Record puzzle view
- `POST /api/collections/:id/like` - Like collection

### Admin Endpoints (require x-admin-key header)
- `POST /api/collections` - Create collection
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection
- `POST /api/puzzles` - Create puzzle
- `GET /api/admin/stats` - Get platform statistics

## File Structure

```
├── frontend/
│   ├── puzzles.html                    # Main user page
│   ├── puzzle-collection.html          # Collection view
│   ├── puzzle.html                     # Individual puzzle
│   ├── puzzlesadmin27988794.html       # Admin collections
│   ├── puzzlesadmincreate27988794.html # Admin puzzle creator
│   └── styles.css                      # Global styles
├── backend/
│   ├── server.js                       # Main server file
│   ├── models/                         # MongoDB schemas
│   ├── routes/                         # API routes
│   └── package.json
└── vercel.json                         # Vercel configuration
```

## Admin Access

To access admin features:
1. Visit `/puzzlesadmin27988794` for collection management
2. Visit `/puzzlesadmincreate27988794` for puzzle creation
3. Include the admin key in requests (automatically handled by frontend)

## Go Board Features

- 19x19 interactive board with proper coordinates
- Star points (handicap points) displayed
- Stone placement with visual feedback
- Move numbering and history
- Undo functionality
- Solution variations with correct/incorrect marking

## Database Schema

### Collections
- Name, description, difficulty level
- Privacy settings and transformations
- View/like tracking
- Associated puzzles

### Puzzles
- Initial board position (19x19 array)
- Solution variations with move sequences
- Difficulty, category, and metadata
- Statistics and completion tracking

### User Progress
- IP-based progress tracking
- Attempt and completion records
- Best scores and timing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use and modify as needed.
