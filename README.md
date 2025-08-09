🏴‍☠️ Arrr, ye be warned, matey!  
This here repo be naught but a testin’ harbor fer AI webapp craftin’.  
She’s full o’ strange code currents, experimentin’ tides, an’ prototype galleons not yet seaworthy.  
Board at yer own risk, and keep yer cutlass sharp — we be sailin’ the seas o’ development!
# VibeLegal - AI-Powered Contract Drafting for Lawyers

VibeLegal is a minimal viable product (MVP) that demonstrates an AI-powered contract drafting web application specifically designed for legal professionals. The application combines modern web technologies with OpenAI's GPT models to generate professional, legally compliant contracts quickly and efficiently.

## 🚀 Features

### Core Functionality
- **AI-Powered Contract Generation**: Generate professional contracts using OpenAI's GPT models
- **Multiple Contract Types**: Support for Employment Agreements, NDAs, Service Contracts, Independent Contractor Agreements, and Purchase Agreements
- **User Authentication**: Secure registration and login system with JWT tokens
- **Contract Management**: Save, edit, and manage generated contracts
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Professional UI**: Clean, modern interface designed specifically for lawyers

### Technical Features
- **RESTful API**: Well-structured backend API with proper error handling
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Legal Disclaimers**: All contracts include proper legal disclaimers
- **Subscription Management**: Basic and Premium tier support
- **PDF Export**: Download contracts as HTML files (easily convertible to PDF)

## 🏗️ Architecture

### Frontend (React + Tailwind CSS)
- **Framework**: React 18 with modern hooks
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router for navigation
- **State Management**: React Context for authentication
- **Icons**: Lucide React icons
- **Build Tool**: Vite for fast development and building

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with native pg driver
- **Authentication**: JWT tokens with bcryptjs for password hashing
- **AI Integration**: OpenAI API for contract generation
- **Security**: CORS enabled, rate limiting, input validation

### Database Schema
- **Users Table**: User accounts with subscription tiers and usage tracking
- **Contracts Table**: Generated contracts with metadata and content

## 📋 Prerequisites

Before setting up VibeLegal, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- **PostgreSQL** (v12 or higher)
- **OpenAI API Key** (for contract generation)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd vibelegal
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/vibelegal
OPENAI_API_KEY=<your_openai_api_key>
JWT_SECRET=<your_jwt_secret>
```

#### Database Setup
1. Create a PostgreSQL database named `vibelegal`
2. Run the database schema:
```bash
psql -d vibelegal -f database.sql
```

#### Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or another port if 5173 is occupied)

### 4. Verify Installation

1. Open your browser and navigate to the frontend URL
2. You should see the VibeLegal landing page
3. Try registering a new account (requires backend and database to be running)
4. Test contract generation (requires valid OpenAI API key)

## 🚀 Deployment

### Backend Deployment

#### Environment Variables
Ensure the following environment variables are set in your production environment:
- `PORT`: Server port (default: 5000)
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: Your OpenAI API key
- `JWT_SECRET`: Secret key for JWT token signing

#### Production Considerations
- Use a process manager like PM2 for Node.js applications
- Set up SSL/TLS certificates for HTTPS
- Configure a reverse proxy (nginx) for better performance
- Set up database backups and monitoring
- Implement logging and error tracking

### Frontend Deployment

#### Build for Production
```bash
cd frontend
npm run build
```

#### Deploy Static Files
The `dist` folder contains all static files that can be deployed to:
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: AWS CloudFront, Cloudflare
- **Web Server**: nginx, Apache

#### Environment Configuration
Update API endpoints in the frontend code to point to your production backend URL.

### Database Deployment

#### Production Database Setup
1. Set up a PostgreSQL instance (AWS RDS, Google Cloud SQL, etc.)
2. Run the database schema from `backend/database.sql`
3. Configure connection pooling for better performance
4. Set up regular backups
5. Monitor database performance and usage

## 📖 API Documentation

### Authentication Endpoints

#### POST /api/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "subscription_tier": "basic"
  }
}
```

#### POST /api/login
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "subscription_tier": "basic",
    "contracts_used_this_month": 5
  }
}
```

### Contract Endpoints

#### POST /api/generate-contract
Generate a new contract using AI.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "contractType": "Employment Agreement",
  "requirements": "Software developer position with 90-day probation, $80,000 salary",
  "clientName": "Tech Corp Inc.",
  "otherPartyName": "John Doe",
  "jurisdiction": "California"
}
```

**Response:**
```json
{
  "contract": "Generated contract content...",
  "contractType": "Employment Agreement",
  "clientName": "Tech Corp Inc.",
  "otherPartyName": "John Doe",
  "jurisdiction": "California"
}
```

#### POST /api/save-contract
Save a contract to the database.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "Employment Agreement - Tech Corp & John Doe",
  "contractType": "Employment Agreement",
  "content": "Contract content here..."
}
```

#### GET /api/user-contracts
Retrieve user's saved contracts.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "contracts": [
    {
      "id": 1,
      "title": "Employment Agreement - Tech Corp & John Doe",
      "contract_type": "Employment Agreement",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### GET /api/contracts/:id
Retrieve a specific contract.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "contract": {
    "id": 1,
    "title": "Employment Agreement - Tech Corp & John Doe",
    "contract_type": "Employment Agreement",
    "content": "Full contract content...",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Utility Endpoints

#### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔧 Configuration

### OpenAI Configuration
The application uses OpenAI's GPT-3.5-turbo model for contract generation. You can modify the model and parameters in `backend/server.js`:

```javascript
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo", // or "gpt-4" for better quality
  messages: [...],
  max_tokens: 2000,
  temperature: 0.3, // Lower for more consistent output
});
```

### Rate Limiting
Default rate limiting is set to 10 requests per minute per IP. Modify in `backend/server.js`:

```javascript
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // requests per window
```

### Subscription Tiers
- **Basic**: 25 contracts per month
- **Premium**: Unlimited contracts

Modify limits in the contract generation endpoint as needed.

## 🧪 Testing

### Manual Testing Checklist

#### Frontend Testing
- [ ] Landing page loads correctly
- [ ] Registration form works
- [ ] Login form works
- [ ] Navigation between pages
- [ ] Responsive design on mobile
- [ ] Contract form validation
- [ ] Contract result display
- [ ] Dashboard functionality

#### Backend Testing
- [ ] Health check endpoint responds
- [ ] User registration creates account
- [ ] User login returns valid JWT
- [ ] Contract generation with valid OpenAI key
- [ ] Contract saving to database
- [ ] Rate limiting prevents abuse
- [ ] Error handling for invalid requests

#### Integration Testing
- [ ] Frontend can communicate with backend
- [ ] Authentication flow works end-to-end
- [ ] Contract generation flow works
- [ ] Error messages display correctly

### Automated Testing
Consider adding:
- **Unit Tests**: Jest for backend logic
- **Integration Tests**: Supertest for API endpoints
- **E2E Tests**: Playwright or Cypress for frontend flows
- **Load Testing**: Artillery or k6 for performance testing

## 🔒 Security Considerations

### Current Security Measures
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Basic validation on all endpoints
- **CORS**: Configured for cross-origin requests

### Additional Security Recommendations
- **HTTPS**: Always use HTTPS in production
- **Environment Variables**: Never commit secrets to version control
- **Database Security**: Use connection pooling and prepared statements
- **API Security**: Implement API versioning and additional validation
- **Monitoring**: Set up logging and monitoring for security events

## 📝 Legal Disclaimers

### Important Notice
VibeLegal is a demonstration application that generates contracts using AI. All generated contracts include the following disclaimer:

> "LEGAL DISCLAIMER: This document is generated by AI and should be reviewed by a qualified attorney before use. This does not constitute legal advice."

### Recommendations
- Always have contracts reviewed by qualified legal professionals
- Customize generated contracts for specific jurisdictions and requirements
- Keep up-to-date with local laws and regulations
- Use the application as a starting point, not a final solution

## 🤝 Contributing

### Development Guidelines
1. Follow existing code style and conventions
2. Add comments for complex logic
3. Test changes thoroughly before submitting
4. Update documentation for new features
5. Follow semantic versioning for releases

### Code Structure
```
vibelegal/
├── backend/
│   ├── server.js          # Main server file
│   ├── database.sql       # Database schema
│   ├── package.json       # Dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx       # Main app component
│   │   └── App.css       # Styles
│   ├── package.json      # Dependencies
│   └── index.html        # HTML template
└── README.md             # This file
```

## 📞 Support

### Common Issues

#### "Network error" when registering
- Ensure backend server is running on port 5000
- Check that CORS is properly configured
- Verify database connection

#### "AI service temporarily unavailable"
- Check OpenAI API key is valid and has credits
- Verify API key is properly set in environment variables
- Check OpenAI service status

#### Database connection errors
- Ensure PostgreSQL is running
- Verify database credentials in .env file
- Check that database schema has been applied

### Getting Help
For technical support or questions about VibeLegal:
1. Check this README for common solutions
2. Review the code comments for implementation details
3. Test with minimal examples to isolate issues
4. Check logs for detailed error messages

## 📄 License

This project is provided as-is for demonstration purposes. Please ensure compliance with all applicable laws and regulations when using or modifying this code.

## 🔮 Future Enhancements

### Potential Features
- **Advanced Contract Types**: More specialized legal documents
- **Template Management**: Custom contract templates
- **Collaboration Tools**: Multi-user editing and review
- **Version Control**: Track contract changes and revisions
- **Integration APIs**: Connect with legal practice management systems
- **Advanced AI**: Fine-tuned models for specific legal domains
- **Mobile App**: Native mobile applications
- **Analytics**: Usage analytics and reporting
- **Compliance Tools**: Jurisdiction-specific compliance checking

### Technical Improvements
- **Microservices**: Split into smaller, focused services
- **Caching**: Redis for improved performance
- **Search**: Full-text search for contracts
- **File Storage**: Cloud storage for contract documents
- **Real-time Features**: WebSocket for live collaboration
- **API Gateway**: Centralized API management
- **Container Deployment**: Docker and Kubernetes support

---

**VibeLegal** - Transforming legal contract drafting with AI technology.

