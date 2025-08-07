# VibeLegal Production Setup Instructions

## 🎯 Goal
Get your VibeLegal MVP fully functional for beta testing with database, backend, and frontend all connected.

## 📋 Prerequisites
- GitHub repository with VibeLegal code
- Heroku account (free tier works)
- OpenAI API key
- 30 minutes of setup time

## 🚀 Step-by-Step Setup

### Step 1: Database Setup (Heroku PostgreSQL)

1. **Install Heroku CLI** (if not already installed):
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create Heroku app for backend**:
   ```bash
   cd your-vibelegal-repo/backend
   heroku create your-app-name-backend
   ```

4. **Add PostgreSQL database**:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. **Get database URL**:
   ```bash
   heroku config:get DATABASE_URL
   ```
   Save this URL - you'll need it!

### Step 2: Backend Configuration

1. **Update your GitHub repository** with these new files:
   - `backend/setup-database.js` (database setup script)
   - `backend/Procfile` (Heroku deployment config)
   - Updated `backend/package.json` (with setup script)

2. **Set environment variables on Heroku**:
   ```bash
   heroku config:set OPENAI_API_KEY=your_openai_api_key_here
   heroku config:set JWT_SECRET=your_very_secure_random_string_here
   heroku config:set NODE_ENV=production
   ```

3. **Deploy backend to Heroku**:
   ```bash
   git add .
   git commit -m "Add production database setup"
   git push heroku main
   ```

4. **Verify deployment**:
   ```bash
   heroku logs --tail
   ```
   Look for "Database setup complete!" message.

### Step 3: Frontend Configuration

1. **Update `frontend/src/config.js`**:
   Replace `'https://your-backend-app.herokuapp.com'` with your actual Heroku backend URL:
   ```javascript
   API_BASE_URL: process.env.NODE_ENV === 'production' 
     ? 'https://your-actual-app-name-backend.herokuapp.com'
     : 'http://localhost:5000',
   ```

2. **Update API calls in components** to use the config:
   
   In `frontend/src/components/Login.jsx`, `Register.jsx`, `ContractForm.jsx`, `Dashboard.jsx`, and `ContractResult.jsx`:
   
   Replace:
   ```javascript
   const response = await fetch('http://localhost:5000/api/...', {
   ```
   
   With:
   ```javascript
   import config from '../config.js';
   
   const response = await fetch(`${config.API_BASE_URL}/api/...`, {
   ```

3. **Rebuild and redeploy frontend**:
   ```bash
   cd frontend
   npm run build
   ```
   
   Then redeploy to your static hosting service (Netlify, Vercel, etc.)

### Step 4: Testing the Full Stack

1. **Test backend health**:
   ```bash
   curl https://your-app-name-backend.herokuapp.com/api/health
   ```
   Should return: `{"status":"OK","timestamp":"..."}`

2. **Test user registration**:
   ```bash
   curl -X POST https://your-app-name-backend.herokuapp.com/api/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"TestPassword123!"}'
   ```

3. **Test frontend connection**:
   - Visit your deployed frontend
   - Try logging in with demo credentials:
     - Email: `demo@vibelegal.com`
     - Password: `DemoPassword123!`

## 🔧 Files to Update in Your GitHub Repo

### New Files to Add:
```
backend/
├── setup-database.js          # Database setup script
├── Procfile                   # Heroku deployment config
└── package.json               # Updated with setup script

frontend/src/
└── config.js                  # Frontend configuration
```

### Files to Modify:

1. **All frontend API components** - Update fetch URLs to use config
2. **Frontend build** - Rebuild after config changes

## 🎯 Quick Commands Summary

```bash
# Backend deployment
cd backend
heroku create your-app-backend
heroku addons:create heroku-postgresql:mini
heroku config:set OPENAI_API_KEY=your_key
heroku config:set JWT_SECRET=your_secret
git push heroku main

# Frontend update
cd frontend
# Update config.js with your backend URL
npm run build
# Redeploy to your static host
```

## ✅ Success Checklist

- [ ] Backend deployed to Heroku with PostgreSQL
- [ ] Environment variables set (OPENAI_API_KEY, JWT_SECRET)
- [ ] Database schema created automatically
- [ ] Demo data inserted
- [ ] Frontend config updated with backend URL
- [ ] Frontend rebuilt and redeployed
- [ ] Can register new users
- [ ] Can login with demo accounts
- [ ] Can generate contracts (with OpenAI API key)

## 🚨 Troubleshooting

### "Network Error" on frontend
- Check that backend URL in `config.js` is correct
- Verify backend is running: `heroku logs --tail`

### "Database connection failed"
- Check DATABASE_URL is set: `heroku config:get DATABASE_URL`
- Verify PostgreSQL addon: `heroku addons`

### "OpenAI API errors"
- Verify API key: `heroku config:get OPENAI_API_KEY`
- Check OpenAI account has credits

## 🎉 You're Ready for Beta Testing!

Once all steps are complete, your VibeLegal MVP will be fully functional with:
- User registration and authentication
- Contract generation with AI
- Contract saving and management
- Professional UI on mobile and desktop

Share your frontend URL with beta testers and start collecting feedback!

