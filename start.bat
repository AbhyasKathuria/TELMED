@echo off
title TELMED - Continuous Remote Monitoring & Telemedicine Platform
color 0B

echo ======================================================================
echo                     TELMED Telehealth Platform
echo          Continuous Remote Patient Monitoring & Telemedicine
echo ======================================================================
echo.

cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your system PATH!
    echo Please install Node.js from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules\" (
    echo [INFO] First time setup detected. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed successfully.
    echo.
)

echo [INFO] Starting TELMED Vite Development Server...
echo [INFO] Application will open at http://localhost:5173
echo.

:: Open browser after a short delay in background
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: Start the Vite server
call npm run dev

pause
