@echo off
echo ================================================
echo BBAS Frontend Setup Script
echo ================================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js version:
node --version
echo.

echo [2/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo.

echo [3/4] Checking environment configuration...
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env file with your Firebase credentials!
    echo.
) else (
    echo .env file already exists.
)
echo.

echo [4/4] Setup complete!
echo.
echo ================================================
echo Next Steps:
echo ================================================
echo 1. Edit .env file with your Firebase credentials
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000
echo.
echo For Firebase setup instructions, see: ..\docs\DEPLOYMENT.md
echo.
pause
