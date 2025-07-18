# Multi-Tenant Microfrontend Application

A full-stack multi-tenant application demonstrating JWT authentication, tenant isolation, microservices architecture, and n8n workflow automation. Built with React, Node.js, MongoDB, and Docker.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Multi-Tenant Architecture                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────────────────────────┐ │
│  │  Frontend Shell │◄───┤         Module Federation           │ │
│  │  (Port 3000)    │    │                                      │ │
│  └─────────────────┘    │  ┌─────────────────────────────────┐ │ │
│           │              │  │   Support Tickets App          │ │ │
│           │              │  │   (Port 3002)                   │ │ │
│           ▼              │  └─────────────────────────────────┘ │ │
│  ┌─────────────────┐    └──────────────────────────────────────┘ │
│  │   Backend API   │                                             │
│  │   (Port 3001)   │    ┌──────────────────────────────────────┐ │
│  └─────────────────┘    │             n8n Workflows           │ │
│           │              │             (Port 5678)             │ │
│           │              └──────────────────────────────────────┘ │
│           ▼                                                      │
│  ┌─────────────────┐                                             │
│  │    MongoDB      │                                             │
│  │   (Port 27017)  │                                             │
│  └─────────────────┘                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Features

### ✅ Requirements Satisfied

#### 🔐 R1: JWT Authentication
- Email/password login with bcrypt hashing
- JWT tokens include `customerId` and `role`
- Admin-only access to `/admin/*` routes
- Automatic token refresh and logout on expiry

#### 🛡️ R2: Tenant Isolation
- All MongoDB documents include `customerId`
- Comprehensive Jest tests proving tenant isolation
- Middleware enforces tenant boundaries on all requests

#### 🧭 R3: Use-Case Registry
- Static `registry.json` mapping `{tenant, screenUrl}`
- `/me/screens` API returns screens based on JWT tenant
- Role-based screen filtering

#### ⚛️ R4: React Shell with Module Federation
- Frontend shell fetches `/me/screens` and renders sidebar
- Lazy-loads microfrontends using Webpack Module Federation
- Dynamic loading with fallback handling

#### 📨 R5: n8n Workflow Integration
- `POST /api/tickets` triggers HTTP call to n8n
- n8n sends callback to `/webhook/ticket-done` with shared secret
- Backend verifies secret and updates ticket status
- Real-time UI updates via polling

#### 📦 R6: Containerized Development
- Complete Docker Compose setup
- All services containerized and networked
- Development volumes for hot reloading

### 🎁 Bonus Features Implemented
- **Audit Logging**: Complete audit trail with `{action, userId, tenant, timestamp}`
- **Beautiful UI**: Modern, responsive design with excellent UX
- **Role-based Access**: Granular permissions system
- **Real-time Updates**: Live workflow status tracking
- **Error Handling**: Comprehensive error handling and recovery

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### 1. Clone and Start

```bash
git clone <repository-url>
cd multitenant-microfrontend-app

# Start all services
docker-compose up --build
```

### 2. Wait for Services
- **Frontend Shell**: http://localhost:3000
- **Support Tickets App**: http://localhost:3002 (standalone)
- **Backend API**: http://localhost:3001
- **n8n**: http://localhost:5678
- **MongoDB**: localhost:27017

### 3. Create Demo Users

```bash
# Register demo users (or use the UI)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tenant-a.com",
    "password": "password123",
    "customerId": "tenant-a",
    "role": "Admin"
  }'

curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@tenant-b.com",
    "password": "password123",
    "customerId": "tenant-b",
    "role": "User"
  }'
```

### 4. Access the Application
Open http://localhost:3000 and use the demo user buttons or create your own accounts.

## 🧪 Testing Tenant Isolation

Run the comprehensive Jest test suite:

```bash
cd backend-api
npm test

# Or run specific test
npm test tenant-isolation.test.js
```

The tests prove that:
- Tenant A cannot access Tenant B's tickets
- Admin users cannot see other tenants' data
- API endpoints enforce tenant boundaries
- Database queries respect isolation

## 📋 Demo Script

### 1. Login as Different Tenants
1. Visit http://localhost:3000
2. Click "Admin tenant-a" demo button → Login
3. Observe sidebar shows tenant-specific screens
4. Logout and login as "User tenant-b"
5. Notice different screen names and permissions

### 2. Create and Manage Tickets
1. Login as any user
2. Click "Support Tickets" in sidebar
3. Click "Create Ticket"
4. Fill out form and submit
5. Observe "Workflow triggered: Yes" message
6. Watch ticket appear in list with workflow badge

### 3. n8n Workflow (Manual Setup Required)
1. Visit http://localhost:5678
2. Login: admin / password
3. Create workflow with HTTP trigger at `/webhook/ticket-created`
4. Add HTTP request node to callback `/webhook/ticket-done`
5. Include shared secret header: `n8n-shared-secret-123`

### 4. Verify Tenant Isolation
1. Login as tenant-a admin, create tickets
2. Login as tenant-b user
3. Verify you cannot see tenant-a tickets
4. Try direct API calls with different tenant tokens

## 🛠️ Development

### Local Development (without Docker)

```bash
# Terminal 1: Start MongoDB
docker run -p 27017:27017 mongo:7.0

# Terminal 2: Backend API
cd backend-api
npm install
npm run dev

# Terminal 3: Frontend Shell
cd frontend-shell
npm install
npm start

# Terminal 4: Support Tickets App
cd support-tickets-app
npm install
npm start

# Terminal 5: n8n
docker run -p 5678:5678 n8nio/n8n
```

### Environment Variables

Create `.env` files in each service:

**backend-api/.env:**
```
NODE_ENV=development
MONGODB_URI=mongodb://admin:password123@localhost:27017/multitenantapp?authSource=admin
JWT_SECRET=super-secret-jwt-key-12345
N8N_WEBHOOK_SECRET=n8n-shared-secret-123
N8N_WEBHOOK_URL=http://localhost:5678/webhook/ticket-created
```

**frontend-shell/.env:**
```
REACT_APP_API_URL=http://localhost:3001
```

**support-tickets-app/.env:**
```
REACT_APP_API_URL=http://localhost:3001
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Screens
- `GET /api/me/screens` - Get user's available screens
- `GET /api/admin/screens` - Get all screens (admin only)

### Tickets
- `GET /api/tickets` - Get user's tickets
- `POST /api/tickets` - Create ticket (triggers n8n)
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket (admin only)
- `GET /api/tickets/stats/summary` - Get ticket statistics

### Admin
- `GET /api/admin/users` - Get tenant users
- `GET /api/admin/tickets` - Get all tenant tickets
- `GET /api/admin/audit-logs` - Get audit logs
- `GET /api/admin/dashboard` - Get dashboard data

### Webhooks
- `POST /webhook/ticket-done` - n8n callback endpoint

## 🧩 Architecture Details

### Frontend Architecture
- **Shell Application**: Main container using Module Federation
- **Microfrontends**: Independent React apps loaded dynamically
- **Shared Dependencies**: React, React-DOM shared across apps
- **Routing**: Dynamic screen loading based on registry

### Backend Architecture
- **Middleware Stack**: Auth, tenant isolation, audit logging
- **Database Design**: All documents include `customerId` field
- **API Design**: RESTful with tenant-aware filtering
- **Security**: JWT tokens, bcrypt hashing, rate limiting

### n8n Integration
- **Trigger**: HTTP POST when ticket created
- **Callback**: Webhook endpoint with secret verification
- **Data Flow**: Ticket → n8n → Webhook → Database update

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API and auth endpoint protection  
- **Tenant Isolation**: Enforced at middleware level
- **Input Validation**: Request validation and sanitization
- **Audit Logging**: Complete action tracking
- **CORS**: Configured for development environment

## 📈 Monitoring and Logging

- **Health Checks**: Available for all services
- **Audit Logs**: User actions tracked with context
- **Error Handling**: Comprehensive error catching
- **Request Logging**: HTTP request tracking
- **Database Indexes**: Optimized for tenant queries

## 🐳 Docker Configuration

- **Multi-stage builds**: Optimized container sizes
- **Development volumes**: Hot reloading enabled
- **Network isolation**: Services communicate via Docker network
- **Environment separation**: Container-specific configs
- **Data persistence**: MongoDB and n8n data volumes

## 🧪 Testing Strategy

- **Unit Tests**: Component and utility testing
- **Integration Tests**: API endpoint testing
- **Tenant Isolation Tests**: Security boundary verification
- **End-to-End Tests**: Complete workflow testing
- **Mock Data**: Realistic test scenarios

## 🚀 Deployment Considerations

### Production Checklist
- [ ] Replace default JWT secret
- [ ] Configure production MongoDB
- [ ] Set up SSL/TLS certificates  
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure log aggregation
- [ ] Set up backup strategies
- [ ] Configure auto-scaling

### Environment Variables (Production)
```bash
NODE_ENV=production
MONGODB_URI=mongodb://user:pass@production-mongo:27017/app
JWT_SECRET=<secure-random-secret>
N8N_WEBHOOK_SECRET=<secure-webhook-secret>
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Webpack Team** - For Module Federation
- **n8n Team** - For the workflow automation platform
- **MongoDB** - For the flexible document database
- **Docker** - For containerization technology

---

## 📞 Support

For questions or issues:
1. Check the troubleshooting section
2. Review the logs: `docker-compose logs -f`
3. Open an issue on GitHub
4. Contact the development team

Happy coding! 🚀