#!/bin/bash
# ExpenseSplit Pro - Quick Setup Script
# Run this after cloning the repo

echo "🚀 ExpenseSplit Pro - Quick Setup"
echo "=================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET 8 SDK not found. Install from https://dotnet.microsoft.com/download"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org/"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Install from https://git-scm.com/"
    exit 1
fi

echo "✅ All prerequisites met!"

# Setup Backend
echo ""
echo "🔧 Setting up Backend..."
cd backend/ExpenseSplit.Api
dotnet restore
echo "✅ Backend dependencies restored"

# Setup Frontend
echo ""
echo "⚛️  Setting up Frontend..."
cd ../../frontend
npm install
echo "✅ Frontend dependencies installed"

echo ""
echo "=================================="
echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  1. Backend: cd backend/ExpenseSplit.Api && dotnet run"
echo "  2. Frontend: cd frontend && npm start"
echo ""
echo "For deployment guides:"
echo "  • GitHub Setup: cat GITHUB_SETUP.md"
echo "  • AWS Deploy:   cat AWS_DEPLOYMENT.md"
echo "=================================="
