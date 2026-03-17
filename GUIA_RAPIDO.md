# 🚀 Guia Rápido - Iniciar a Aplicação

## PASSO 1: Criar o Banco de Dados

### Windows (PowerShell como ADMINISTRADOR):

```powershell
# 1. Abra o SQL Shell (psql)
psql -U postgres

# 2. Na linha de comando do PostgreSQL, execute:
CREATE DATABASE delivery_saas;

# 3. Saia digitando: \q
```

Ou execute o script SQL completo:
```powershell
psql -U postgres -f "C:\Users\yurid\vscode\sitemaDelivery-SaaS\database.sql"
```

---

## PASSO 2: Instalar Dependências

```bash
# Entre na pasta do backend
cd c:\Users\yurid\vscode\sitemaDelivery-SaaS\backend

# Instale as dependências
npm install
```

---

## PASSO 3: Testar Conexão com o Banco

```bash
# Ainda na pasta backend
node testarConexao.js
```

Se ver ✅ verde = tudo OK!

---

## PASSO 4: Iniciar o Servidor Backend

```bash
# Na pasta backend
npm start
```

Você deve ver:
```
Servidor rodando na porta 3000
```

---

## PASSO 5: Acessar o Frontend

Abra outro terminal e:

```bash
# Na pasta frontend
cd c:\Users\yurid\vscode\sitemaDelivery-SaaS\frontend

# Inicie um servidor local (se tiver Python)
python -m http.server 8000

# Ou use o Live Server do VS Code
```

Acesse em: **http://localhost:8000**

---

## 📝 Credenciais Padrão

**Login:**
- Email: `admin@delivery.com`
- Senha: `admin123`

---

## ⚠️ Possíveis Erros

### Erro: "role "postgres" does not exist"
```bash
# Crie o usuário
createuser -U postgres postgres
```

### Erro: "FATAL: password authentication failed"
Certifique-se que a senha é `123456` (conforme em db.js)

### Erro: "database "delivery_saas" does not exist"
Execute o script SQL novamente

---

## ✅ Checklist

- [ ] PostgreSQL está rodando
- [ ] Banco `delivery_saas` foi criado
- [ ] `npm install` foi executado na pasta backend
- [ ] `node testarConexao.js` passou ✅
- [ ] `npm start` iniciou o servidor na porta 3000
- [ ] Frontend está rodando na porta 8000
- [ ] Você consegue acessar http://localhost:8000
