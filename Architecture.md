# Guruweb Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Browser                       │
│                    (http://localhost:5173)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Components:                                         │   │
│  │  • Login Page                                        │   │
│  │  • Dashboard Layout                                  │   │
│  │  • Admin Data Table                                  │   │
│  │  • Employee Data Table                               │   │
│  │  • Data Modification Form                            │   │
│  │  • Charts (Recharts)                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Services:                                           │   │
│  │  • API Service (axios)                               │   │
│  │  • Auth Context                                      │   │
│  │  • Data Transformer                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ JWT Bearer Token
                         │ API Calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│             Backend (Node.js + Express)                      │
│               (http://localhost:3000)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Routes:                                             │   │
│  │  • /api/auth/login         (POST)                    │   │
│  │  • /api/auth/me            (GET)                     │   │
│  │  • /api/services           (GET, POST, DELETE)       │   │
│  │  • /api/services/stats/*   (GET)                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Middleware:                                         │   │
│  │  • CORS                                              │   │
│  │  • JWT Authentication                                │   │
│  │  • Role-based Authorization (Admin/Employee)        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Controllers:                                        │   │
│  │  • authController                                    │   │
│  │  • servicesController                                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Models:                                             │   │
│  │  • User (bcrypt, JWT)                                │   │
│  │  • Service                                           │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ SQL Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Database (PostgreSQL 15)                        │
│                  (localhost:5432)                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Tables:                                             │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │ users                                         │  │   │
│  │  │  • id (PK)                                   │  │   │
│  │  │  • username (UNIQUE)                         │  │   │
│  │  │  • password_hash                             │  │   │
│  │  │  • role (admin/employee)                     │  │   │
│  │  │  • data_column (HENGI/MARLENI/etc)          │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │ services                                      │  │   │
│  │  │  • id (PK)                                   │  │   │
│  │  │  • user_id (FK → users)                      │  │   │
│  │  │  • service_name                              │  │   │
│  │  │  • client                                    │  │   │
│  │  │  • time                                      │  │   │
│  │  │  • earnings                                  │  │   │
│  │  │  • date                                      │  │   │
│  │  │  • created_at                                │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow

```
User Login
    ↓
Frontend: POST /api/auth/login
    ↓
Backend: authController.login()
    ↓
Model: User.findByUsername()
    ↓
Database: SELECT * FROM users WHERE username = ?
    ↓
Model: User.verifyPassword() (bcrypt)
    ↓
Backend: Generate JWT token
    ↓
Frontend: Store token in localStorage
    ↓
Frontend: Redirect to /dashboard
```

### 2. Fetching Services Flow (Employee)

```
Dashboard Load
    ↓
Frontend: GET /api/services (with JWT)
    ↓
Backend: authMiddleware (verify JWT)
    ↓
Backend: servicesController.getServices()
    ↓
Model: Service.getByUserId(req.user.id)
    ↓
Database: SELECT * FROM services WHERE user_id = ? AND date >= ?
    ↓
Backend: Return filtered services
    ↓
Frontend: Transform data for display
    ↓
Frontend: Render DataTable component
```

### 3. Adding Service Flow (Admin)

```
Admin clicks "Agregar Servicio"
    ↓
Frontend: DataModificationForm
    ↓
User fills: username, serviceName, earnings
    ↓
Frontend: POST /api/services (with JWT)
    ↓
Backend: authMiddleware + isAdmin
    ↓
Backend: servicesController.createService()
    ↓
Model: User.findByUsername() or find by data_column
    ↓
Model: Service.create()
    ↓
Database: INSERT INTO services VALUES (...)
    ↓
Backend: Return created service
    ↓
Frontend: Refresh services list
    ↓
Frontend: Update DataTable
```

### 4. Admin Statistics Flow

```
Admin Dashboard Load
    ↓
Frontend: GET /api/services/stats/admin (with JWT)
    ↓
Backend: authMiddleware + isAdmin
    ↓
Backend: servicesController.getAdminStats()
    ↓
Model: Service.getAllUsersStats()
    ↓
Database: Complex JOIN and GROUP BY query
    ↓
Database: Calculate totals, 50/50 splits
    ↓
Backend: Return aggregated statistics
    ↓
Frontend: Display AdminDataTable with summary
```

## Security Architecture

### JWT Token Flow

```
┌──────────────────────────────────────────────────────────┐
│  1. Login Success                                         │
│     Backend generates JWT with payload:                   │
│     {                                                     │
│       id: user.id,                                       │
│       username: user.username,                           │
│       role: user.role,                                   │
│       dataColumn: user.data_column,                      │
│       exp: timestamp + 7 days                            │
│     }                                                     │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  2. Token Storage                                         │
│     localStorage.setItem('token', jwt_token)             │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  3. Every API Request                                     │
│     Headers: { Authorization: 'Bearer <token>' }         │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  4. Backend Verification                                  │
│     • Middleware extracts token                          │
│     • jwt.verify(token, JWT_SECRET)                      │
│     • Attach user info to req.user                       │
│     • Check role for admin routes                        │
└──────────────────────────────────────────────────────────┘
```

### Password Hashing

```
User Registration/Password Change
    ↓
bcrypt.hash(password, 10) // 10 salt rounds
    ↓
Store hash in database (NOT plaintext)
    ↓
Login: bcrypt.compare(inputPassword, storedHash)
```

## Docker Architecture

```
┌────────────────────────────────────────────────────────────┐
│                      Docker Host                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  guruweb_backend Container                           │ │
│  │  • Node.js 18 Alpine                                 │ │
│  │  • Port 3000 → 3000                                  │ │
│  │  • Volume: ./backend/src → /app/src                  │ │
│  │  • Depends on: db                                    │ │
│  │  • Auto-restart on code changes (nodemon)            │ │
│  └──────────────────────────────────────────────────────┘ │
│                          ↓ DB_HOST=db                      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  guruweb_db Container                                │ │
│  │  • PostgreSQL 15 Alpine                              │ │
│  │  • Port 5432 → 5432                                  │ │
│  │  • Volume: postgres_data → /var/lib/postgresql/data │ │
│  │  • Volume: ./backend/init.sql → /init.sql           │ │
│  │  • Healthcheck every 10s                             │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Named Volume: postgres_data                         │ │
│  │  • Persists database data                            │ │
│  │  • Survives container restarts                       │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## API Endpoint Architecture

### Public Endpoints (No Auth Required)

- `POST /api/auth/login` - User authentication

### Protected Endpoints (JWT Required)

- `GET /api/auth/me` - Get current user info
- `GET /api/services` - Get services (filtered by role)
- `DELETE /api/services/:id` - Delete service

### Admin-Only Endpoints (JWT + Admin Role)

- `POST /api/services` - Create new service
- `GET /api/services/stats/admin` - Admin dashboard stats

### Employee + Admin Endpoints

- `GET /api/services/stats/user/:userId?` - User statistics

## Technology Stack

### Frontend

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **State Management:** React Context API

### Backend

- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Database Driver:** node-postgres (pg)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **CORS:** cors middleware
- **Environment:** dotenv

### Database

- **RDBMS:** PostgreSQL 15
- **Connection:** TCP/IP (port 5432)
- **Pooling:** pg Pool

### DevOps

- **Containerization:** Docker + Docker Compose
- **Process Manager:** nodemon (development)
- **Volume Persistence:** Docker named volumes

## Performance Considerations

### Database Indexes

```sql
CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_services_date ON services(date);
CREATE INDEX idx_services_created_at ON services(created_at);
```

### Connection Pooling

- Backend uses `pg.Pool` for efficient database connections
- Reuses connections instead of creating new ones

### Frontend Optimization

- Lazy loading for routes
- Memoization for expensive calculations
- Virtual scrolling for large datasets (future enhancement)

## Scalability Path

### Current (Single Server)

```
Frontend (Static Files) → Backend (Single Container) → Database (Single Container)
```

### Future (Production Scale)

```
CDN → Load Balancer → Backend Cluster → Database Primary/Replica
                    ↓
              Redis Cache
```

## Security Best Practices Implemented

✅ Password hashing with bcrypt (10 rounds)
✅ JWT with expiration (7 days)
✅ CORS configuration
✅ SQL injection prevention (parameterized queries)
✅ Role-based access control
✅ Environment variables for secrets
✅ No sensitive data in logs

## Monitoring & Logging

### Current Implementation

- Console logging for requests
- Error logging to console
- Docker logs via `docker-compose logs`

### Future Enhancements

- [ ] Winston/Pino for structured logging
- [ ] Log aggregation (ELK stack)
- [ ] Application monitoring (Prometheus + Grafana)
- [ ] Error tracking (Sentry)
