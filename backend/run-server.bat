@echo off
setlocal enabledelayedexpansion

REM Adicionar Node.js ao PATH
set PATH=C:\Program Files\nodejs;%PATH%

REM Ir para a pasta do backend
cd /d "c:\Users\yurid\vscode\sitemaDelivery-SaaS\backend"

REM Iniciar o servidor
npm start

pause
