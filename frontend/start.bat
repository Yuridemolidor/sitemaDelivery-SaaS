@echo off
echo.
echo =====================================
echo Iniciando Servidor Frontend
echo =====================================
echo.

cd /d "C:\Users\yurid\vscode\sitemaDelivery-SaaS\frontend"

echo.
echo Servidor rodando em: http://localhost:8000
echo.

python -m http.server 8000

pause
