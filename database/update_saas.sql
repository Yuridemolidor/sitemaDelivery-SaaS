-- ========================================
-- UPDATE RÁPIDO - Adicionar campos SaaS
-- ========================================
-- Use este script se já tem dados no BD
-- Ele adiciona campos novos sem apagar

-- 1. Adicionar campo status_loja à tabela lojas (se não existir)
ALTER TABLE lojas ADD COLUMN IF NOT EXISTS status_loja VARCHAR(50) DEFAULT 'ativa';
ALTER TABLE lojas ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 2. Adicionar campos à tabela assinaturas (se não existir)
ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS status_assinatura VARCHAR(50) DEFAULT 'ativa';
ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS data_expiracao TIMESTAMP;
ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS proximo_vencimento TIMESTAMP;

-- 3. Adicionar campos à tabela pedidos (se não existir)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS numero_pedido VARCHAR(50) UNIQUE;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS endereco_entrega TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS data_entrega_estimada TIMESTAMP;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS data_entrega_real TIMESTAMP;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS avaliacao_cliente INTEGER;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS comentario_avaliacao TEXT;

-- 4. Criar tabela de transações (se não existir)
CREATE TABLE IF NOT EXISTS transacoes (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    assinatura_id INTEGER REFERENCES assinaturas(id) ON DELETE CASCADE,
    tipo_transacao VARCHAR(50),
    valor DECIMAL(15, 2) NOT NULL,
    taxa_plataforma DECIMAL(15, 2),
    valor_liquido DECIMAL(15, 2),
    status_transacao VARCHAR(50) DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Criar tabela de logs (se não existir)
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

-- 6. Criar tabela itens_pedido (se não existir)
CREATE TABLE IF NOT EXISTS itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_lojas_status ON lojas(status_loja);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas(status_assinatura);
CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON pedidos(numero_pedido);
CREATE INDEX IF NOT EXISTS idx_transacoes_loja ON transacoes(loja_id);

-- PRONTO! Agora execute também o script database_saas.sql completo
-- se quiser inicializar com dados de exemplo.

COMMIT;
