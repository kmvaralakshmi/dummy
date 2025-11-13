# A/B Testing Frontend

React-based dashboard for managing A/B tests and viewing analytics.

## Features

- 📊 **Dashboard** - Overview of all experiments
- 🔬 **Experiment Management** - Create, start, pause, and complete tests
- 📈 **Real-time Analytics** - View results with statistical significance
- 🎯 **Test Simulator** - Generate sample data for testing
- 🏆 **Winner Detection** - Automatic statistical analysis

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser to `http://localhost:5173`

## Backend Connection

The frontend connects to the backend API at `http://localhost:3000/api`

Make sure the backend server is running before starting the frontend.

## Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.
