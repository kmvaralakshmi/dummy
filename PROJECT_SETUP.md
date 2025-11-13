# A/B Testing Platform - Complete Setup Guide

## 🎯 Project Overview

A full-stack A/B testing platform with:
- **Backend**: Node.js, TypeScript, Express, Sequelize, SQLite
- **Frontend**: React 18, Vite
- **CI/CD**: GitHub Actions with automated testing
- **Testing**: Jest, Supertest, ESLint

## 📁 Repository Structure

```
AB_Testing/
├── .github/
│   ├── workflows/
│   │   └── ci-cd.yml              # GitHub Actions CI/CD pipeline
│   └── PULL_REQUEST_TEMPLATE.md   # PR template
├── frontend/                       # React frontend
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── App.jsx
│   │   ├── api.js                 # API client
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── src/                           # Backend source
│   ├── config/
│   │   └── database.ts            # Sequelize configuration
│   ├── controllers/
│   │   ├── experimentController.ts
│   │   ├── trackingController.ts
│   │   └── analyticsController.ts
│   ├── models/
│   │   ├── Experiment.ts
│   │   ├── Event.ts
│   │   └── UserAssignment.ts
│   ├── routes/
│   │   ├── experiments.ts
│   │   ├── tracking.ts
│   │   └── analytics.ts
│   └── server.ts
├── tests/                         # Test suite
│   ├── experiment.test.ts
│   ├── tracking.test.ts
│   └── analytics.test.ts
├── jest.config.js
├── .eslintrc.js
├── tsconfig.json
├── package.json
├── TESTING.md                     # Testing guide
├── USER_STORIES.md                # User stories
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Git
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/kmvaralakshmi/dummy.git
cd dummy
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

4. **Create environment file**
```bash
cp .env.example .env
```

## 🏃 Running the Application

### Backend Server
```bash
npm run dev
```
Server runs on: http://localhost:3000

### Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

### Run Both Concurrently
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Linting
```bash
npm run lint
```

### Fix Linting Issues
```bash
npm run lint:fix
```

## 📋 Available Branches

### Main Branches
- **`main`** - Production-ready code
- **`develop`** - Integration branch for features

### Story Branches (14 User Stories)
- `story-1` - Create Experiment
- `story-2` - Start Experiment
- `story-3` - Pause Experiment
- `story-4` - Complete Experiment
- `story-5` - Assign User to Variant
- `story-6` - Track Impression Event
- `story-7` - Track Click Event
- `story-8` - Track Conversion Event
- `story-9` - Calculate Conversion Rates
- `story-10` - Calculate Click-Through Rates
- `story-11` - Statistical Significance Test
- `story-12` - Determine Winner
- `story-13` - View Analytics Dashboard
- `story-14` - Export Experiment Data

## 🔄 Workflow

### Working on a User Story

1. **Create branch from develop**
```bash
git checkout develop
git pull origin develop
git checkout -b story-X
```

2. **Implement feature**
   - Write code
   - Add tests
   - Update documentation

3. **Test locally**
```bash
npm test
npm run lint
npm run build
```

4. **Commit and push**
```bash
git add .
git commit -m "feat: implement story-X - description"
git push origin story-X
```

5. **Create Pull Request**
   - Use PR template
   - Target `develop` branch
   - Request reviews

## 🔧 API Endpoints

### Experiments
- `POST /api/experiments` - Create experiment
- `GET /api/experiments` - List experiments
- `GET /api/experiments/:key` - Get experiment
- `PUT /api/experiments/:key` - Update experiment
- `DELETE /api/experiments/:key` - Delete experiment
- `POST /api/experiments/:key/start` - Start experiment
- `POST /api/experiments/:key/pause` - Pause experiment
- `POST /api/experiments/:key/complete` - Complete experiment

### Tracking
- `POST /api/tracking/assign` - Assign user to variant
- `POST /api/tracking/track` - Track event
- `GET /api/tracking/:experimentKey/:userId` - Get user assignment

### Analytics
- `GET /api/analytics/:experimentKey` - Get analytics
- `GET /api/analytics/:experimentKey/winner` - Determine winner
- `GET /api/analytics/:experimentKey/export` - Export data

## 🤖 CI/CD Pipeline

### GitHub Actions Workflow

The `.github/workflows/ci-cd.yml` runs on every push:

1. **test-backend** (runs on: ubuntu-latest, node 18)
   - Install dependencies
   - Run ESLint
   - Run unit tests
   - Run integration tests
   - Build TypeScript

2. **test-frontend** (runs on: ubuntu-latest, node 18)
   - Install dependencies
   - Run ESLint
   - Run tests
   - Build production bundle

3. **integration-test** (requires: test-backend, test-frontend)
   - E2E testing
   - Full integration validation

4. **deploy-staging** (on `develop` branch)
   - Auto-deploy to staging environment

5. **deploy-production** (on `main` branch, manual approval)
   - Deploy to production

## 📊 Test Coverage Goals

- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3
- **Framework**: Express.js 4.18
- **ORM**: Sequelize 6.35
- **Database**: SQLite 5.1
- **Testing**: Jest 29.7, Supertest 6.3
- **Linting**: ESLint with TypeScript

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **HTTP Client**: Axios 1.6
- **Styling**: CSS

### DevOps
- **CI/CD**: GitHub Actions
- **Version Control**: Git
- **Package Manager**: npm

## 📝 Documentation

- **README.md** - Project overview
- **TESTING.md** - Testing guide
- **USER_STORIES.md** - User stories and workflow
- **EXAMPLES.md** - API examples
- **QUICK_TEST.md** - Quick testing guide

## 🤝 Contributing

1. Check available user stories in `USER_STORIES.md`
2. Pick a story branch (`story-1` to `story-14`)
3. Implement the feature with tests
4. Submit PR to `develop`
5. Pass all CI checks
6. Get code review approval

## 🔐 Environment Variables

Create `.env` file:
```env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./database.sqlite
```

## 🐛 Troubleshooting

### Database Issues
```bash
# Delete and recreate database
rm database.sqlite
npm run dev
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### TypeScript Errors
```bash
# Clear and rebuild
npm run build
```

### Test Failures
```bash
# Clear Jest cache
npm test -- --clearCache
```

## 📞 Support

For issues or questions:
1. Check existing documentation
2. Review USER_STORIES.md
3. Check GitHub Issues
4. Create new issue with details

## 📄 License

This project is for educational purposes.

---

**Status**: ✅ Complete Setup  
**Version**: 1.0.0  
**Last Updated**: 2024
