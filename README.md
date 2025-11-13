# A/B Testing Backend

A comprehensive backend service for managing A/B tests, tracking user interactions, and determining winning variations with statistical significance.

## Features

- 🎯 **Experiment Management**: Create, update, and manage A/B tests
- 📊 **Variant Assignment**: Consistent user-to-variant assignment with weighted distribution
- 📈 **Event Tracking**: Track impressions, clicks, conversions, and custom events
- 🏆 **Winner Determination**: Statistical analysis using Z-test for proportions
- 📉 **Analytics Dashboard**: Comprehensive metrics and insights
- 🔍 **Real-time Monitoring**: Track experiment performance in real-time

## Tech Stack

- **Node.js** with **TypeScript**
- **Express.js** for REST API
- **SQLite** with **Sequelize** ORM (no installation required!)
- **Statistical Analysis** for determining winners

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd AB_Testing
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` and configure:
```
PORT=3000
NODE_ENV=development
```

**Note:** No database installation needed! SQLite creates a file-based database automatically.

4. Run the server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Experiments

#### Create Experiment
```http
POST /api/experiments
Content-Type: application/json

{
  "name": "Homepage CTA Test",
  "key": "homepage-cta-v1",
  "description": "Testing different call-to-action buttons",
  "variants": [
    {
      "name": "Control",
      "key": "control",
      "weight": 50,
      "description": "Original blue button"
    },
    {
      "name": "Variant A",
      "key": "variant-a",
      "weight": 50,
      "description": "Green button with new text"
    }
  ]
}
```

#### List All Experiments
```http
GET /api/experiments
GET /api/experiments?status=running
```

#### Get Experiment
```http
GET /api/experiments/:key
```

#### Update Experiment
```http
PUT /api/experiments/:key
Content-Type: application/json

{
  "description": "Updated description",
  "variants": [...]
}
```

#### Start Experiment
```http
POST /api/experiments/:key/start
```

#### Pause Experiment
```http
POST /api/experiments/:key/pause
```

#### Complete Experiment
```http
POST /api/experiments/:key/complete
```

#### Delete Experiment
```http
DELETE /api/experiments/:key
```

### Tracking

#### Assign Variant to User
```http
POST /api/tracking/assign
Content-Type: application/json

{
  "experimentKey": "homepage-cta-v1",
  "userId": "user123"
}

Response:
{
  "variantKey": "variant-a",
  "experimentKey": "homepage-cta-v1",
  "isNewAssignment": true
}
```

#### Track Event
```http
POST /api/tracking/track
Content-Type: application/json

{
  "experimentKey": "homepage-cta-v1",
  "variantKey": "variant-a",
  "userId": "user123",
  "eventType": "conversion",
  "metadata": {
    "amount": 49.99,
    "product": "Premium Plan"
  }
}
```

Event types: `impression`, `click`, `conversion`, `custom`

#### Get User's Variant
```http
GET /api/tracking/:experimentKey/:userId
```

### Analytics

#### Get Experiment Results
```http
GET /api/analytics/:key/results

Response:
{
  "experimentKey": "homepage-cta-v1",
  "experimentName": "Homepage CTA Test",
  "status": "running",
  "variantStats": [
    {
      "variantKey": "control",
      "variantName": "Control",
      "impressions": 1000,
      "clicks": 150,
      "conversions": 45,
      "uniqueUsers": 950,
      "clickThroughRate": 15.0,
      "conversionRate": 4.5
    },
    {
      "variantKey": "variant-a",
      "variantName": "Variant A",
      "impressions": 1000,
      "clicks": 180,
      "conversions": 60,
      "uniqueUsers": 980,
      "clickThroughRate": 18.0,
      "conversionRate": 6.0
    }
  ],
  "winner": "variant-a",
  "confidence": 95.5
}
```

#### Get Event Timeline
```http
GET /api/analytics/:key/timeline
GET /api/analytics/:key/timeline?startDate=2024-01-01&endDate=2024-01-31&eventType=conversion
```

#### Get Stats by Date
```http
GET /api/analytics/:key/stats-by-date
```

#### Get Participant Count
```http
GET /api/analytics/:key/participants
```

## Usage Example

### 1. Create an Experiment
```javascript
const experiment = await fetch('http://localhost:3000/api/experiments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Button Color Test",
    key: "button-color-test",
    variants: [
      { name: "Blue Button", key: "blue", weight: 50 },
      { name: "Red Button", key: "red", weight: 50 }
    ]
  })
});
```

### 2. Start the Experiment
```javascript
await fetch('http://localhost:3000/api/experiments/button-color-test/start', {
  method: 'POST'
});
```

### 3. Assign Users to Variants
```javascript
const assignment = await fetch('http://localhost:3000/api/tracking/assign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    experimentKey: "button-color-test",
    userId: "user123"
  })
});

const { variantKey } = await assignment.json();
// Show the user the variant (e.g., blue or red button)
```

### 4. Track Events
```javascript
// Track impression (automatic when assigning)
// Track click
await fetch('http://localhost:3000/api/tracking/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    experimentKey: "button-color-test",
    variantKey: variantKey,
    userId: "user123",
    eventType: "click"
  })
});

// Track conversion
await fetch('http://localhost:3000/api/tracking/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    experimentKey: "button-color-test",
    variantKey: variantKey,
    userId: "user123",
    eventType: "conversion"
  })
});
```

### 5. Get Results
```javascript
const results = await fetch('http://localhost:3000/api/analytics/button-color-test/results');
const data = await results.json();

console.log(`Winner: ${data.winner} with ${data.confidence}% confidence`);
```

## Statistical Significance

The system uses a **Z-test for proportions** to determine statistical significance:

- Compares conversion rates between variants
- Calculates confidence level (80%, 90%, 95%, 99%)
- Declares a winner only when confidence ≥ 95%
- Requires minimum 100 impressions per variant

## Database Models

### Experiment
- name, key, description
- status: draft | running | paused | completed
- variants with weights (stored as JSON)
- start/end dates
- targeting rules

### Event
- experimentKey, variantKey, userId
- eventType: impression | click | conversion | custom
- metadata (stored as JSON), timestamp
- session info

### UserAssignment
- experimentKey, userId, variantKey
- Ensures consistent variant assignment

**Database File:** `database.sqlite` (created automatically in project root)

## Project Structure

```
AB_Testing/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── models/
│   │   ├── Experiment.ts
│   │   ├── Event.ts
│   │   └── UserAssignment.ts
│   ├── controllers/
│   │   ├── experimentController.ts
│   │   ├── trackingController.ts
│   │   └── analyticsController.ts
│   ├── routes/
│   │   ├── experiments.ts
│   │   ├── tracking.ts
│   │   └── analytics.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── .env
```

## Best Practices

1. **Variant Weights**: Always ensure weights sum to 100
2. **Sample Size**: Wait for at least 100 impressions per variant before drawing conclusions
3. **Statistical Significance**: Only trust results with 95%+ confidence
4. **Consistent Assignment**: Users always see the same variant they were initially assigned
5. **Event Tracking**: Track all relevant events (impressions, clicks, conversions)

## Contributing

Feel free to open issues or submit pull requests for improvements.

## License

MIT
