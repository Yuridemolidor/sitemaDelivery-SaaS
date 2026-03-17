@echo off
echo.
echo =====================================
echo Iniciando Servidor Backend
echo =====================================
echo.

cd /d "C:\Users\yurid\vscode\sitemaDelivery-SaaS\backend"

echo Instalando dependencias...
"C:\Program Files\nodejs\npm.cmd" install

echo.
echo Iniciando servidor...
"C:\Program Files\nodejs\node.exe" server.js

pause
