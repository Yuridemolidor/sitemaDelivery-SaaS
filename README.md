# Sitema Delivery SaaS

Uma plataforma completa de SaaS para gerenciamento de delivery com backend robusto e frontend moderno.

## 📋 Características

### Backend
- ✅ API RESTful completa com Express.js
- ✅ Autenticação JWT e autorização por tipo de usuário
- ✅ Validação de dados robusta
- ✅ Tratamento de erros consistente
- ✅ Múltiplos modelos de dados (Lojas, Produtos, Pedidos, Usuários, Assinaturas, Planos)
- ✅ Middlewares de segurança
- ✅ Relatórios e analytics
- ✅ PostgreSQL como banco de dados

### Frontend
- ✅ Interface responsiva com Bootstrap 5
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de Lojas
- ✅ Catálogo de Produtos
- ✅ Gestão de Pedidos
- ✅ Painel Administrativo com Gráficos
- ✅ Autenticação (Login/Registro)
- ✅ Sistema de tokens JWT

## 📁 Estrutura do Projeto

```
sitemaDelivery-SaaS/
├── backend/
│   ├── server.js                 # Servidor principal
│   ├── controllers/              # Lógica de negócio
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── lojaController.js
│   │   ├── pedidoController.js
│   │   ├── produtoController.js
│   │   └── userController.js
│   ├── models/                   # Modelos de dados
│   │   ├── Assinatura.js
│   │   ├── Loja.js
│   │   ├── Pedido.js
│   │   ├── Plano.js
│   │   ├── Produto.js
│   │   └── User.js
│   ├── routes/                   # Definição de rotas
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── lojaRoutes.js
│   │   ├── pedidoRoutes.js
│   │   ├── produtoRoutes.js
│   │   └── userRoutes.js
│   ├── middlewares/              # Middlewares customizados
│   │   └── authMiddleware.js
│   └── database/                 # Configuração do banco de dados
│       └── db.js
├── frontend/
│   ├── index.html                # Home
│   ├── login.html                # Login
│   ├── register.html             # Cadastro
│   ├── dashboard.html            # Dashboard principal
│   ├── lojas.html                # Gerenciar lojas
│   ├── produtos.html             # Gerenciar produtos
│   ├── pedidos.html              # Gerenciar pedidos
│   ├── admin.html                # Painel admin
│   ├── css/
│   │   └── style.css             # Estilos globais
│   └── js/
│       ├── api.js                # Funções de API
│       ├── auth.js               # Lógica de autenticação
│       ├── register.js           # Lógica de registro
│       ├── dashboard.js          # Dashboard
│       ├── lojas.js              # Gerenciar lojas
│       ├── produtos.js           # Gerenciar produtos
│       ├── pedidos.js            # Gerenciar pedidos
│       └── admin.js              # Painel administrativo
└── README.md
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (v14+)
- PostgreSQL
- npm ou yarn

### Backend

1. Instale as dependências:
```bash
cd backend
npm install express cors bcrypt jsonwebtoken pg dotenv
```

2. Configure o banco de dados em `backend/database/db.js`:
```javascript
const pool = new Pool({
    user: "seu_usuario",
    host: "localhost",
    database: "delivery_saas",
    password: "sua_senha",
    port: 5432
});
```

3. Inicie o servidor:
```bash
node server.js
```

O servidor rodará em `http://localhost:3000`

### Frontend

1. Abra o `index.html` em um servidor local ou use:
```bash
# Se tiver Python instalado
python -m http.server 8000

# Ou com Live Server no VS Code
```

Acesse em `http://localhost:8000`

## 🔐 Autenticação

A aplicação usa JWT para autenticação:
- Token é armazenado em `localStorage`
- Requisições autenticadas incluem o token no header: `Authorization: {token}`
- Token expira em 7 dias

### Tipos de Usuário
- **admin**: Acesso total ao painel administrativo
- **loja**: Gerenciamento de sua loja, produtos e pedidos
- **cliente**: Visualização de lojas e produtos

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Fazer logout

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário
- `POST /api/users/:id/change-password` - Alterar senha

### Lojas
- `GET /api/lojas` - Listar lojas
- `POST /api/lojas` - Criar loja
- `GET /api/lojas/:id` - Obter loja
- `GET /api/lojas/:id/stats` - Estatísticas da loja
- `GET /api/lojas/user/:user_id` - Lojas de um usuário
- `PUT /api/lojas/:id` - Atualizar loja
- `DELETE /api/lojas/:id` - Deletar loja

### Produtos
- `GET /api/produtos/loja/:loja_id` - Produtos de uma loja
- `POST /api/produtos` - Criar produto
- `GET /api/produtos/:id` - Obter produto
- `GET /api/produtos/search` - Buscar produtos
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Deletar produto

### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `POST /api/pedidos` - Criar pedido
- `GET /api/pedidos/:id` - Obter pedido
- `GET /api/pedidos/loja/:loja_id` - Pedidos de uma loja
- `GET /api/pedidos/loja/:loja_id/stats` - Estatísticas de pedidos
- `PUT /api/pedidos/:id` - Atualizar pedido
- `PUT /api/pedidos/:id/status` - Alterar status do pedido
- `DELETE /api/pedidos/:id` - Deletar pedido

### Admin
- `GET /api/admin/dashboard` - Dashboard administrativo
- `GET /api/admin/relatorio/pedidos` - Relatório de pedidos
- `GET /api/admin/lojas/mais-vendidas` - Lojas mais vendidas
- `GET /api/admin/produtos/mais-vendidos` - Produtos mais vendidos
- `GET /api/admin/estatisticas/gerais` - Estatísticas gerais

## 💾 Banco de Dados

### Schema SQL necessário

```sql
-- Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'cliente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Planos
CREATE TABLE planos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    limite_produtos INT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lojas
CREATE TABLE lojas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    telefone VARCHAR(20) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    taxa_entrega DECIMAL(10,2),
    pix VARCHAR(255),
    user_id INT REFERENCES users(id),
    plano_id INT REFERENCES planos(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assinaturas
CREATE TABLE assinaturas (
    id SERIAL PRIMARY KEY,
    loja_id INT REFERENCES lojas(id),
    plano_id INT REFERENCES planos(id),
    data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ativa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Produtos
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    imagem VARCHAR(255),
    categoria VARCHAR(100),
    loja_id INT REFERENCES lojas(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'aguardando pagamento',
    loja_id INT REFERENCES lojas(id),
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Itens de Pedido (opcional)
CREATE TABLE itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(id),
    produto_id INT REFERENCES produtos(id),
    quantidade INT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 Funcionalidades

### Para Proprietários de Lojas
- Criar e gerenciar múltiplas lojas
- Adicionar e editar produtos
- Organizar por categorias
- Acompanhar pedidos em tempo real
- Ver estatísticas de vendas
- Configurar chave PIX e taxa de entrega

### Para Clientes
- Navegar por lojas e produtos
- Fazer pedidos
- Acompanhar status do pedido
- Gerenciar perfil

### Para Administradores
- Visualizar estatísticas gerais
- Analisar lojas mais vendidas
- Acompanhar produtos mais vendidos
- Gerar relatórios de pedidos
- Gerenciar usuários

## 🛠 Melhorias Futuras

- [ ] Integração com gateway de pagamento
- [ ] Notificações em tempo real (Socket.io)
- [ ] Sistema de avaliações e reviews
- [ ] Cupons e promoções
- [ ] Integração com mapas (entrega)
- [ ] Emails automáticos
- [ ] App mobile (React Native)
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Docker support

## 📝 Notas

- Certifique-se de que o PostgreSQL está rodando
- As senhas são hash com bcrypt
- Os tokens JWT expiram em 7 dias
- A API é CORS habilitada para localhost:8000 e similares

## 👨‍💻 Desenvolvimento

Para desenvolver novos features:

1. Crie uma branch nova: `git checkout -b feature/nova-feature`
2. Faça suas alterações
3. Commit: `git commit -m "Adiciona nova-feature"`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📧 Suporte

Para suporte, envie um email para support@sitemadelivery.com

---

**Desenvolvido com ❤️ usando Node.js, Express e Bootstrap**