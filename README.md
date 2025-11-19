# Guruweb Dashboard

Full-stack dashboard application for managing services and earnings with admin/employee roles.

## 🏗️ Architecture

```
guruweb/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + PostgreSQL
├── docker-compose.yml # Container orchestration
└── .env              # Environment variables
```

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Git

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to your project
cd GURUWEB

# Copy environment variables
cp .env.example .env

# Edit .env and change passwords/secrets
nano .env
```

### 2. Start with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

The backend will be available at `http://localhost:3000`

### 3. Initialize Database

```bash
# Run database initialization (creates tables and default users)
docker-compose exec backend npm run init-db
```

**Default Credentials:**

- Admin: `username: admin, password: admin123`
- Employees:
  - `username: hengi, password: password123` (HENGI)
  - `username: marleni, password: password123` (MARLENI)
  - `username: israel, password: password123` (ISRAEL)
  - `username: thaicar, password: password123` (THAICAR)

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔌 API Endpoints

### Authentication

**POST** `/api/auth/login`

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response:

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "dataColumn": null
  }
}
```

**GET** `/api/auth/me` (requires auth)

### Services

**GET** `/api/services` (requires auth)

- Query params: `startDate`, `endDate`
- Returns: Array of services (filtered by role)

**POST** `/api/services` (admin only)

```json
{
  "username": "HENGI",
  "serviceName": "Traducción",
  "client": "Cliente A",
  "time": "10:00 AM",
  "earnings": 500.0,
  "date": "2025-01-15"
}
```

**GET** `/api/services/stats/user/:userId?` (requires auth)

- Returns: User statistics

**GET** `/api/services/stats/admin` (admin only)

- Returns: All users stats + admin total

**DELETE** `/api/services/:id` (requires auth)

## 🔧 Frontend Integration

### 1. Install Axios

```bash
cd frontend
npm install axios
```

### 2. Create API Service

Create `frontend/src/services/api.ts`:

```typescript
import axios from "axios";

const API_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (username: string, password: string) =>
    api.post("/auth/login", { username, password }),
  getCurrentUser: () => api.get("/auth/me"),
};

export const servicesAPI = {
  getServices: (startDate?: string, endDate?: string) =>
    api.get("/services", { params: { startDate, endDate } }),
  createService: (data: any) => api.post("/services", data),
  getUserStats: (userId?: number) =>
    api.get(`/services/stats/user/${userId || ""}`),
  getAdminStats: () => api.get("/services/stats/admin"),
  deleteService: (id: number) => api.delete(`/services/${id}`),
};

export default api;
```

### 3. Update AuthContext

Replace your mock authentication with real API calls:

```typescript
import { authAPI } from "../services/api";

const login = async (username: string, password: string) => {
  const response = await authAPI.login(username, password);
  const { token, user } = response.data;

  localStorage.setItem("token", token);
  setUser(user);
  // navigate to dashboard
};
```

### 4. Update Data Fetching

In your dashboard components, replace prop data with API calls:

```typescript
import { servicesAPI } from "../services/api";

useEffect(() => {
  const fetchData = async () => {
    const response = await servicesAPI.getServices();
    setData(response.data);
  };
  fetchData();
}, []);
```

### 5. Update DataModificationForm

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  await servicesAPI.createService({
    username: selectedUser,
    serviceName,
    client,
    time,
    earnings: parseFloat(earnings),
  });

  // Refresh data
  onServiceAdded();
};
```

## 🗄️ Database Schema

### users

- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR UNIQUE)
- `password_hash` (VARCHAR)
- `role` (VARCHAR: 'admin' | 'employee')
- `data_column` (VARCHAR: 'HENGI' | 'MARLENI' | 'ISRAEL' | 'THAICAR')
- `created_at` (TIMESTAMP)

### services

- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER REFERENCES users)
- `service_name` (VARCHAR)
- `client` (VARCHAR)
- `time` (VARCHAR)
- `earnings` (DECIMAL)
- `date` (DATE)
- `created_at` (TIMESTAMP)

## 🛠️ Development

### Backend Only

```bash
cd backend
npm install
npm run dev
```

### Frontend Only

```bash
cd frontend
npm install
npm run dev
```

### View Database

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U admin -d guruweb

# Useful queries
\dt                    # List tables
SELECT * FROM users;   # View users
SELECT * FROM services; # View services
\q                     # Quit
```

## 📦 Production Deployment

### Using Docker

```bash
# Build production images
docker-compose -f docker-compose.prod.yml up -d

# Or push to your server
git push
ssh your-server
cd guruweb
docker-compose up -d
```

### Environment Variables

Update `.env` with production values:

```env
DB_PASSWORD=strong_random_password
JWT_SECRET=very_strong_random_secret
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

## 🔒 Security Notes

- Change all default passwords in production
- Use strong JWT secrets
- Enable HTTPS (add Traefik/Nginx)
- Set proper CORS origins
- Regularly backup the database

## 🐛 Troubleshooting

**Database connection issues:**

```bash
docker-compose logs db
docker-compose restart db
```

**Backend not starting:**

```bash
docker-compose logs backend
docker-compose exec backend npm install
```

**Port conflicts:**

```bash
# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead of 3000
```

## 📝 TODO

- [ ] Add data validation
- [ ] Implement pagination
- [ ] Add export to Excel feature
- [ ] Email notifications
- [ ] Backup automation
- [ ] Add tests

## 👨‍💻 Author

JAOCruz - Premium Website Builder & Software Developer

## 📄 License

Private Project
