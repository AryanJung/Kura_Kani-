#!/bin/bash

echo "Setting up News Aggregator Backend..."
echo "====================================="

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install requirements (excluding torch)
echo "Installing Python dependencies..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✓ Python dependencies installed successfully"
else
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

# Install PyTorch separately (CPU version)
echo "Installing PyTorch (CPU version)..."
pip install torch --index-url https://download.pytorch.org/whl/cpu

if [ $? -eq 0 ]; then
    echo "✓ PyTorch installed successfully"
else
    echo "⚠️  PyTorch installation failed, but continuing..."
    echo "You can install it manually later with:"
    echo "pip install torch --index-url https://download.pytorch.org/whl/cpu"
fi

# Test the setup
echo "Testing setup..."
python test_setup.py

echo ""
echo "Setup complete! To start the server:"
echo "1. Activate the virtual environment: source venv/bin/activate"
echo "2. Start the server: python start_server.py"
echo ""
echo "The server will be available at: http://localhost:8000" 