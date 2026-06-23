@echo off
REM ExpenseSplit Pro - Quick Setup Script (Windows)
REM Run this after cloning the repo

echo 🚀 ExpenseSplit Pro - Quick Setup
echo ==================================

REM Check prerequisites
echo 📋 Checking prerequisites...

dotnet --version >nul 2>&1
if errorlevel 1 (
    echo ❌ .NET 8 SDK not found. Install from https://dotnet.microsoft.com/download
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Install from https://nodejs.org/
    exit /b 1
)

git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git not found. Install from https://git-scm.com/
    exit /b 1
)

echo ✅ All prerequisites met!

REM Setup Backend
echo.
echo 🔧 Setting up Backend...
cd backend\ExpenseSplit.Api
dotnet restore
echo ✅ Backend dependencies restored

REM Setup Frontend
echo.
echo ⚛️  Setting up Frontend...
cd ..\..rontend
npm install
echo ✅ Frontend dependencies installed

echo.
echo ==================================
echo ✅ Setup complete!
echo.
echo To start development:
echo   1. Backend: cd backend\ExpenseSplit.Api ^&^& dotnet run
echo   2. Frontend: cd frontend ^&^& npm start
echo.
echo For deployment guides:
echo   • GitHub Setup: type GITHUB_SETUP.md
echo   • AWS Deploy:   type AWS_DEPLOYMENT.md
echo ==================================
pause
