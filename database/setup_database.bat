REM ========================================
REM SCRIPT DE SETUP - SaaS Delivery
REM ========================================
REM 
REM CUIDADO: Este script LIMPA o banco de dados!
REM Se já tem dados, faça backup primeiro!
REM
REM Uso:
REM 1. Abrir PowerShell como admin
REM 2. cd C:\Program Files\PostgreSQL\18\bin
REM 3. .\psql.exe -U postgres -d delivery_saas -f "C:\Users\yurid\vscode\sitemaDelivery-SaaS\database\database_saas.sql"
REM
REM Ou:
REM 1. Abrir PgAdmin (GUI)
REM 2. Conectar no banco delivery_saas
REM 3. Query Tool → Copy/Paste do database_saas.sql → Execute

@echo off
color 0A
title SaaS Delivery - Database Setup

echo ========================================
echo   SETUP - Database SaaS Delivery
echo ========================================
echo.

cd /d C:\Program Files\PostgreSQL\18\bin

echo Conectando ao banco de dados...
echo.

.\psql.exe -U postgres -h localhost -d delivery_saas -f "C:\Users\yurid\vscode\sitemaDelivery-SaaS\database\database_saas.sql"

if errorlevel 1 (
    echo.
    echo ERRO: Falha ao executar script SQL
    echo Verifique:
    echo   1. PostgreSQL está rodando?
    echo   2. Senha do usuario 'postgres' está correta?
    echo   3. Banco 'delivery_saas' existe?
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   DATABASE ATUALIZADO COM SUCESSO!
echo ========================================
echo.
echo Usuarios criados:
echo   Admin Master: admin@delivery.com / admin123
echo   Lojista Exemplo: loja@delivery.com / admin123
echo   Cliente Exemplo: cliente@delivery.com / admin123
echo.
echo Acesse: http://localhost:8000/admin-master.html
echo.
pause
