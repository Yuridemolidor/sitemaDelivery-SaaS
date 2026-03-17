const db = require("../database/db");

exports.dashboard = async(req,res)=>{
    try{
        const lojas = await db.query("SELECT COUNT(*) FROM lojas WHERE ativo=true");
        const pedidos = await db.query("SELECT COUNT(*) FROM pedidos");
        const users = await db.query("SELECT COUNT(*) FROM users");
        const produtos = await db.query("SELECT COUNT(*) FROM produtos WHERE ativo=true");

        // Receita total
        const receita = await db.query("SELECT SUM(total) as total FROM pedidos");

        // Usuários por tipo
        const porTipo = await db.query("SELECT tipo, COUNT(*) as total FROM users GROUP BY tipo");

        res.json({
            total_lojas: parseInt(lojas.rows[0].count),
            total_pedidos: parseInt(pedidos.rows[0].count),
            total_usuarios: parseInt(users.rows[0].count),
            total_produtos: parseInt(produtos.rows[0].count),
            receita_total: parseFloat(receita.rows[0].total) || 0,
            usuarios_por_tipo: porTipo.rows
        });
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar dashboard: " + e.message});
    }
};

exports.getRelatorioPedidos = async(req,res)=>{
    try{
        const {data_inicio, data_fim} = req.query;

        let query = "SELECT * FROM pedidos WHERE 1=1";
        let params = [];

        if(data_inicio) {
            query += " AND data_pedido >= $" + (params.length + 1);
            params.push(data_inicio);
        }

        if(data_fim) {
            query += " AND data_pedido <= $" + (params.length + 1);
            params.push(data_fim);
        }

        query += " ORDER BY data_pedido DESC";

        const result = await db.query(query, params);
        res.json(result.rows);
    }catch(e){
        res.status(500).json({erro: "Erro ao gerar relatório: " + e.message});
    }
};

exports.getLojasMaisVendidas = async(req,res)=>{
    try{
        const result = await db.query(`
            SELECT l.id, l.nome, COUNT(p.id) as total_pedidos, SUM(p.total) as receita_total
            FROM lojas l
            LEFT JOIN pedidos p ON l.id = p.loja_id
            WHERE l.ativo = true
            GROUP BY l.id, l.nome
            ORDER BY receita_total DESC
            LIMIT 10
        `);

        res.json(result.rows);
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar lojas: " + e.message});
    }
};

exports.getProdutosMaisVendidos = async(req,res)=>{
    try{
        const {limit = 10} = req.query;

        const result = await db.query(`
            SELECT p.id, p.nome, p.preco, COUNT(ip.id) as total_vendidos
            FROM produtos p
            LEFT JOIN itens_pedido ip ON p.id = ip.produto_id
            WHERE p.ativo = true
            GROUP BY p.id, p.nome, p.preco
            ORDER BY total_vendidos DESC
            LIMIT $1
        `, [limit]);

        res.json(result.rows);
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar produtos: " + e.message});
    }
};

exports.getEstatisticasGerais = async(req,res)=>{
    try{
        // Pedidos por status
        const porStatus = await db.query(`
            SELECT status, COUNT(*) as total
            FROM pedidos
            GROUP BY status
        `);

        // Receita mensal
        const receitaMensal = await db.query(`
            SELECT 
                DATE_TRUNC('month', data_pedido) as mes,
                SUM(total) as receita
            FROM pedidos
            GROUP BY DATE_TRUNC('month', data_pedido)
            ORDER BY mes DESC
            LIMIT 12
        `);

        // Clientes novos mensais
        const clientesNovos = await db.query(`
            SELECT 
                DATE_TRUNC('month', created_at) as mes,
                COUNT(*) as total
            FROM users
            WHERE tipo = 'cliente'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY mes DESC
            LIMIT 12
        `);

        res.json({
            pedidos_por_status: porStatus.rows,
            receita_mensal: receitaMensal.rows,
            clientes_novos_mensais: clientesNovos.rows
        });
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar estatísticas: " + e.message});
    }
};