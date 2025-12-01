#!/bin/bash

echo "🚀 Setting up Guruweb Dashboard..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and update passwords/secrets before continuing!"
    echo ""
    read -p "Press Enter to continue after editing .env..."
fi

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 10

# Initialize database
echo "🗄️  Initializing database..."
docker-compose exec -T backend npm run init-db

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "📍 Backend API: http://localhost:3000"
echo "🏥 Health check: http://localhost:3000/health"
echo ""
echo "👤 Default Credentials:"
echo "   Admin: username=admin, password=admin123"
echo "   Employees: username=hengi/marleni/israel/thaicar, password=password123"
echo ""
echo "🔧 Setting up frontend..."
echo ""

# Setup frontend
if [ -d "frontend" ]; then
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    echo ""
    echo "✅ Frontend setup complete!"
    echo ""
    echo "To start frontend development server:"
    echo "   cd frontend"
    echo "   npm run dev"
    echo ""
    echo "Frontend will be available at: http://localhost:5173"
else
    echo "⚠️  Frontend directory not found. Please run the reorganization commands first."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Start frontend: cd frontend && npm run dev"
echo "2. Test API: curl http://localhost:3000/health"
echo "3. Login with default credentials"
echo "4. Check README.md for integration instructions"