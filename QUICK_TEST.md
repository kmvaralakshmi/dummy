# Quick Test Guide

## Test the A/B Testing Backend (SQLite Edition)

### 1. Check Server Health
```powershell
curl http://localhost:3000/health
```

### 2. Create a Test Experiment
```powershell
$body = @'
{
  "name": "Button Color Test",
  "key": "button-color-v1",
  "description": "Testing blue vs red button",
  "variants": [
    {
      "name": "Blue Button",
      "key": "blue",
      "weight": 50,
      "description": "Original blue button"
    },
    {
      "name": "Red Button",
      "key": "red",
      "weight": 50,
      "description": "New red button"
    }
  ]
}
'@

curl -X POST http://localhost:3000/api/experiments -H "Content-Type: application/json" -d $body
```

### 3. Start the Experiment
```powershell
curl -X POST http://localhost:3000/api/experiments/button-color-v1/start
```

### 4. Assign a User to a Variant
```powershell
$assignBody = @'
{
  "experimentKey": "button-color-v1",
  "userId": "user_001"
}
'@

curl -X POST http://localhost:3000/api/tracking/assign -H "Content-Type: application/json" -d $assignBody
```

### 5. Track a Conversion
```powershell
$trackBody = @'
{
  "experimentKey": "button-color-v1",
  "variantKey": "blue",
  "userId": "user_001",
  "eventType": "conversion"
}
'@

curl -X POST http://localhost:3000/api/tracking/track -H "Content-Type: application/json" -d $trackBody
```

### 6. Get Results
```powershell
curl http://localhost:3000/api/analytics/button-color-v1/results
```

### 7. List All Experiments
```powershell
curl http://localhost:3000/api/experiments
```

---

## Note
- Database file is automatically created at: `database.sqlite`
- No database installation required!
- All data persists across server restarts
