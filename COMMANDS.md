# Guruweb - Command Cheat Sheet

## Initial Setup (Run Once)

### 1. Reorganize Project Structure

```bash
cd GURUWEB

# Create backend directory
mkdir -p backend/src/{config,controllers,models,routes,middleware}

# Move frontend code to frontend folder
mkdir frontend
mv src public index.html package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts tailwind.config.ts eslint.config.ts .prettierrc netlify.toml netlify-build.sh frontend/

# Copy all backend files from the zip/download
# Extract guruweb-backend.zip to your GURUWEB directory
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your own passwords
nano .env
# or
code .env
```

### 3. Make Setup Script Executable

```bash
chmod +x setup.sh
```

### 4. Run Setup

```bash
./setup.sh
```

## Daily Development

### Start Everything

```bash
# Start backend (Docker)
docker-compose up -d

# Start frontend (separate terminal)
cd frontend
npm run dev
```

### Stop Everything

```bash
# Stop Docker containers
docker-compose down

# Frontend stops automatically (Ctrl+C)
```

## Backend Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just database
docker-compose logs -f db
```

### Access Database

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U admin -d guruweb

# Inside psql:
\dt                     # List tables
\d users                # Describe users table
SELECT * FROM users;    # View all users
SELECT * FROM services; # View all services
\q                      # Quit
```

### Reset Database

```bash
# Stop containers
docker-compose down

# Remove volumes (WARNING: Deletes all data!)
docker volume rm guruweb_postgres_data

# Start again
docker-compose up -d

# Reinitialize
docker-compose exec backend npm run init-db
```

### Backend Development

```bash
# Restart backend only
docker-compose restart backend

# View backend logs
docker-compose logs -f backend

# Run commands inside backend container
docker-compose exec backend npm run init-db
docker-compose exec backend node src/config/initDb.js
```

## Frontend Commands

### Development

```bash
cd frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Install Dependencies

```bash
cd frontend
npm install axios        # Install axios for API calls
npm install              # Install all dependencies
```

## Testing API

### Using curl

**Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Get Services (requires token):**

```bash
TOKEN="your_jwt_token_here"

curl http://localhost:3000/api/services \
  -H "Authorization: Bearer $TOKEN"
```

**Create Service:**

```bash
curl -X POST http://localhost:3000/api/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username":"HENGI",
    "serviceName":"Traducción",
    "client":"Cliente A",
    "time":"10:00 AM",
    "earnings":500
  }'
```

### Using Browser/Postman

1. **Login:** POST to `http://localhost:3000/api/auth/login`
2. **Copy token** from response
3. **Add header:** `Authorization: Bearer <token>`
4. **Make requests** to other endpoints

## Useful Docker Commands

```bash
# View running containers
docker-compose ps

# View all containers (including stopped)
docker ps -a

# Remove all stopped containers
docker-compose rm

# View disk usage
docker system df

# Clean up unused images/containers
docker system prune

# Rebuild containers
docker-compose up -d --build

# View container resource usage
docker stats
```

## Troubleshooting

### Port Already in Use

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"
```

### Database Connection Failed

```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

### Backend Not Starting

```bash
# Check logs
docker-compose logs backend

# Rebuild backend
docker-compose up -d --build backend

# Check if .env exists
ls -la .env
```

### Frontend Can't Connect to Backend

```bash
# Check if backend is running
curl http://localhost:3000/health

# Check CORS settings in backend
# Edit backend/src/index.js if needed

# Check frontend .env
cat frontend/.env
```

## Default Credentials

**Admin:**

- Username: `admin`
- Password: `admin123`

**Employees:**

- Username: `hengi` / `marleni` / `israel` / `thaicar`
- Password: `password123`

**⚠️ CHANGE THESE IN PRODUCTION!**

## File Structure

```
GURUWEB/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── initDb.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── servicesController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Service.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── services.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── index.js
│   ├── init.sql
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── docker-compose.yml
├── .env
└── README.md
```

## Quick Reference URLs

- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **Frontend Dev:** http://localhost:5173
- **Database:** localhost:5432

## Need Help?

1. Check README.md for detailed info
2. Check FRONTEND_INTEGRATION.md for frontend setup
3. Check logs: `docker-compose logs -f`
4. Check API health: `curl http://localhost:3000/health`
