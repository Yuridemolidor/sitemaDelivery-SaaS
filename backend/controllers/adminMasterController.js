const pool = require("../database/db");

// ========================================
// ADMIN MASTER - Gerencia TODAS as lojas
// ========================================

// 1. Dashboard Executivo
const getDashboardExecutivo = async (req, res) => {
    try {
        // Total de lojas
        const lojaTotal = await pool.query("SELECT COUNT(*) as total FROM lojas");
        
        // Lojas ativas vs suspensas
        const lojasStatus = await pool.query(
            "SELECT status_loja, COUNT(*) as total FROM lojas GROUP BY status_loja"
        );
        
        // Receita total da plataforma
        const receita = await pool.query(
            "SELECT SUM(valor_liquido) as total FROM transacoes WHERE status_transacao = 'completo'"
        );
        
        // Números de hoje
        const estatisticasHoje = await pool.query(`
            SELECT 
                COUNT(DISTINCT p.id) as pedidos_hoje,
                SUM(p.valor_total) as valor_vendido_hoje,
                COUNT(DISTINCT p.cliente_id) as clientes_hoje
            FROM pedidos p
            WHERE DATE(p.created_at) = CURRENT_DATE
        `);
        
        // Planos mais contratados
        const planosPopulares = await pool.query(`
            SELECT p.nome, COUNT(a.id) as total_assinaturas, p.preco_mensal
            FROM assinaturas a
            JOIN planos p ON a.plano_id = p.id
            WHERE a.status_assinatura = 'ativa'
            GROUP BY p.id, p.nome, p.preco_mensal
            ORDER BY total_assinaturas DESC
        `);
        
        // Top 5 lojas por receita
        const topLojas = await pool.query(`
            SELECT l.id, l.nome_loja, l.cidade, l.status_loja,
                   COUNT(DISTINCT p.id) as total_pedidos,
                   SUM(p.valor_total) as receita_total,
                   COALESCE(AVG(p.avaliacao_cliente), 0) as avaliacao_media
            FROM lojas l
            LEFT JOIN pedidos p ON l.id = p.loja_id AND DATE(p.created_at) >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY l.id
            ORDER BY receita_total DESC NULLS LAST
            LIMIT 5
        `);
        
        res.json({
            timestamp: new Date(),
            resumo: {
                total_lojas: parseInt(lojaTotal.rows[0].total),
                lojas_ativas: lojasStatus.rows.find(x => x.status_loja === 'ativa')?.total || 0,
                lojas_suspensas: lojasStatus.rows.find(x => x.status_loja === 'suspensa')?.total || 0,
                receita_total: parseFloat(receita.rows[0].total || 0)
            },
            hoje: {
                pedidos: parseInt(estatisticasHoje.rows[0].pedidos_hoje || 0),
                valor_vendido: parseFloat(estatisticasHoje.rows[0].valor_vendido_hoje || 0),
                clientes: parseInt(estatisticasHoje.rows[0].clientes_hoje || 0)
            },
            planos_populares: planosPopulares.rows,
            top_lojas: topLojas.rows
        });
    } catch (error) {
        console.error("Erro ao buscar dashboard:", error);
        res.status(500).json({ erro: "Erro ao buscar dados do dashboard" });
    }
};

// 2. Listar todas as lojas com status de assinatura
const listarTodasLojas = async (req, res) => {
    try {
        const { status_loja, status_assinatura, search } = req.query;
        
        let query = `
            SELECT 
                l.id, l.user_id, l.nome_loja, l.categoria, l.cidade, l.estado,
                l.status_loja, l.total_vendas, l.rating, l.created_at,
                u.email, u.ativo as usuario_ativo,
                p.nome as plano_nome, p.preco_mensal,
                a.id as assinatura_id, a.status_assinatura, a.data_expiracao,
                CASE 
                    WHEN a.data_expiracao < CURRENT_TIMESTAMP THEN 'EXPIRADO'
                    WHEN a.data_expiracao < CURRENT_TIMESTAMP + INTERVAL '7 days' THEN 'EXPIRANDO_LOGO'
                    ELSE 'OK'
                END as alerta_assinatura
            FROM lojas l
            JOIN users u ON l.user_id = u.id
            LEFT JOIN assinaturas a ON l.id = a.loja_id
            LEFT JOIN planos p ON a.plano_id = p.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (status_loja) {
            query += ` AND l.status_loja = $${params.length + 1}`;
            params.push(status_loja);
        }
        
        if (status_assinatura) {
            query += ` AND a.status_assinatura = $${params.length + 1}`;
            params.push(status_assinatura);
        }
        
        if (search) {
            query += ` AND (l.nome_loja ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
            params.push(`%${search}%`);
        }
        
        query += ` ORDER BY l.created_at DESC`;
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao listar lojas:", error);
        res.status(500).json({ erro: "Erro ao listar lojas" });
    }
};

// 3. Detalhes completos de uma loja
const detalheLojaCompleto = async (req, res) => {
    try {
        const { lojaId } = req.params;
        
        // Dados da loja
        const loja = await pool.query(
            `SELECT l.*, u.email, u.nome FROM lojas l 
             JOIN users u ON l.user_id = u.id 
             WHERE l.id = $1`,
            [lojaId]
        );
        
        if (loja.rows.length === 0) {
            return res.status(404).json({ erro: "Loja não encontrada" });
        }
        
        // Assinatura e plano
        const assinatura = await pool.query(
            `SELECT a.*, p.nome as plano_nome, p.preco_mensal, p.limite_produtos
             FROM assinaturas a
             JOIN planos p ON a.plano_id = p.id
             WHERE a.loja_id = $1`,
            [lojaId]
        );
        
        // Estatísticas de vendas (últimos 30 dias)
        const stats = await pool.query(
            `SELECT 
                COUNT(DISTINCT p.id) as total_pedidos,
                SUM(p.valor_total) as valor_total_vendido,
                AVG(CASE WHEN p.avaliacao_cliente > 0 THEN p.avaliacao_cliente END) as avaliacao_media,
                COUNT(DISTINCT p.cliente_id) as clientes_unicos
             FROM pedidos p
             WHERE p.loja_id = $1 AND DATE(p.created_at) >= CURRENT_DATE - INTERVAL '30 days'`,
            [lojaId]
        );
        
        // Produtos cadastrados
        const produtos = await pool.query(
            `SELECT COUNT(*) as total, SUM(quantidade_estoque) as estoque_total FROM produtos WHERE loja_id = $1`,
            [lojaId]
        );
        
        // Últimos 5 pedidos
        const ultimos_pedidos = await pool.query(
            `SELECT p.id, p.numero_pedido, p.valor_total, p.status_pedido, p.created_at
             FROM pedidos p
             WHERE p.loja_id = $1
             ORDER BY p.created_at DESC
             LIMIT 5`,
            [lojaId]
        );
        
        res.json({
            loja: loja.rows[0],
            assinatura: assinatura.rows[0] || null,
            estatisticas: stats.rows[0],
            produtos: produtos.rows[0],
            ultimos_pedidos: ultimos_pedidos.rows
        });
        
    } catch (error) {
        console.error("Erro ao buscar detalhes:", error);
        res.status(500).json({ erro: "Erro ao buscar detalhes da loja" });
    }
};

// 4. Suspender/Ativar loja
const alterarStatusLoja = async (req, res) => {
    try {
        const { lojaId } = req.params;
        const { status_loja, motivo_admin } = req.body;
        
        if (!['ativa', 'suspensa', 'removida'].includes(status_loja)) {
            return res.status(400).json({ erro: "Status inválido" });
        }
        
        const result = await pool.query(
            `UPDATE lojas 
             SET status_loja = $1, admin_notes = admin_notes || $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING id, nome_loja, status_loja`,
            [status_loja, `\n[${new Date().toISOString()}] ${motivo_admin}`, lojaId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: "Loja não encontrada" });
        }
        
        // Log de auditoria
        await pool.query(
            `INSERT INTO logs_admin (admin_id, acao, tabela_afetada, registro_id, valores_novos)
             VALUES ($1, $2, $3, $4, $5)`,
            [req.admin_id, `Status alterado para ${status_loja}`, 'lojas', lojaId, JSON.stringify({ status_loja, motivo_admin })]
        );
        
        res.json({ mensagem: "Status da loja alterado com sucesso", loja: result.rows[0] });
    } catch (error) {
        console.error("Erro ao alterar status:", error);
        res.status(500).json({ erro: "Erro ao alterar status da loja" });
    }
};

// 5. Renovar assinatura manualmente
const renovarAssinatura = async (req, res) => {
    try {
        const { lojaId } = req.params;
        const { plano_id, dias_extensao } = req.body;
        
        const result = await pool.query(
            `UPDATE assinaturas 
             SET plano_id = COALESCE($1, plano_id),
                 data_expiracao = data_expiracao + ($2::integer || ' days')::INTERVAL,
                 status_assinatura = 'ativa',
                 updated_at = CURRENT_TIMESTAMP
             WHERE loja_id = $3
             RETURNING id, data_expiracao, status_assinatura`,
            [plano_id || null, dias_extensao || 30, lojaId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: "Assinatura não encontrada" });
        }
        
        res.json({ mensagem: "Assinatura renovada", assinatura: result.rows[0] });
    } catch (error) {
        console.error("Erro ao renovar:", error);
        res.status(500).json({ erro: "Erro ao renovar assinatura" });
    }
};

// 6. Relatório de receita da plataforma
const relatorioReceita = async (req, res) => {
    try {
        const { data_inicio, data_fim } = req.query;
        
        let query = `
            SELECT 
                DATE(t.created_at) as data,
                COUNT(t.id) as total_transacoes,
                SUM(t.valor) as valor_bruto,
                SUM(t.taxa_plataforma) as taxa_total,
                SUM(t.valor_liquido) as valor_liquido,
                COUNT(DISTINCT t.loja_id) as lojas_ativas
            FROM transacoes t
            WHERE t.status_transacao = 'completo'
        `;
        
        const params = [];
        
        if (data_inicio) {
            query += ` AND t.created_at >= $${params.length + 1}`;
            params.push(new Date(data_inicio));
        }
        
        if (data_fim) {
            query += ` AND t.created_at <= $${params.length + 1}`;
            params.push(new Date(data_fim));
        }
        
        query += ` GROUP BY DATE(t.created_at) ORDER BY data DESC`;
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar relatório:", error);
        res.status(500).json({ erro: "Erro ao buscar relatório" });
    }
};

// 7. Listar reclamações/problemas por loja
const listarProblemas = async (req, res) => {
    try {
        // Lojas com muitos pedidos cancelados
        const cancelamentos = await pool.query(`
            SELECT l.id, l.nome_loja, l.email,
                   COUNT(p.id) as pedidos_cancelados,
                   ROUND(100.0 * COUNT(p.id) / (SELECT COUNT(*) FROM pedidos WHERE loja_id = l.id), 2) as percentual
            FROM lojas l
            LEFT JOIN pedidos p ON l.id = p.loja_id AND p.status_pedido = 'cancelado'
            GROUP BY l.id, l.nome_loja, l.email
            HAVING COUNT(p.id) > 5
            ORDER BY COUNT(p.id) DESC
        `);
        
        // Assinaturas prestes a expirar
        const expirando = await pool.query(`
            SELECT l.id, l.nome_loja, u.email, a.data_expiracao,
                   EXTRACT(DAY FROM a.data_expiracao - CURRENT_TIMESTAMP) as dias_restantes
            FROM assinaturas a
            JOIN lojas l ON a.loja_id = l.id
            JOIN users u ON l.user_id = u.id
            WHERE a.status_assinatura = 'ativa'
            AND a.data_expiracao < CURRENT_TIMESTAMP + INTERVAL '7 days'
            ORDER BY a.data_expiracao ASC
        `);
        
        res.json({
            lojas_muitos_cancelamentos: cancelamentos.rows,
            assinaturas_expirando: expirando.rows
        });
    } catch (error) {
        console.error("Erro ao listar problemas:", error);
        res.status(500).json({ erro: "Erro ao listar problemas" });
    }
};

module.exports = {
    getDashboardExecutivo,
    listarTodasLojas,
    detalheLojaCompleto,
    alterarStatusLoja,
    renovarAssinatura,
    relatorioReceita,
    listarProblemas
};
