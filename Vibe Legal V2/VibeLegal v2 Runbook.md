# VibeLegal v2 Runbook

## Local Development

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 2. Install dependencies
cd app && npm install
cd ../web && npm install

# 3. Setup database
cd app && node setup-database.js

# 4. Start development servers
cd app && npm run dev          # Backend on :5000
cd web && npm run dev          # Frontend on :5173
```

## Validation & Testing

```bash
# Validate jurisdiction packs
cd app
npm run validate:pack us_ca
npm run validate:pack us_tx

# Run smoke tests (requires running server)
npm run test:smoke us_ca
npm run test:smoke us_tx
```

## Build & Deploy

```bash
# Build deployment package
cd app
npm run build:zip

# Deploy to Render.com
# Upload vibelegal_v2_YYYYMMDD.zip to your Render service
```

## Acceptance Tests

### Pack Validation
```bash
npm run validate:pack us_ca
# Expected: ✅ Pack validation passed!
```

### Smoke Tests
```bash
npm run test:smoke us_ca
# Expected: ✅ All smoke tests passed!
```

### API Tests
```bash
# New contract API
curl -X POST http://localhost:5000/api/contracts/generate?format=json \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "jurisdiction": "us_ca",
    "contractType": "employment_agreement",
    "userInputs": {
      "client_name": "Test Company",
      "employee_name": "John Doe"
    }
  }'

# Legacy adapter
curl -X POST http://localhost:5000/api/generate-contract \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "contractType": "Employment Agreement",
    "clientName": "Test Company",
    "otherPartyName": "John Doe",
    "jurisdiction": "California",
    "requirements": "Standard terms"
  }'
```

### Health Check
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"OK","timestamp":"..."}
```

### Render Deploy
1. Upload deployment package to Render
2. Verify health endpoint returns 200
3. Test contract generation through UI

