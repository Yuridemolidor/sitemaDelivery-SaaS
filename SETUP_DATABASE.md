# Script de Configuração do Banco de Dados - Delivery SaaS

## Pré-requisitos
- PostgreSQL instalado e rodando
- Usuário `postgres` com senha `123456`

## Instruções para criar o banco de dados

### Windows (PowerShell ou CMD):

```bash
# 1. Abra o PostgreSQL
psql -U postgres

# 2. Execute o script SQL
\i C:\Users\yurid\vscode\sitemaDelivery-SaaS\database.sql

# Ou execute diretamente:
psql -U postgres -f C:\Users\yurid\vscode\sitemaDelivery-SaaS\database.sql
```

### Linux/Mac:

```bash
# 1. Abra o PostgreSQL
sudo -u postgres psql

# 2. Execute o script SQL
\i /path/to/database.sql

# Ou execute diretamente:
sudo -u postgres psql -f /path/to/database.sql
```

## O que foi criado:

✅ Banco de dados `delivery_saas`
✅ Tabelas: users, planos, lojas, assinaturas, produtos, pedidos
✅ Índices para otimização
✅ Planos padrão (Básico, Profissional, Premium, Enterprise)
✅ Usuário admin padrão:
   - Email: `admin@delivery.com`
   - Senha: `admin123`

## Verificar a conexão

Após criar o banco, teste a aplicação rodando:

```bash
cd backend
npm install
npm start
```

## Dados de teste

O banco já vem com:
- 4 planos pré-configurados
- 1 usuário admin
- Tabelas prontas para receber lojas, produtos e pedidos
