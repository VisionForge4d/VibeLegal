# VibeLegal - AI-Powered Legal Contract Generation Platform

VibeLegal is a production-ready AI-powered contract drafting platform that transforms how legal professionals create employment contracts. Built specifically for California employment law, it features conversational AI, advanced customization controls, comprehensive legal compliance, and enterprise-grade admin capabilities.

## Current Status (October 2025)

**Status**: Production-Ready MVP on `admin-dashboard` branch
- **Focus**: California Employment Agreements
- **Infrastructure**: Complete payment processing, subscription management, admin dashboard
- **Market Status**: 0 paying customers (ready for launch)
- **Recent Work**: Admin dashboard with data visualization, revenue analytics, and 4 critical bug fixes

## Core Features

### Legal Intelligence
- **Master Input Brief System**: 50+ parameter extraction patterns for comprehensive legal analysis
- **California Employment Law Compliance**: 2025-compliant wage, hour, meal/rest period requirements
- **Strategic Legal AI**: Employment law attorney persona with risk assessment
- **Employer Protection Focus**: IP assignment, confidentiality, severance, non-compete coverage
- **Clause Library**: 99 professionally crafted legal variations across 33 categories

### Conversational AI Interface
- **Natural Language Processing**: Create contracts through conversation
- **Resume Capability**: Continue contract creation across sessions
- **Parameter Extraction**: Automatic identification of legal terms and conditions
- **Progress Tracking**: Real-time contract building with state management
- **Google Gemini Integration**: Advanced AI analysis and clause recommendations

### Advanced Customization
- **Risk Tolerance Controls**: Employer-friendly to employee-favorable spectrum
- **Legal Stance Selection**: Conservative, balanced, or progressive approaches
- **Contract Templates**: 5 professional variations for different use cases
- **Clause Selection**: Granular control over every contract section

### Subscription & Payments
- **Stripe Integration**: Full payment processing with webhook support
- **Tiered Access**: Basic (5 contracts/month), Pro (unlimited), Enterprise
- **Feature Gating**: Progressive feature unlocking based on subscription tier
- **Usage Tracking**: Real-time contract generation monitoring
- **Payment History**: Complete transaction tracking and billing management

### Admin Dashboard
- **User Management**: Search, filter, view detailed user profiles
- **Subscription Management**: Manual subscription tier adjustments
- **Revenue Analytics**: MRR tracking, revenue by tier, growth metrics
- **Data Visualization**: Interactive charts for users, contracts, and revenue trends
- **User Impersonation**: Temporary access tokens for debugging (admin-only)
- **Audit Logging**: Complete tracking of all admin actions
- **Recent Activity**: Monitor signups, contracts, and payments in real-time

### LLM Switch (Enterprise Feature)
- **Local LLM Support**: Infrastructure ready for on-premise LLM deployment
- **Privacy/Security**: Enterprise customers can use local models for sensitive data
- **Status**: Backend infrastructure complete, activation pending

## Technology Stack

### Backend (Node.js/Express)
- **Runtime**: Node.js 18+ with Express.js framework
- **Database**: PostgreSQL with comprehensive subscription schema
- **Authentication**: JWT tokens with bcryptjs password hashing
- **AI Integration**: Google Gemini AI with custom legal prompting
- **Payment Processing**: Stripe integration with webhook handling
- **Legal Engine**: Master Input Brief composer with 60+ parameter mapping
- **Security**: Helmet, CORS, rate limiting, input validation, webhook signature verification
- **Environment Validation**: Joi-based schema validation at startup
- **Error Handling**: Centralized asyncHandler middleware across all routes
- **Monitoring**: Health check endpoint and Prometheus metrics

### Frontend (React + Vite)
- **Framework**: React 18 with modern hooks and context
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS for responsive, professional design
- **Charts**: Recharts for data visualization (admin dashboard)
- **State Management**: React Context for authentication and app state
- **Routing**: React Router v6 with protected routes
- **Icons**: Lucide React for consistent iconography

### Database Schema (PostgreSQL)
- **users**: Account management with Stripe integration, admin flags
- **user_subscriptions**: Subscription management with billing cycles
- **contracts**: Generated contracts with search/filter capabilities
- **chat_sessions**: Conversation state preservation for resume functionality
- **payment_history**: Transaction tracking and billing management
- **subscription_usage**: Feature usage analytics and tier enforcement
- **admin_actions**: Audit log for all administrative actions

## Prerequisites

- **Node.js**: v18 or higher
- **npm** or **pnpm**
- **PostgreSQL**: v12 or higher
- **Google Gemini API Key**: For AI-powered contract generation
- **Stripe Account**: For payment processing (optional for development)

## Installation & Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd VibeLegal

# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

### 2. Environment Configuration

Create `.env` file in the backend directory (use `.env.example` as template):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/vibelegal

# Google Gemini AI (primary AI provider)
GOOGLE_AI_API_KEY=your_gemini_api_key

# JWT Secret (minimum 24 characters)
JWT_SECRET=your_secure_jwt_secret_here

# Stripe Configuration (optional for development)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRO_MONTHLY_PRICE_ID=price_pro_monthly_id
STRIPE_PRO_YEARLY_PRICE_ID=price_pro_yearly_id
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_enterprise_monthly_id
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_enterprise_yearly_id
FRONTEND_URL=http://localhost:5173
```

**Note**: Environment variables are validated at startup. Server will fail fast with clear error messages if required variables are missing.

### 3. Database Setup

```bash
cd backend

# Create database
createdb vibelegal

# Run base schema
psql -d vibelegal -f database.sql

# Run Stripe integration migration
psql -d vibelegal -f stripe-migration.sql

# Grant admin access to a user (optional)
psql -d vibelegal -c "UPDATE users SET is_admin = true WHERE email = 'your_email@example.com';"
```

### 4. Stripe Setup (Optional)

```bash
# Auto-create Stripe products and prices
node setup-stripe.js

# Copy generated price IDs to .env file
# Set up webhook endpoint: /api/user/webhook/stripe in Stripe Dashboard
```

### 5. Start Development Servers

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

Access the application at `http://localhost:5173`

## Containerized Deployment

VibeLegal now ships with production-ready Docker images and an Nginx front-end so you can deploy the entire SaaS stack without configuration drift.

### 1. Configure Environment

1. Copy the root `.env.example` file to `.env` and update it with your secrets (OpenAI key, JWT secret, Stripe keys, etc.).
2. Optionally, copy `backend/.env.example` to `backend/.env` if you plan to run the backend outside of Docker.

The Compose stack will automatically read values from `.env` and fall back to sensible defaults for local Postgres credentials.

### 2. Build & Start the Stack

```bash
docker compose up --build -d
```

This command builds three services:

- **postgres** – managed PostgreSQL 15 instance with persistent volume storage.
- **backend** – Node.js API built from `backend/Dockerfile` with health checks and strict env validation.
- **frontend** – Static React build served by Nginx using `frontend/nginx.conf`, proxying `/api` calls to the backend container.

Once the containers are healthy, the application is available at [http://localhost:8080](http://localhost:8080).

### 3. Running Database Migrations

Exec into the backend container to run SQL migrations against the bundled Postgres instance:

```bash
docker compose exec backend bash -c "psql $DATABASE_URL -f database.sql"
docker compose exec backend bash -c "psql $DATABASE_URL -f stripe-migration.sql"
```

### 4. Shutting Down

```bash
docker compose down
```

Add `-v` to remove the Postgres volume as well.

## Subscription Tiers

### Basic (Free)
- **Contracts**: 5 per month
- **Features**: Basic contract generation
- **Target**: Individual lawyers testing the platform

### Pro ($29/month, $290/year)
- **Contracts**: Unlimited
- **Features**: Conversational AI, advanced customization, risk controls, clause selection
- **Target**: Solo practitioners and small firms
- **Savings**: 17% with annual billing

### Enterprise ($99/month, $990/year)
- **Contracts**: Unlimited
- **Features**: Everything in Pro plus admin dashboard, analytics, audit logging, LLM switch
- **Target**: Law firms and legal departments
- **Savings**: 17% with annual billing

## Admin Dashboard

The admin dashboard provides comprehensive platform management for administrators.

### Access

```
URL: http://localhost:5173/admin
Access: Requires is_admin=true in users table
```

### Features

#### Overview Dashboard
- **Key Metrics**: Total users, contracts, active subscriptions, MRR
- **Growth Trends**: Interactive line chart tracking users, contracts, and revenue over time
- **Subscription Distribution**: Pie chart showing tier breakdown (Basic/Pro/Enterprise)
- **Revenue by Tier**: MRR breakdown with growth rates
- **Recent Activity**: Latest contracts, signups, and payments

#### User Management
- **User Listing**: Paginated table with search and filtering
- **Search**: Find users by email or name
- **Filter**: By subscription tier (basic/pro/enterprise)
- **Sort**: By date or email (ascending/descending)
- **User Details**: Complete profile with contracts and payment history
- **Subscription Editor**: Manually adjust user subscription tiers
- **User Impersonation**: Generate 1-hour temporary access tokens for debugging

#### Security & Audit
- **Admin-Only Routes**: All endpoints protected by admin middleware
- **Audit Logging**: Every admin action logged to database
- **Confirmation Dialogs**: Required for destructive actions
- **Impersonation Limits**: Cannot impersonate other admins, 1-hour token expiry

### Admin API Endpoints

All require authentication and admin privileges:

- `GET /api/admin/metrics/overview` - System-wide metrics with MRR
- `GET /api/admin/metrics/recent-activity` - Recent platform activity
- `GET /api/admin/users` - List all users with search/filter
- `GET /api/admin/users/:userId` - Detailed user profile
- `POST /api/admin/users/:userId/subscription` - Update subscription tier
- `POST /api/admin/users/:userId/impersonate` - Generate impersonation token
- `GET /api/admin/audit-log` - View admin action history

### Testing

Run admin integration tests:

```bash
cd backend
node tests/admin-integration-test.js
```

## Production Deployment

### Deployment Status: READY

All deployment blockers have been resolved:

- Environment validation with Joi schema
- Centralized error handling with asyncHandler middleware
- Frontend security audit clean (0 vulnerabilities)
- Comprehensive API test suite passing
- Admin dashboard complete with revenue tracking
- 4 critical code quality bugs fixed

### Deployment Checklist

1. **Backend Deployment** (Railway, Render, or similar)
   - Set all required environment variables
   - Deploy from `admin-dashboard` branch
   - Configure database connection
   - Set up Stripe webhooks

2. **Frontend Deployment** (Vercel, Netlify, or similar)
   - Build with `npm run build`
   - Deploy from `admin-dashboard` branch
   - Configure `VITE_API_BASE_URL` environment variable

3. **Post-Deployment Verification**
   - Test health endpoint: `GET /api/health`
   - Test authentication flow
   - Verify payment processing
   - Test contract generation
   - Verify admin dashboard access

### Environment Variables (Production)

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_AI_API_KEY` - Google Gemini API key
- `JWT_SECRET` - Secure random string (min 24 chars)

**Optional (for payments):**
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `STRIPE_PRO_MONTHLY_PRICE_ID` - Pro monthly price ID
- `STRIPE_PRO_YEARLY_PRICE_ID` - Pro yearly price ID
- `STRIPE_ENTERPRISE_MONTHLY_PRICE_ID` - Enterprise monthly price ID
- `STRIPE_ENTERPRISE_YEARLY_PRICE_ID` - Enterprise yearly price ID
- `FRONTEND_URL` - Frontend URL for redirects

## Development Commands

```bash
# Backend
cd backend
npm start              # Production mode
npm run dev            # Development with nodemon
npm run setup-db       # Initialize database
node setup-stripe.js   # Setup Stripe products

# Frontend
cd frontend
npm run dev            # Development server (port 5173)
npm run build          # Production build
npm run preview        # Preview production build

# Testing
cd backend
node tests/api-test.js              # API integration tests
node tests/admin-integration-test.js # Admin dashboard tests
```

## Testing

### Test Account

- **Email**: test2@vibelegal.com
- **Password**: (set locally — do not commit credentials)
- **Status**: 28+ contracts (Pro tier)

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*...)

### Manual Testing Checklist

- [ ] User registration and authentication
- [ ] Contract generation through conversational AI
- [ ] Advanced customization controls
- [ ] Subscription upgrade flow
- [ ] Contract search and management
- [ ] Payment processing (test mode)
- [ ] Admin dashboard metrics and charts
- [ ] User impersonation (admin only)
- [ ] Mobile responsive design

## Growth Roadmap

### Phase 1: Market Validation (Current)
- **Goal**: Find paying customers
- **Focus**: California employment contracts
- **Metrics**: User acquisition, conversion rates, MRR growth

### Phase 2: Contract Type Expansion
- **NDAs**: Non-disclosure agreements
- **Service Agreements**: Independent contractor agreements
- **Purchase Agreements**: Basic commercial contracts

### Phase 3: Geographic Expansion
- **New York**: Employment law compliance
- **Texas**: State-specific regulations
- **Florida**: Regional legal requirements

### Phase 4: International Markets
- **United Kingdom**: UK employment law
- **Canada**: Provincial regulations
- **European Union**: GDPR compliance
- **Australia**: Fair Work Act compliance

## Architecture Highlights

### Master Input Brief System
- 50+ parameter extraction patterns
- Comprehensive legal analysis
- Strategic protection recommendations
- State management and resume functionality

### Enhanced Contract Generation
- 60+ parameter mapping
- AI-powered clause selection
- Risk tolerance and legal stance controls
- Hybrid fallback system (enhanced + original clauses)

### Subscription Management
- Stripe webhook integration
- Automated tier enforcement
- Usage tracking and analytics
- Payment history and billing cycles

### Admin Infrastructure
- Comprehensive metrics and analytics
- MRR tracking and revenue forecasting
- User and subscription management
- Complete audit trail

## Recent Updates (October 2025)

### Admin Dashboard Completion (Oct 10, 2025)
- Interactive data visualization with Recharts
- MRR tracking and revenue by tier
- Growth rate calculations (users, contracts, revenue)
- User impersonation for debugging
- Enhanced audit logging

### Bug Fixes (Oct 10, 2025)
1. Fixed duplicate aiProvider declaration (ai-interpreter.js)
2. Fixed duplicate conversationState key
3. Consolidated duplicate /chat/recent route
4. Eliminated inefficient internal API calls (replaced with direct function calls)

### Backend Architecture Hardening (Oct 8, 2025)
- Joi-based environment validation
- Centralized asyncHandler middleware
- Removed 133 lines of redundant try-catch blocks
- Fixed req.user.userId consistency
- Comprehensive API test suite

## Security Features

- JWT authentication with secure token handling
- bcryptjs password hashing (10 salt rounds)
- Stripe webhook signature verification
- Input validation and sanitization
- Rate limiting and abuse prevention
- Helmet security headers
- CORS configuration
- SQL injection protection (parameterized queries)
- Admin-only route protection

## Legal Disclaimers

All generated contracts include appropriate legal disclaimers and should be reviewed by qualified attorneys before use. VibeLegal provides tools to assist in contract creation but does not provide legal advice.

## Support & Contributing

### Getting Help
- **Documentation**: Comprehensive setup and API documentation
- **Code Comments**: Detailed implementation explanations
- **Error Handling**: Clear error messages and logging

### Contributing
- **Code Style**: Follow existing patterns and conventions
- **Testing**: Run integration tests before submitting changes
- **Documentation**: Update docs for new features
- **Git Workflow**: Feature branches with detailed commit messages

---

**VibeLegal** - Production-ready AI-powered legal contract generation for the modern legal practice.

**Current Branch**: `admin-dashboard`
**Status**: Ready for production deployment
**Last Updated**: October 10, 2025

---

&copy; 2025 VibeLegal. All rights reserved. This source code is made available for portfolio and reference purposes only. No license is granted to use, copy, modify, or distribute this code without explicit written permission.
