# Full Stack A/B Testing Platform

A complete A/B testing solution with backend API and React frontend dashboard.

## Project Structure

```
AB_Testing/
├── src/                    # Backend (Node.js + Express + SQLite)
│   ├── config/            # Database configuration
│   ├── models/            # Sequelize models
│   ├── controllers/       # API controllers
│   ├── routes/            # API routes
│   └── server.ts          # Main server file
├── frontend/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── api.js         # API client
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
├── database.sqlite        # SQLite database (auto-created)
└── package.json           # Backend dependencies
```

## Quick Start

### 1. Start the Backend

```bash
# Install backend dependencies
npm install

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3000`

### 2. Start the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies  
npm install

# Start frontend dev server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 3. Open the Dashboard

Visit `http://localhost:5173` in your browser

## Features

### Backend API
- ✅ RESTful API for experiment management
- ✅ SQLite database (no installation required)
- ✅ Statistical significance testing (Z-test)
- ✅ Event tracking (impressions, clicks, conversions)
- ✅ User-to-variant assignment with consistency
- ✅ Real-time analytics and reporting

### Frontend Dashboard
- ✅ Interactive experiment management
- ✅ Real-time analytics visualization
- ✅ Create and configure A/B tests
- ✅ Test simulator for generating sample data
- ✅ Winner detection with confidence levels
- ✅ Responsive design

## API Endpoints

### Experiments
- `POST /api/experiments` - Create experiment
- `GET /api/experiments` - List all experiments
- `GET /api/experiments/:key` - Get experiment details
- `PUT /api/experiments/:key` - Update experiment
- `POST /api/experiments/:key/start` - Start experiment
- `POST /api/experiments/:key/pause` - Pause experiment
- `POST /api/experiments/:key/complete` - Complete experiment
- `DELETE /api/experiments/:key` - Delete experiment

### Tracking
- `POST /api/tracking/assign` - Assign user to variant
- `POST /api/tracking/track` - Track event
- `GET /api/tracking/:experimentKey/:userId` - Get user's variant

### Analytics
- `GET /api/analytics/:key/results` - Get experiment results
- `GET /api/analytics/:key/timeline` - Get event timeline
- `GET /api/analytics/:key/participants` - Get participant count

## Technology Stack

### Backend
- Node.js + TypeScript
- Express.js
- Sequelize ORM
- SQLite

### Frontend
- React 18
- Vite
- Axios
- Modern CSS

## Database

Uses **SQLite** - a file-based database that requires no installation. The database file (`database.sqlite`) is automatically created when you start the backend.

## Development

### Backend Development
```bash
npm run dev        # Start with auto-reload
npm run build      # Compile TypeScript
npm start          # Run compiled version
```

### Frontend Development
```bash
cd frontend
npm run dev        # Start dev server with HMR
npm run build      # Build for production
npm run preview    # Preview production build
```

## Usage Example

1. **Create an Experiment**
   - Go to "Create New" tab
   - Fill in experiment details
   - Add variants with weights
   - Submit

2. **Start the Experiment**
   - Find your experiment in the list
   - Click "Start" button

3. **Generate Test Data**
   - Go to "Test Simulator" tab
   - Select your experiment
   - Click "Generate 10 Test Users"

4. **View Results**
   - Click on experiment to see details
   - View conversion rates and winner

## Statistical Significance

The system uses a Z-test for proportions to determine statistical significance:

- Requires minimum 100 impressions per variant
- Declares winner at 95%+ confidence level
- Shows confidence percentage for all results

## License

MIT
