@echo off
echo ========================================
echo   FourierFun - Server stoppen
echo ========================================
echo.

echo Stoppe alle Node.js Prozesse...
taskkill /f /im node.exe >nul 2>&1

if %errorlevel% == 0 (
    echo ✓ Server erfolgreich gestoppt.
) else (
    echo ⚠ Kein Server gefunden oder bereits gestoppt.
)

echo.
echo Prüfe Port 3001...
netstat -ano | findstr :3001 >nul
if %errorlevel% == 0 (
    echo ⚠ Port 3001 ist noch belegt!
) else (
    echo ✓ Port 3001 ist frei.
)

echo.
pause
