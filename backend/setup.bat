@echo off
REM Script para criar o banco de dados automaticamente
REM Precisa da senha do postgres

echo.
echo ====================================
echo Criando Banco de Dados Delivery SaaS
echo ====================================
echo.

REM Definir variáveis
set PGBIN=C:\Program Files\PostgreSQL\18\bin
set PGUSER=postgres
set PGHOST=localhost
set PGPORT=5432

REM Criar banco de dados
echo Criando banco de dados...
"%PGBIN%\psql.exe" -U %PGUSER% -h %PGHOST% -p %PGPORT% -c "CREATE DATABASE delivery_saas;" 2>nul

REM Verificar se criou
if %errorlevel% neq 0 (
    echo.
    echo Banco pode ja existir, continuando...
    echo.
)

REM Executar script SQL
echo Criando tabelas e dados iniciais...
"%PGBIN%\psql.exe" -U %PGUSER% -h %PGHOST% -p %PGPORT% -d delivery_saas -f "%~dp0..\database.sql"

echo.
echo ====================================
echo Configuracao concluida!
echo ====================================
echo.
echo Credenciais de Admin:
echo Email: admin@delivery.com
echo Senha: admin123
echo.
pause
