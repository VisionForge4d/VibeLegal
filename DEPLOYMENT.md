# VibeLegal Deployment Guide

This guide provides step-by-step instructions for deploying VibeLegal to production environments.

## 🚀 Quick Deployment Options

### Option 1: Traditional VPS/Server Deployment
Best for: Full control, custom configurations, cost-effective for high traffic

### Option 2: Cloud Platform Deployment
Best for: Scalability, managed services, quick setup

### Option 3: Container Deployment
Best for: Consistency across environments, easy scaling, DevOps workflows

## 🖥️ Traditional Server Deployment

### Prerequisites
- Ubuntu 20.04+ or CentOS 8+ server
- Root or sudo access
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

### Step 1: Server Setup

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Step 2: Database Setup

#### Create Database User
```bash
sudo -u postgres psql
```

```sql
CREATE USER vibelegal WITH PASSWORD 'secure_password_here';
CREATE DATABASE vibelegal OWNER vibelegal;
GRANT ALL PRIVILEGES ON DATABASE vibelegal TO vibelegal;
\q
```

#### Apply Database Schema
```bash
psql -h localhost -U vibelegal -d vibelegal -f /path/to/vibelegal/backend/database.sql
```

### Step 3: Application Deployment

#### Clone Repository
```bash
cd /var/www
sudo git clone <repository-url> vibelegal
sudo chown -R $USER:$USER /var/www/vibelegal
```

#### Backend Setup
```bash
cd /var/www/vibelegal/backend
npm install --production

# Create production environment file
sudo nano .env
```

Add the following to `.env`:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://vibelegal:secure_password_here@localhost:5432/vibelegal
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=<your_jwt_secret>
```

#### Frontend Build
```bash
cd /var/www/vibelegal/frontend
npm install
npm run build
```

### Step 4: Process Management

#### Create PM2 Ecosystem File
```bash
cd /var/www/vibelegal
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'vibelegal-backend',
    script: './backend/server.js',
    cwd: '/var/www/vibelegal',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/vibelegal/backend-error.log',
    out_file: '/var/log/vibelegal/backend-out.log',
    log_file: '/var/log/vibelegal/backend.log',
    time: true
  }]
};
```

#### Create Log Directory
```bash
sudo mkdir -p /var/log/vibelegal
sudo chown $USER:$USER /var/log/vibelegal
```

#### Start Application
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 5: Nginx Configuration

#### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/vibelegal
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend (React build)
    location / {
        root /var/www/vibelegal/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

#### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/vibelegal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: SSL Certificate (Let's Encrypt)

#### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### Obtain Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### Auto-renewal
```bash
sudo crontab -e
```

Add:
```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

## ☁️ Cloud Platform Deployment

### Heroku Deployment

#### Prerequisites
- Heroku CLI installed
- Git repository

#### Backend Deployment
```bash
cd backend
heroku create vibelegal-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set OPENAI_API_KEY=your_key
heroku config:set JWT_SECRET=<your_jwt_secret>
git push heroku main
```

#### Frontend Deployment
```bash
cd frontend
# Update API endpoints to Heroku backend URL
npm run build
# Deploy to Netlify, Vercel, or similar
```

### AWS Deployment

#### Using AWS Elastic Beanstalk
1. Create Elastic Beanstalk application
2. Upload backend code as ZIP
3. Configure environment variables
4. Set up RDS PostgreSQL instance
5. Deploy frontend to S3 + CloudFront

#### Using AWS ECS (Docker)
1. Create Docker images for backend
2. Push to ECR
3. Create ECS service
4. Set up Application Load Balancer
5. Configure RDS database

### Google Cloud Platform

#### Using App Engine
```yaml
# app.yaml for backend
runtime: nodejs18
env: standard
automatic_scaling:
  min_instances: 1
  max_instances: 10
env_variables:
  DATABASE_URL: "postgresql://..."
  OPENAI_API_KEY: "..."
  JWT_SECRET: "..."
```

## 🐳 Container Deployment

### Docker Setup

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

USER node

CMD ["node", "server.js"]
```

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: vibelegal
      POSTGRES_USER: vibelegal
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/database.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://vibelegal:password@database:5432/vibelegal
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      PORT: 5000
    ports:
      - "5000:5000"
    depends_on:
      - database

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### Deploy with Docker Compose
```bash
# Create .env file with secrets
# Create a local .env with OPENAI_API_KEY=<your_openai_api_key> > .env
# …and JWT_SECRET=<your_jwt_secret> >> .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Kubernetes Deployment

#### Database Deployment
```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_DB
          value: vibelegal
        - name: POSTGRES_USER
          value: vibelegal
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

#### Backend Deployment
```yaml
# k8s/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vibelegal-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vibelegal-backend
  template:
    metadata:
      labels:
        app: vibelegal-backend
    spec:
      containers:
      - name: backend
        image: vibelegal/backend:latest
        env:
        - name: DATABASE_URL
          value: postgresql://vibelegal:password@postgres-service:5432/vibelegal
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: openai-api-key
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        ports:
        - containerPort: 5000
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: vibelegal-backend
  ports:
  - port: 5000
    targetPort: 5000
```

## 🔧 Environment Configuration

### Production Environment Variables

#### Backend (.env)
```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# External Services
OPENAI_API_KEY=<your_openai_api_key>...
JWT_SECRET=<your_jwt_secret>

# Optional: Logging
LOG_LEVEL=info
LOG_FILE=/var/log/vibelegal/app.log

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

#### Frontend Environment
Update API endpoints in the frontend code:
```javascript
// src/config.js
const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.yourdomain.com' 
    : 'http://localhost:5000'
};
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Backend health check
curl https://api.yourdomain.com/api/health

# Database connection check
psql -h localhost -U vibelegal -d vibelegal -c "SELECT 1;"
```

### Log Management
```bash
# PM2 logs
pm2 logs vibelegal-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### Backup Strategy
```bash
# Database backup
pg_dump -h localhost -U vibelegal vibelegal > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/vibelegal"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -h localhost -U vibelegal vibelegal > $BACKUP_DIR/vibelegal_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

### Performance Monitoring
- Set up monitoring with tools like:
  - **Application**: New Relic, DataDog, or Sentry
  - **Infrastructure**: Prometheus + Grafana
  - **Uptime**: Pingdom, UptimeRobot
  - **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)

## 🔒 Security Checklist

### Pre-deployment Security
- [ ] All secrets in environment variables
- [ ] Database credentials secured
- [ ] HTTPS/SSL configured
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] CORS properly configured
- [ ] Dependencies updated

### Post-deployment Security
- [ ] Regular security updates
- [ ] Log monitoring
- [ ] Backup verification
- [ ] Access control review
- [ ] SSL certificate renewal
- [ ] Database security audit
- [ ] API endpoint testing

## 🚨 Troubleshooting

### Common Issues

#### "Cannot connect to database"
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U vibelegal -d vibelegal

# Check logs
sudo journalctl -u postgresql
```

#### "OpenAI API errors"
```bash
# Test API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Check usage limits
# Visit OpenAI dashboard
```

#### "Frontend not loading"
```bash
# Check Nginx status
sudo systemctl status nginx

# Check configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
```

#### "Backend not responding"
```bash
# Check PM2 status
pm2 status

# Restart application
pm2 restart vibelegal-backend

# Check logs
pm2 logs vibelegal-backend
```

### Performance Issues

#### High CPU Usage
- Check PM2 cluster mode is enabled
- Monitor database query performance
- Implement caching (Redis)
- Optimize OpenAI API calls

#### High Memory Usage
- Check for memory leaks in Node.js
- Optimize database connections
- Implement connection pooling
- Monitor garbage collection

#### Slow Response Times
- Enable Nginx gzip compression
- Implement CDN for static assets
- Optimize database queries
- Add application-level caching

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer (nginx, HAProxy, AWS ALB)
- Multiple backend instances
- Database read replicas
- CDN for static assets

### Vertical Scaling
- Increase server resources
- Optimize database configuration
- Tune Node.js performance
- Implement caching layers

### Database Scaling
- Connection pooling
- Read replicas
- Database sharding
- Query optimization

---

This deployment guide provides comprehensive instructions for deploying VibeLegal in various environments. Choose the deployment method that best fits your requirements and infrastructure.

