@echo off
echo.
echo ============================================
echo   BULLETPROOF QB SECURIEGNTY BACKEND
echo ============================================
echo   Starting the most reliable server ever!
echo ============================================
echo.

REM Kill any existing Node processes
echo Cleaning up any existing Node processes...
taskkill /F /IM node.exe >nul 2>&1

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Generate Prisma client
echo Generating Prisma client...
npx prisma generate

REM Start the bulletproof server
echo.
echo Starting bulletproof server...
echo.
node bulletproof-final-server.js

pause
