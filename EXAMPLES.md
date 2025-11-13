# A/B Testing Backend - Example Usage

## 1. Test the Health Endpoint

```bash
curl http://localhost:3000/health
```

## 2. Create an Experiment

```bash
curl -X POST http://localhost:3000/api/experiments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Homepage Hero Test",
    "key": "homepage-hero-v1",
    "description": "Testing different hero section designs",
    "variants": [
      {
        "name": "Control - Original Design",
        "key": "control",
        "weight": 50,
        "description": "Current homepage with blue hero"
      },
      {
        "name": "Variant A - Green Hero",
        "key": "variant-a",
        "weight": 50,
        "description": "New design with green hero section"
      }
    ]
  }'
```

## 3. Start the Experiment

```bash
curl -X POST http://localhost:3000/api/experiments/homepage-hero-v1/start
```

## 4. Assign a User to a Variant

```bash
curl -X POST http://localhost:3000/api/tracking/assign \
  -H "Content-Type: application/json" \
  -d '{
    "experimentKey": "homepage-hero-v1",
    "userId": "user_12345"
  }'
```

## 5. Track Events

### Track a Click
```bash
curl -X POST http://localhost:3000/api/tracking/track \
  -H "Content-Type: application/json" \
  -d '{
    "experimentKey": "homepage-hero-v1",
    "variantKey": "control",
    "userId": "user_12345",
    "eventType": "click"
  }'
```

### Track a Conversion
```bash
curl -X POST http://localhost:3000/api/tracking/track \
  -H "Content-Type: application/json" \
  -d '{
    "experimentKey": "homepage-hero-v1",
    "variantKey": "control",
    "userId": "user_12345",
    "eventType": "conversion",
    "metadata": {
      "revenue": 99.99,
      "plan": "premium"
    }
  }'
```

## 6. Get Experiment Results

```bash
curl http://localhost:3000/api/analytics/homepage-hero-v1/results
```

## 7. Get Participant Count

```bash
curl http://localhost:3000/api/analytics/homepage-hero-v1/participants
```

## 8. List All Experiments

```bash
# All experiments
curl http://localhost:3000/api/experiments

# Only running experiments
curl http://localhost:3000/api/experiments?status=running
```

## 9. Pause the Experiment

```bash
curl -X POST http://localhost:3000/api/experiments/homepage-hero-v1/pause
```

## 10. Complete the Experiment

```bash
curl -X POST http://localhost:3000/api/experiments/homepage-hero-v1/complete
```

## Example JavaScript Client Integration

```javascript
class ABTestingClient {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  async getVariant(experimentKey, userId) {
    const response = await fetch(`${this.baseUrl}/tracking/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ experimentKey, userId })
    });
    return await response.json();
  }

  async trackEvent(experimentKey, variantKey, userId, eventType, metadata = {}) {
    const response = await fetch(`${this.baseUrl}/tracking/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experimentKey,
        variantKey,
        userId,
        eventType,
        metadata
      })
    });
    return await response.json();
  }

  async getResults(experimentKey) {
    const response = await fetch(`${this.baseUrl}/analytics/${experimentKey}/results`);
    return await response.json();
  }
}

// Usage
const client = new ABTestingClient();

// Get variant for user
const { variantKey } = await client.getVariant('homepage-hero-v1', 'user_123');

// Show appropriate variant
if (variantKey === 'variant-a') {
  showGreenHero();
} else {
  showBlueHero();
}

// Track click
await client.trackEvent('homepage-hero-v1', variantKey, 'user_123', 'click');

// Track conversion
await client.trackEvent('homepage-hero-v1', variantKey, 'user_123', 'conversion', {
  revenue: 99.99
});
```

## Example React Integration

```jsx
import { useState, useEffect } from 'react';

function useABTest(experimentKey, userId) {
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function assignVariant() {
      const response = await fetch('http://localhost:3000/api/tracking/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experimentKey, userId })
      });
      const data = await response.json();
      setVariant(data.variantKey);
      setLoading(false);
    }
    assignVariant();
  }, [experimentKey, userId]);

  const trackEvent = async (eventType, metadata = {}) => {
    if (!variant) return;
    
    await fetch('http://localhost:3000/api/tracking/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experimentKey,
        variantKey: variant,
        userId,
        eventType,
        metadata
      })
    });
  };

  return { variant, loading, trackEvent };
}

// Component usage
function HeroSection({ userId }) {
  const { variant, loading, trackEvent } = useABTest('homepage-hero-v1', userId);

  if (loading) return <div>Loading...</div>;

  const handleCTAClick = () => {
    trackEvent('click');
    // Handle click...
  };

  const handlePurchase = (amount) => {
    trackEvent('conversion', { revenue: amount });
    // Handle purchase...
  };

  return (
    <div className={variant === 'variant-a' ? 'hero-green' : 'hero-blue'}>
      <h1>Welcome!</h1>
      <button onClick={handleCTAClick}>Get Started</button>
    </div>
  );
}
```
