@echo off
echo ========================================
echo   FourierFun - Server Status
echo ========================================
echo.

echo Prüfe Server-Status...
echo.

REM Check if server is running
netstat -ano | findstr :3001 >nul
if %errorlevel% == 0 (
    echo ✓ Server läuft auf http://localhost:3001
    echo.
    echo Node.js Prozesse:
    tasklist /fi "imagename eq node.exe" /fo table
) else (
    echo ✗ Kein Server auf Port 3001 gefunden
)

echo.
echo ========================================
echo Verfügbare Aktionen:
echo ========================================
echo [1] Server starten
echo [2] Server stoppen  
echo [3] Browser öffnen
echo [4] Beenden
echo.

set /p choice="Wähle eine Option (1-4): "

if "%choice%"=="1" (
    call start-server.bat
) else if "%choice%"=="2" (
    call stop-server.bat
) else if "%choice%"=="3" (
    start http://localhost:3001
    echo Browser geöffnet.
    pause
) else if "%choice%"=="4" (
    exit /b
) else (
    echo Ungültige Auswahl.
    pause
)
