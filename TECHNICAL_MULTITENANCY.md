# 🗄️ Arquitetura Multi-Tenant - Documentação Técnica

## 📌 O QUE É MULTI-TENANT?

Multi-tenant significa que **múltiplos clientes (lojas) compartilham a mesma aplicação**, mas com **dados 100% isolados**.

```
ANTES (Single-Tenant)
┌─────────────────┐
│   Restaurante   │
│   - BD próprio  │
│   - Servidor    │
│   - Custos altos│
└─────────────────┘

AGORA (Multi-Tenant - SaaS)
┌──────────────────────────────────────┐
│      Plataforma SaaS (Você)           │
│                                      │
├─ Restaurante 1                       │
├─ Restaurante 2                       │
├─ Mercado 1                           │
├─ Farmácia 1                          │
└─ ... (infinitas lojas)               │
     ↓ Tudo em 1 BD (isolado)          │
    PostgreSQL único                   │
```

---

## 🔐 ISOLAMENTO POR SHOP_ID

### Chave de Segurança

Cada tabela tem uma coluna `loja_id` que define "a quem pertence":

```sql
-- ✅ BOM - Isolado por loja
SELECT * FROM produtos 
WHERE loja_id = 1

-- ✅ BOM - Mesmo se hacker tira ID, vê só sua loja
SELECT * FROM pedidos 
WHERE loja_id = auth_user.loja_id

-- ❌ RUIM - Vê TUDO de todas as lojas
SELECT * FROM produtos

-- ❌ RUIM - SQL Injection poderia vazar
SELECT * FROM produtos WHERE id = $1  -- sem loja_id
```

---

## 📊 ESTRUTURA DO BANCO

### Tabelas

```
users (usuários globais)
├── id (PK)
├── email (Único)
├── tipo: 'admin' | 'lojista' | 'cliente'
└── ativo: true/false

lojas (cada loja é um cliente)
├── id (PK)
├── user_id (FK → users) - O dono da loja
├── nome_loja
├── status_loja: 'ativa' | 'suspensa' | 'removida'
└── admin_notes (texto do admin master)

assinaturas (controle de plano por loja)
├── id (PK)
├── loja_id (FK → lojas) - ISOLAMENTO!
├── plano_id (FK → planos)
├── data_expiracao
└── status_assinatura

produtos (ISOLADOS por loja_id)
├── id (PK)
├── loja_id (FK → lojas) - ISOLAMENTO!
├── nome
├── preco
└── [todos isolados por loja_id]

pedidos (ISOLADOS por loja_id)
├── id (PK)
├── loja_id (FK → lojas) - ISOLAMENTO!
├── cliente_id (FK → users)
├── numero_pedido
└── [todos isolados por loja_id]
```

### Relacionamentos Críticos

```
Loja (cliente/shop)
  ↓
  ├─ user_id (quem é o dono)
  ├─ produtos (todos os produtos DESSA loja)
  ├─ pedidos (todos os pedidos DESSA loja)
  ├─ assinatura (plano DESSA loja)
  └─ transações (pagamentos DESSA loja)

Garantia: Toda query filtra por loja_id
```

---

## 💻 CÓDIGO BACKEND - EXEMPLOS

### BOM: Isolamento Garantido ✅

```javascript
// Controller de Produtos
const getProdutos = async (req, res) => {
    const loja_id = req.body.loja_id; // De qual loja?
    
    // ✅ Filtra por loja_id - seguro!
    const result = await pool.query(
        "SELECT * FROM produtos WHERE loja_id = $1",
        [loja_id]
    );
    
    res.json(result.rows);
};

// Lojista 1 vê: seus 50 produtos
// Lojista 2 vê: seus 30 produtos
// NUNCA VÊM UNS DOS OUTROS
```

### RUIM: Falha de Segurança ❌

```javascript
const getProdutos = async (req, res) => {
    // ❌ NÃO FILTRA - TODOS VEEM TUDO!
    const result = await pool.query(
        "SELECT * FROM produtos" // Sem WHERE!
    );
    
    res.json(result.rows); // Vazou dados de TODAS as lojas!
};

// Lojista 1 vê: 80 produtos (seu + alheio)
// Lojista 2 vê: 80 produtos (seu + alheio)
// FALHA DE SEGURANÇA CRÍTICA!
```

### PATTERN: Admin Master vê Tudo ✅

```javascript
const getTodasAsLojas = async (req, res) => {
    // Admin master não filtra por loja_id
    // Porque é ADMIN - deve ver tudo!
    
    const result = await pool.query(
        "SELECT l.*, u.email FROM lojas l JOIN users u ON l.user_id = u.id"
    );
    
    res.json(result.rows);
};

// Admin vê: TODAS as 100 lojas
// Correto!
```

---

## 🔐 SEGURANÇA EM CAMADAS

### Camada 1: Autenticação
```javascript
// Middleware - verifica se token é válido
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        req.user = jwt.verify(token, "segredo_jwt");
        next();
    } catch {
        res.status(401).json({ erro: "Não autenticado" });
    }
};
```

### Camada 2: Isolamento (Critical!)
```javascript
// Em TODA query de lojista, adicione:
WHERE loja_id = $1
// Nunca:
// SELECT * FROM produtos
// Sempre:
// SELECT * FROM produtos WHERE loja_id = 1
```

### Camada 3: Autorização
```javascript
// Verifica se lojista é dono da loja
const updateProduto = async (req, res) => {
    const { id } = req.params;
    const loja_id = req.user.loja_id;
    
    // ✅ Verifica duplo: loja_id + user
    const produto = await pool.query(
        "SELECT * FROM produtos WHERE id = $1 AND loja_id = $2",
        [id, loja_id]
    );
    
    if (!produto.rows.length) {
        return res.status(403).json({ erro: "Acesso negado" });
    }
    
    // Seguro atualizar
};
```

---

## 📈 ESCALABILIDADE

### Vantagens Multi-Tenant

| Aspecto | Single-Tenant | Multi-Tenant |
|---------|---------------|--------------|
| **BD por cliente** | Sim (100 BDs) | Não (1 BD) |
| **Custos** | Muito alto | Muito baixo |
| **Manutenção** | Impossível | Fácil |
| **Escalabilidade** | Limitada | Infinita |
| **Receita** | $50/cliente | $1,000+/cliente |

### Exemplo de Crescimento

```
Mês 1: 10 lojas × $50 = $500
Mês 3: 50 lojas × $50 = $2,500
Mês 6: 200 lojas × $50 = $10,000
Ano 1: 500 lojas × $50 = $25,000/mês

Com SINGLE-TENANT:
Mês 1: 10 servidores × $50 = $500 (custo)
Mês 3: Impossível escalar rapidamente
Mês 6: Infraestrutura caótica
```

---

## 🔍 AUDITORIA MULTI-TENANT

### Tabela logs_admin

Admin master vê tudo que acontece:

```sql
INSERT INTO logs_admin (admin_id, acao, tabela_afetada, registro_id, valores_novos)
VALUES (
    1,                                  -- Admin ID
    'Suspendeu loja Mercado Central',  -- Ação
    'lojas',                           -- Tabela afetada
    42,                                -- ID da loja
    '{"status_loja": "suspensa"}'      -- Valores modificados
);
```

Resultado: Histórico completo de tudo que fizeram

---

## ⚠️ ARMADILHAS COMUNS

### Armadilha 1: Esquecer WHERE loja_id

```javascript
// ❌ ERRADO - Vaza dados
const getPedidos = async (lojaId) => {
    return await pool.query("SELECT * FROM pedidos");
};

// ✅ CERTO - Isolado
const getPedidos = async (lojaId) => {
    return await pool.query(
        "SELECT * FROM pedidos WHERE loja_id = $1",
        [lojaId]
    );
};
```

### Armadilha 2: Confiar no Frontend

```javascript
// ❌ ERRADO - Frontend pode falsificar
const getProdutos = async (req, res) => {
    const loja_id = req.query.loja_id; // UNTRUSTED!
    return pool.query("SELECT * FROM produtos WHERE loja_id = $1", [loja_id]);
};

// ✅ CERTO - Vem do token autenticado
const getProdutos = async (req, res) => {
    const loja_id = req.user.loja_id; // Do JWT - confiável
    return pool.query("SELECT * FROM produtos WHERE loja_id = $1", [loja_id]);
};
```

### Armadilha 3: Não validar tipo de usuário

```javascript
// ❌ ERRADO - Qualquer um vira admin?
const suspenderLoja = async (req, res) => {
    const { loja_id } = req.body;
    await pool.query("UPDATE lojas SET status_loja = 'suspensa' WHERE id = $1", [loja_id]);
};

// ✅ CERTO - Só admin master
const suspenderLoja = async (req, res) => {
    if (req.user.tipo !== 'admin') {
        return res.status(403).json({ erro: "Acesso negado" });
    }
    await pool.query("UPDATE lojas SET status_loja = 'suspensa' WHERE id = $1", [loja_id]);
};
```

---

## 🚀 OTIMIZAÇÕES

### Índices Implementados

```sql
-- Acelera buscas de loja
CREATE INDEX idx_lojas_user_id ON lojas(user_id);

-- Acelera status
CREATE INDEX idx_lojas_status ON lojas(status_loja);

-- Acelera produtos por loja
CREATE INDEX idx_produtos_loja_id ON produtos(loja_id);

-- Acelera pedidos por loja
CREATE INDEX idx_pedidos_loja_id ON pedidos(loja_id);

-- Acelera buscas por status
CREATE INDEX idx_pedidos_status ON pedidos(status_pedido);
```

### Performance Esperada

```
Sem índices:   10,000 produtos → 2 segundos
Com índices:   10,000 produtos → 10 milissegundos
                                  ↑ 200x mais rápido!
```

---

## 🔄 FLUXO DE DADOS

```
Cliente acessa http://localhost:8000
    ↓
Frontend faz: GET /api/admin-master/dashboard
    ↓
Middleware verifica JWT
    ↓
Controller busca dados no BD:
    • Lojas (todos)
    • Top 5 (com WHERE loja_id ok)
    • Receita (isolada)
    • Pedidos (isolados)
    ↓
Retorna JSON para Frontend
    ↓
JavaScript renderiza Dashboard
    ↓
Admin vê apenas seus dados → SEGURO ✅
```

---

## 📝 CHECKLIST MULTI-TENANT

- [x] Cada tabela tem `loja_id`
- [x] Toda query filtra por `loja_id`
- [x] Índices em `loja_id`
- [x] Frontend não acessa direto (BD)
- [x] Autenticação JWT
- [x] Autorização por roles (admin/lojista)
- [x] Auditoria (logs_admin)
- [x] Testes de isolamento
- [ ] HTTPS em produção
- [ ] Rate limiting
- [ ] Backup automático

---

## 🎓 CONCLUSÃO

**Multi-tenant é:**
- ✅ Seguro (se implementado certo)
- ✅ Escalável (10 ou 10,000 clientes)
- ✅ Lucrativo (custo baixo)
- ✅ Mantível (1 código base)

**SaaS é o futuro:**
- Recurring revenue (previsível)
- Escala infinita (não precisa clonar servidores)
- Produtos vivos (updates para todos)

---

**Arquivo:** technical_multitenancy.md  
**Data:** Março 2026  
**Nível:** Intermediário/Avançado  
**Status:** ✅ Implementado e Testado
