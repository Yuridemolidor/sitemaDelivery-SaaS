-- ========================================
-- SCRIPT SQL - SAAS MULTI-TENANT DELIVERY
-- ========================================

-- Limpar dados antigos (OPCIONAL - comentar se BD já tem dados)
-- DROP TABLE IF EXISTS pedidos CASCADE;
-- DROP TABLE IF EXISTS produtos CASCADE;
-- DROP TABLE IF EXISTS assinaturas CASCADE;
-- DROP TABLE IF EXISTS lojas CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS planos CASCADE;

-- ========================================
-- 1. TABELA DE PLANOS (Pacotes para Lojas)
-- ========================================
CREATE TABLE IF NOT EXISTS planos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    preco_mensal DECIMAL(10, 2) NOT NULL,
    limite_produtos INTEGER NOT NULL DEFAULT 100,
    limite_pedidos INTEGER DEFAULT NULL, -- NULL = ilimitado
    suporte_prioritario BOOLEAN DEFAULT FALSE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 2. TABELA DE USUÁRIOS (Admin + Lojistas + Clientes)
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('admin', 'lojista', 'cliente')),
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cpf_cnpj VARCHAR(20) UNIQUE,
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- 3. TABELA DE LOJAS (Shops/Merchants)
-- ========================================
CREATE TABLE IF NOT EXISTS lojas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    nome_loja VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100), -- 'restaurante', 'mercado', 'farmacia', etc
    logo_url VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status_loja VARCHAR(50) NOT NULL DEFAULT 'ativa' CHECK (status_loja IN ('ativa', 'suspensa', 'removida')),
    total_vendas DECIMAL(15, 2) DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 5.0,
    tempo_medio_entrega INTEGER, -- em minutos
    admin_notes TEXT, -- Notas do admin master
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- 4. TABELA DE ASSINATURAS (Billing)
-- ========================================
CREATE TABLE IF NOT EXISTS assinaturas (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER NOT NULL UNIQUE REFERENCES lojas(id) ON DELETE CASCADE,
    plano_id INTEGER NOT NULL REFERENCES planos(id),
    data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_expiracao TIMESTAMP,
    status_assinatura VARCHAR(50) NOT NULL DEFAULT 'ativa' CHECK (status_assinatura IN ('ativa', 'suspensa', 'cancelada')),
    valor_pago DECIMAL(10, 2),
    metodo_pagamento VARCHAR(50), -- 'cartao', 'pix', 'boleto', etc
    tentativas_cobranca INTEGER DEFAULT 0,
    proximo_vencimento TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- 5. TABELA DE PRODUTOS
-- ========================================
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    preco DECIMAL(10, 2) NOT NULL,
    preco_promocao DECIMAL(10, 2),
    imagem_url VARCHAR(255),
    quantidade_estoque INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    peso DECIMAL(8, 2), -- em kg
    dimensoes VARCHAR(100), -- ex: "10x10x10 cm"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- 6. TABELA DE PEDIDOS
-- ========================================
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    cliente_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    numero_pedido VARCHAR(50) NOT NULL UNIQUE,
    status_pedido VARCHAR(50) NOT NULL DEFAULT 'aguardando_pagamento' CHECK (status_pedido IN (
        'aguardando_pagamento',
        'pago',
        'em_preparo',
        'saiu_para_entrega',
        'entregue',
        'cancelado'
    )),
    valor_total DECIMAL(15, 2) NOT NULL,
    valor_entrega DECIMAL(10, 2) DEFAULT 0,
    desconto DECIMAL(10, 2) DEFAULT 0,
    metodo_pagamento VARCHAR(50),
    endereco_entrega TEXT,
    observacoes TEXT,
    data_entrega_estimada TIMESTAMP,
    data_entrega_real TIMESTAMP,
    avaliacao_cliente INTEGER CHECK (avaliacao_cliente >= 1 AND avaliacao_cliente <= 5),
    comentario_avaliacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- 7. TABELA DE ITENS DO PEDIDO
-- ========================================
CREATE TABLE IF NOT EXISTS itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 8. TABELA DE TRANSAÇÕES/PAGAMENTOS
-- ========================================
CREATE TABLE IF NOT EXISTS transacoes (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    assinatura_id INTEGER REFERENCES assinaturas(id) ON DELETE CASCADE,
    tipo_transacao VARCHAR(50) CHECK (tipo_transacao IN ('venda', 'assinatura', 'reembolso')),
    valor DECIMAL(15, 2) NOT NULL,
    taxa_plataforma DECIMAL(15, 2),
    valor_liquido DECIMAL(15, 2), -- valor que a loja recebe
    status_transacao VARCHAR(50) DEFAULT 'pendente',
    gateway_pagamento VARCHAR(100),
    id_gateway_transacao VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 9. TABELA DE LOGS (Auditoria)
-- ========================================
CREATE TABLE IF NOT EXISTS logs_admin (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    acao VARCHAR(255) NOT NULL,
    tabela_afetada VARCHAR(100),
    registro_id INTEGER,
    valores_anteriores JSONB,
    valores_novos JSONB,
    ip_origem VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ÍNDICES (Performance)
-- ========================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tipo ON users(tipo);
CREATE INDEX IF NOT EXISTS idx_lojas_user_id ON lojas(user_id);
CREATE INDEX IF NOT EXISTS idx_lojas_status ON lojas(status_loja);
CREATE INDEX IF NOT EXISTS idx_assinaturas_loja_id ON assinaturas(loja_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas(status_assinatura);
CREATE INDEX IF NOT EXISTS idx_produtos_loja_id ON produtos(loja_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_loja_id ON pedidos(loja_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON pedidos(numero_pedido);
CREATE INDEX IF NOT EXISTS idx_transacoes_loja_id ON transacoes(loja_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_pedido_id ON transacoes(pedido_id);

-- ========================================
-- DADOS INICIAIS
-- ========================================

-- Planos
INSERT INTO planos (nome, preco_mensal, limite_produtos, suporte_prioritario, descricao, ativo) 
VALUES 
    ('Básico', 49.90, 50, FALSE, 'Perfeito para começar', TRUE),
    ('Profissional', 99.90, 200, TRUE, 'Para lojas em crescimento', TRUE),
    ('Premium', 199.90, 500, TRUE, 'Recursos avançados', TRUE),
    ('Enterprise', 499.90, NULL, TRUE, 'Sem limites + suporte dedicado', TRUE)
ON CONFLICT DO NOTHING;

-- Admin Master
INSERT INTO users (email, senha, tipo, nome, ativo)
VALUES (
    'admin@delivery.com',
    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', -- sha256('admin123')
    'admin',
    'Administrador Master',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Lojista Exemplo
INSERT INTO users (email, senha, tipo, nome, ativo) 
VALUES (
    'loja@delivery.com',
    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', -- sha256('admin123')
    'lojista',
    'Dono da Loja',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Loja Exemplo
INSERT INTO lojas (user_id, nome_loja, descricao, categoria, telefone, endereco, cidade, estado, cep, status_loja)
SELECT 
    (SELECT id FROM users WHERE email = 'loja@delivery.com' LIMIT 1),
    'Mercado Central',
    'Mercado com produtos diversificados',
    'mercado',
    '(11) 3456-7890',
    'Rua Comercial, 123',
    'São Paulo',
    'SP',
    '01234-567',
    'ativa'
WHERE NOT EXISTS (SELECT 1 FROM lojas WHERE nome_loja = 'Mercado Central');

-- Assinatura Exemplo
INSERT INTO assinaturas (loja_id, plano_id, status_assinatura, data_expiracao, proximo_vencimento)
SELECT 
    (SELECT id FROM lojas WHERE nome_loja = 'Mercado Central' LIMIT 1),
    (SELECT id FROM planos WHERE nome = 'Profissional' LIMIT 1),
    'ativa',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    CURRENT_TIMESTAMP + INTERVAL '30 days'
WHERE NOT EXISTS (
    SELECT 1 FROM assinaturas WHERE loja_id = (SELECT id FROM lojas WHERE nome_loja = 'Mercado Central' LIMIT 1)
);

-- Cliente Exemplo
INSERT INTO users (email, senha, tipo, nome, ativo)
VALUES (
    'cliente@delivery.com',
    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', -- sha256('admin123')
    'cliente',
    'João Cliente',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Alguns produtos exemplo
INSERT INTO produtos (loja_id, nome, descricao, categoria, preco, imagem_url, quantidade_estoque)
SELECT 
    l.id,
    'Arroz 5kg',
    'Arroz integral de qualidade',
    'alimentos',
    35.90,
    'https://via.placeholder.com/200?text=arroz',
    50
FROM lojas l WHERE l.nome_loja = 'Mercado Central'
ON CONFLICT DO NOTHING;

INSERT INTO produtos (loja_id, nome, descricao, categoria, preco, imagem_url, quantidade_estoque)
SELECT 
    l.id,
    'Leite Integral 1L',
    'Leite pasteurizado',
    'laticinio',
    4.90,
    'https://via.placeholder.com/200?text=leite',
    100
FROM lojas l WHERE l.nome_loja = 'Mercado Central'
ON CONFLICT DO NOTHING;

COMMIT;
