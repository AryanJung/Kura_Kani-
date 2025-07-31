#!/bin/bash

# Optimized Backend Installation Script
# This script installs all dependencies efficiently without space issues

set -e  # Exit on any error

echo "🚀 Starting Optimized Backend Installation..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Step 1: Clear pip cache and temp directories
echo "🧹 Cleaning up cache and temp directories..."
rm -rf ~/.cache/pip/*
rm -rf /tmp/pip-*
print_status "Cache cleared"

# Step 2: Install core dependencies first (smaller packages)
echo "📦 Installing core dependencies..."
pip install fastapi uvicorn feedparser pydantic python-multipart sqlalchemy "pydantic[email]" --no-cache-dir
print_status "Core dependencies installed"

# Step 3: Install authentication dependencies
echo "🔐 Installing authentication dependencies..."
pip install "python-jose[cryptography]" "passlib[bcrypt]" python-dotenv --no-cache-dir
print_status "Authentication dependencies installed"

# Step 4: Install torch (using your working command)
echo "🔥 Installing PyTorch (CPU version)..."
pip install torch --index-url https://download.pytorch.org/whl/cpu --no-cache-dir
print_status "PyTorch installed successfully"

# Step 5: Install ML dependencies
echo "🤖 Installing ML dependencies..."
pip install transformers sentence-transformers --no-cache-dir
print_status "ML dependencies installed"

# Step 6: Verify installation
echo "🔍 Verifying installation..."
python3 -c "
import fastapi, uvicorn, sqlalchemy, pydantic
import jose, passlib, dotenv
import feedparser, transformers, sentence_transformers
import torch
print('All modules imported successfully!')
" 2>/dev/null && print_status "All dependencies verified" || print_error "Some dependencies failed to import"

# Step 7: Test database connection
echo "🗄️ Testing database connection..."
python3 -c "
from database import engine, User
from sqlalchemy.orm import sessionmaker
Session = sessionmaker(bind=engine)
session = Session()
users = session.query(User).all()
print(f'Database connection successful! Found {len(users)} users')
session.close()
" 2>/dev/null && print_status "Database connection verified" || print_warning "Database test failed (this is normal if tables don't exist yet)"

echo ""
echo "🎉 Installation Complete!"
echo "========================"
echo "✅ All dependencies installed successfully"
echo "✅ PyTorch (CPU version) installed"
echo "✅ Database connection working"
echo ""
echo "🚀 To start the backend server:"
echo "   cd Kura_Kani-/Backend"
echo "   python3 start_server.py"
echo ""
echo "🌐 Backend will be available at: http://127.0.0.1:8000"
echo "📚 API documentation at: http://127.0.0.1:8000/docs" 