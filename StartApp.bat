@echo off
title Smart Queue Management System
echo =======================================================
echo    SMART QUEUE MANAGEMENT SYSTEM - LAUNCHER
echo =======================================================
echo.
echo Checking for node_modules...
if not exist node_modules (
    echo [INFO] node_modules not found. Installing packages...
    call npm install
) else (
    echo [INFO] node_modules found.
)
echo.
echo [INFO] Launching development server and opening browser...
call npm run dev -- --open
pause
