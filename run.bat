@echo off
title Travel Itinerary Optimizer Launcher
echo ==========================================================
echo    Travel Itinerary Optimizer (DAA Project Prototype)
echo    Algorithms: TSP, Dynamic Programming, Branch and Bound
echo ==========================================================

echo.
echo [1/2] Launching Flask Backend on http://127.0.0.1:5055...
start "Flask Backend" cmd /k "cd /d "%~dp0backend" && python app.py"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Vite Frontend on http://localhost:3000...
cd /d "%~dp0frontend"
npm run dev
