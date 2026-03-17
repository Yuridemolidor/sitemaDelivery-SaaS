@echo off
echo.
echo ======================================
echo Sistema Delivery SaaS - Startup
echo ======================================
echo.
echo Iniciando Backend na porta 3000...
start cmd /k "C:\Users\yurid\vscode\sitemaDelivery-SaaS\backend\start.bat"

timeout /t 3

echo.
echo Iniciando Frontend na porta 8000...
start cmd /k "C:\Users\yurid\vscode\sitemaDelivery-SaaS\frontend\start.bat"

echo.
echo ======================================
echo ✓ Tudo inicializado!
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:8000
echo ======================================
echo.

pause
