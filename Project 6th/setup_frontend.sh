#!/bin/bash

echo "Setting up News Aggregator Frontend..."
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "Please install Node.js using nvm:"
    echo "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash"
    echo "source ~/.bashrc  # or ~/.zshrc or ~/.profile depending on your shell"
    echo "nvm install node"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo "✓ npm found: $(npm --version)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Install dependencies
echo "Installing npm dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "Frontend setup complete!"
echo "To start the development server:"
echo "npm start"
echo ""
echo "The frontend will be available at: http://localhost:3000" 