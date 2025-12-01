# Guruweb Dashboard - Quick Start

## 📦 What You Have

Complete full-stack application with:

- ✅ PostgreSQL database with Docker
- ✅ Express REST API with JWT authentication
- ✅ Ready-to-integrate with your existing React frontend
- ✅ Admin + Employee role management
- ✅ Service tracking with 50/50 profit split
- ✅ Complete documentation

## 🚀 Get Started in 3 Steps

### Step 1: Reorganize Your Project (5 minutes)

```bash
cd ~/path/to/GURUWEB

# Download and extract guruweb-backend.zip to this directory
# Then:

# Move your current code to frontend folder
mkdir frontend
mv src public index.html package.json package-lock.json tsconfig.json \
   tsconfig.node.json vite.config.ts tailwind.config.ts eslint.config.ts \
   .prettierrc netlify.toml netlify-build.sh frontend/

# Your structure should now be:
# GURUWEB/
# ├── backend/
# ├── frontend/
# ├── docker-compose.yml
# └── .env
```

### Step 2: Start Backend (2 minutes)

```bash
# Copy and configure environment
cp .env.example .env
nano .env  # Change passwords!

# Make setup script executable
chmod +x setup.sh

# Run setup (starts Docker + initializes database)
./setup.sh
```

**Backend is now running at http://localhost:3000**

### Step 3: Integrate Frontend (10 minutes)

```bash
cd frontend

# Install axios
npm install axios

# Create API service file
# Copy from FRONTEND_INTEGRATION.md (Step 2)

# Update AuthContext
# Copy from FRONTEND_INTEGRATION.md (Step 4)

# Start dev server
npm run dev
```

**Done! 🎉**

## 🔑 Default Login Credentials

**Admin:**

- Username: `admin`
- Password: `admin123`

**Employees:**

- `hengi` / `password123`
- `marleni` / `password123`
- `israel` / `password123`
- `thaicar` / `password123`

⚠️ **Change these immediately in production!**

## 📚 Documentation Guide

| File                        | Purpose                                          |
| --------------------------- | ------------------------------------------------ |
| **README.md**               | Complete overview and setup instructions         |
| **COMMANDS.md**             | All commands you'll need (reference this often!) |
| **FRONTEND_INTEGRATION.md** | Step-by-step frontend integration                |
| **ARCHITECTURE.md**         | How everything works together                    |
| **DEPLOYMENT.md**           | Production deployment guide                      |

## 🎯 What's Next?

### Today:

1. [x] Run `./setup.sh`
2. [ ] Test backend: `curl http://localhost:3000/health`
3. [ ] Integrate frontend (follow FRONTEND_INTEGRATION.md)
4. [ ] Test login and data entry

### This Week:

- [ ] Change default passwords
- [ ] Customize for your specific needs
- [ ] Test with real data
- [ ] Deploy to production (see DEPLOYMENT.md)

## 🆘 Quick Troubleshooting

**Backend not starting?**

```bash
docker-compose logs backend
```

**Database connection failed?**

```bash
docker-compose restart db
docker-compose logs db
```

**Port 3000 already in use?**

```bash
lsof -i :3000
kill -9 <PID>
```

**Need to reset everything?**

```bash
docker-compose down
docker volume rm guruweb_postgres_data
./setup.sh
```

## 🔗 Quick Links

- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health
- Frontend Dev: http://localhost:5173 (after `npm run dev`)
- Database: localhost:5432

## 📊 API Endpoints Reference

**Authentication:**

- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

**Services:**

- `GET /api/services` - Get services (filtered by role)
- `POST /api/services` - Create service (admin only)
- `GET /api/services/stats/admin` - Admin stats
- `GET /api/services/stats/user/:id` - User stats
- `DELETE /api/services/:id` - Delete service

## 💡 Common Tasks

**Add a new service (via API):**

```bash
TOKEN="your_jwt_token"
curl -X POST http://localhost:3000/api/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username":"HENGI",
    "serviceName":"Traducción",
    "earnings":500
  }'
```

**Check database:**

```bash
docker-compose exec db psql -U admin -d guruweb
SELECT * FROM users;
SELECT * FROM services;
\q
```

**View logs:**

```bash
docker-compose logs -f
```

**Restart backend:**

```bash
docker-compose restart backend
```

## ✨ Your Typical Workflow

1. Start backend: `docker-compose up -d`
2. Start frontend: `cd frontend && npm run dev`
3. Login at http://localhost:5173
4. Add services via dashboard
5. View reports and statistics
6. Stop when done: `docker-compose down`

## 🎨 Your Frontend Components

**Already Built:**

- ✅ AdminDataTable.tsx - Shows all user data
- ✅ DataTable.tsx - Employee view
- ✅ DataModificationForm.tsx - Add services
- ✅ DataCharts.tsx - Visualizations
- ✅ DashboardLayout.tsx - Layout wrapper

**Need to Update:**

- 🔄 AuthContext - Use real API
- 🔄 Login page - Connect to backend
- 🔄 Data fetching - Replace prop data with API calls

See **FRONTEND_INTEGRATION.md** for exact code.

## 🏗️ Project Structure

```
GURUWEB/
├── backend/
│   ├── src/
│   │   ├── config/        # Database setup
│   │   ├── controllers/   # Business logic
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, etc.
│   │   └── index.js       # Main server
│   ├── Dockerfile
│   ├── init.sql
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/      # Add API service here
│   └── package.json
├── docker-compose.yml
├── .env
└── README.md
```

## 💪 You're Ready!

You now have:

- ✅ Production-ready backend
- ✅ PostgreSQL database
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Complete documentation
- ✅ Docker deployment ready

**Questions?** Check:

1. COMMANDS.md for specific commands
2. FRONTEND_INTEGRATION.md for frontend integration
3. ARCHITECTURE.md to understand how it works
4. DEPLOYMENT.md when you're ready to go live

Good luck! 🚀
