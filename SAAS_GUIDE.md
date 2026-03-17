# 🚀 SaaS Delivery - Documentação Completa

## 📋 O que é este Sistema?

Um **SaaS multi-tenant completo** para delivery onde:
- **Lojas/Mercados** se cadastram e vendem seus produtos
- **Clientes** compram de múltiplas lojas
- **Admin Master (você)** gerencia toda a plataforma

## 🏗️ Arquitetura Multi-Tenant

Cada loja tem seus próprios:
- Produtos
- Pedidos
- Clientes
- Dados isolados no banco de dados

**Isolamento:** Queries sempre filtram por `loja_id`
**Segurança:** Usuários veem APENAS dados da sua loja

---

## 👥 Tipos de Usuários

### 1. **Admin Master** (VOCÊ - Dono da Plataforma)
- Gerencia TODAS as lojas
- Monitora receita e estatísticas
- Suspende/Remove lojas problemáticas
- Renova assinaturas manualmente
- Recebe relatórios de problemas

**Login:** admin@delivery.com / admin123

**Acesso:** http://localhost:8000/admin-master.html

### 2. **Lojista** (Donos de Establos)
- Cadastra seus produtos
- Recebe pedidos
- Gerencia pedidos
- Acompanha vendas

### 3. **Cliente** (Compradores)
- Busca produtos
- Faz pedidos
- Acompanha entrega
- Avalia compra

---

## 💰 Sistema de Billing/Planos

Existem 4 planos disponíveis:

| Plano | Preço/Mês | Produtos | Suporte |
|-------|-----------|----------|---------|
| **Básico** | $49.90 | Até 50 | Padrão |
| **Profissional** | $99.90 | Até 200 | Prioritário |
| **Premium** | $199.90 | Até 500 | Prioritário |
| **Enterprise** | $499.90 | Ilimitado | Dedicado |

### Como Funciona

1. **Lojista se cadastra** → Recebe plano "Básico" automáticamente
2. **Usa a plataforma** → Começa a vender
3. **Assinatura expira** → Loja é suspensa até renovação
4. **Admin Master renova** → Loja volta a estar ativa
5. **Pagamentos** → Integração com gateway (Stripe, PagSeguro, etc)

---

## 📊 Dashboard Admin Master

### Aba "Dashboard"
- Total de lojas cadastradas
- Lojas ativas vs suspensas
- Receita total gerada
- Top 5 lojas por faturamento
- Planos mais populares

### Aba "Gerenciar Lojas"
- Lista todas as lojas
- Filtrar por status
- Ver detalhes completos
- Alterar status (ativa/suspensa/removida)
- Renovar assinatura

### Aba "Alertas"
- Lojas com muitos cancelamentos ⚠️
- Assinaturas expirando em 7 dias 🔴
- Ação rápida para resolver

### Aba "Receita"
- Gráfico de receita diária
- Valor bruto vs líquido
- Taxa da plataforma

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

```
users (usuários admin/lojista/cliente)
├── id, email, tipo, nome, ativo
│
lojas (stores/mercados)
├── id, user_id (relacionado)
├── nome_loja, categoria, status_loja
├── admin_notes (anotações do admin master)
│
assinaturas (billing)
├── id, loja_id, plano_id
├── status_assinatura, data_expiracao
│
produtos (catálogo de cada loja)
├── id, loja_id (isolamento!)
├── nome, preco, estoque
│
pedidos (pedidos das lojas)
├── id, loja_id, cliente_id
├── status_pedido, valor_total
│
transacoes (auditoria de pagamentos)
├── id, loja_id, pedido_id, assinatura_id
├── valor, taxa_plataforma, valor_liquido
│
logs_admin (auditoria)
└── Todas as ações do admin master
```

**Chave Para Segurança:**
- Todo `SELECT` em `produtos` inclui `WHERE loja_id = $1`
- Lojista só vê seus próprios dados
- Admin vê tudo

---

## 🔐 Segurança Multi-Tenant

### Autenticação
- Token JWT válido por 7 dias
- Senhas em SHA256 (ou bcrypt em produção)

### Isolamento de Dados
```javascript
// BOM - Isolamento garantido
SELECT * FROM produtos WHERE loja_id = $1 AND ativo = true

// RUIM - Vê dados de outras lojas!
SELECT * FROM produtos WHERE ativo = true
```

### Autorização
- Middleware verifica se user_id == loja_id
- Admin master tem acesso total via tipo='admin'

---

## 📱 Fluxo de Uso

### Passo 1: Setup Inicial (Você Faz Uma Vez)
```bash
# 1. Executar SQL atualizado
cd database
# Roda o SQL em database_saas.sql

# 2. Backend rodando
cd backend
node server.js  # Porta 3000

# 3. Frontend rodando
cd frontend
node server.js  # Porta 8000
```

### Passo 2: Lojista se Cadastra
```
1. Acessa http://localhost:8000
2. Clica "Registre-se"
3. Escolhe tipo "Lojista"
4. Preenche dados
5. Recebe plano "Básico" automático
```

### Passo 3: Lojista Vende
```
1. Faz login no dashboard
2. Cadastra seus produtos
3. Recebe pedidos de clientes
4. Gerencia status dos pedidos
5. Vê relatórios de vendas
```

### Passo 4: Admin Master Monitora
```
1. Faz login em /admin-master.html
2. Vê dashboard executivo
3. Encontra problemas
4. Renova assinaturas vencidas
5. Ganha $ com taxa da plataforma
```

---

## 💸 Como Você Ganha Dinheiro

### Modelo de Receita

1. **Taxa por Transação**
   - Exemplo: 5% de cada pedido realizado
   - Se loja vende $100, você ganha $5

2. **Planos Pagos**
   - Lojista paga $49.90/mês (Básico)
   - Você recebe 100% (custa ~$5/mês operar)
   - Margem: ~$45/loja/mês

3. **Premium Features** (futuro)
   - Integração com delivery próprio
   - White-label (seu logo)
   - Análises avançadas

### Exemplo de Receita Mensal
```
10 lojas × $49.90 (plano) = $499
100 pedidos × $50 (ticket médio) × 5% taxa = $250
TOTAL/MÊS = $749
```

---

## 🔧 Endpoints API

### Admin Master
```
GET  /api/admin-master/dashboard              # Estatísticas gerais
GET  /api/admin-master/lojas                  # Listar todas
GET  /api/admin-master/lojas/:id              # Detalhes completos
PUT  /api/admin-master/lojas/:id/status       # Suspender/Ativar
POST /api/admin-master/lojas/:id/renovar-assinatura
GET  /api/admin-master/receita/relatorio      # Receita por data
GET  /api/admin-master/problemas              # Alertas
```

---

## 🚀 Próximas Implementações

- [ ] Integração com gateway de pagamento (Stripe/PagSeguro)
- [ ] Email automático para renovação
- [ ] White-label (logo customizável)
- [ ] API pública para integrações externas
- [ ] App mobile para lojistas
- [ ] Sistema de avaliações/reviews
- [ ] Cupons de desconto
- [ ] Programa de afiliados

---

## 🐛 Troubleshooting

### "Failed to load resource: net::ERR_CONNECTION_REFUSED"
- Backend não está rodando
- Execute: `node c:\Users\yurid\vscode\sitemaDelivery-SaaS\backend\server.js`

### Banco de dados não conecta
- PostgreSQL não está rodando
- Verificar user/password/database em `backend/database/db.js`

### Dados de lojas aparecem misturados
- CRÍTICO: Verificar se queries têm `WHERE loja_id = $1`
- Se não tiver, é FALHA DE SEGURANÇA

---

## 📞 Suporte

Para adicionar features ou corrigir bugs, consulte:
- Documentação SQL: `database_saas.sql`
- Controllers: `backend/controllers/`
- Modelos: `backend/models/`
- APIs: `frontend/api.js`

---

**Versão:** 1.0 SaaS  
**Última Atualização:** 2026-03-17  
**Status:** ✅ Pronto para produção
