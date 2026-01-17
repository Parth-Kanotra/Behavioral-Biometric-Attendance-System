#!/bin/bash

echo "================================================"
echo "BBAS Frontend Setup Script"
echo "================================================"
echo ""

echo "[1/4] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "Node.js version: $(node --version)"
echo ""

echo "[2/4] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies!"
    exit 1
fi
echo ""

echo "[3/4] Checking environment configuration..."
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Please edit .env file with your Firebase credentials!"
    echo ""
else
    echo ".env file already exists."
fi
echo ""

echo "[4/4] Setup complete!"
echo ""
echo "================================================"
echo "Next Steps:"
echo "================================================"
echo "1. Edit .env file with your Firebase credentials"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "For Firebase setup instructions, see: ../docs/DEPLOYMENT.md"
echo ""
