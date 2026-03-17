-- Criação do banco de dados
CREATE DATABASE delivery_saas;

-- Conectar ao banco
\c delivery_saas

-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('admin', 'loja', 'cliente')),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de planos
CREATE TABLE planos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    limite_produtos INTEGER NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de lojas
CREATE TABLE lojas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    telefone VARCHAR(20) NOT NULL,
    endereco TEXT NOT NULL,
    taxa_entrega DECIMAL(10, 2) DEFAULT 0,
    pix VARCHAR(255),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plano_id INTEGER NOT NULL REFERENCES planos(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de assinaturas
CREATE TABLE assinaturas (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    plano_id INTEGER NOT NULL REFERENCES planos(id),
    data_inicio TIMESTAMP DEFAULT NOW(),
    data_fim TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ativa' CHECK (status IN ('ativa', 'cancelada', 'expirada')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    imagem VARCHAR(255),
    categoria VARCHAR(100) NOT NULL,
    loja_id INTEGER NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    endereco TEXT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'aguardando pagamento' CHECK (status IN ('aguardando pagamento', 'confirmado', 'em preparo', 'saiu para entrega', 'entregue', 'cancelado')),
    loja_id INTEGER NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    data_pedido TIMESTAMP DEFAULT NOW(),
    data_entrega TIMESTAMP,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tipo ON users(tipo);
CREATE INDEX idx_lojas_user_id ON lojas(user_id);
CREATE INDEX idx_lojas_plano_id ON lojas(plano_id);
CREATE INDEX idx_produtos_loja_id ON produtos(loja_id);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_pedidos_loja_id ON pedidos(loja_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_assinaturas_loja_id ON assinaturas(loja_id);

-- Inserir planos padrão
INSERT INTO planos (nome, preco, limite_produtos, descricao) VALUES
('Plano Básico', 29.90, 50, 'Perfeito para iniciantes - até 50 produtos'),
('Plano Profissional', 79.90, 500, 'Para lojas em crescimento - até 500 produtos'),
('Plano Premium', 199.90, 5000, 'Para grandes lojas - até 5000 produtos'),
('Plano Enterprise', 499.90, -1, 'Plano customizado - produtos ilimitados');

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO users (nome, email, senha, tipo) VALUES
('Administrador', 'admin@delivery.com', '$2b$10$8r5UPaVPOvFHLo8GIW1S..0.hDQhD7qOvM8GnJkOtKlyQbCPmC5p6', 'admin');
