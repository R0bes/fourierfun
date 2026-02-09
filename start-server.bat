@echo off
echo ========================================
echo   FourierFun - Server Management
echo ========================================
echo.

REM Check if server is already running
netstat -ano | findstr :3001 >nul
if %errorlevel% == 0 (
    echo Server läuft bereits auf Port 3001
    echo Möchtest du ihn stoppen? (j/n)
    set /p choice=
    if /i "%choice%"=="j" (
        echo Stoppe alle Node.js Prozesse...
        taskkill /f /im node.exe >nul 2>&1
        echo Server gestoppt.
        pause
        exit /b
    ) else (
        echo Server läuft weiter.
        pause
        exit /b
    )
)

echo Starte FourierFun Server...
echo.

REM Start the server
npm run dev

echo.
echo Server gestoppt.
pause
