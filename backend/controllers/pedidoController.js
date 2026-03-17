const Pedido = require("../models/Pedido");
const db = require("../database/db");

exports.createPedido = async(req,res)=>{
    try{
        const {cliente_nome, telefone, endereco, total, loja_id} = req.body;

        // Validações
        if(!cliente_nome || !telefone || !endereco || !total || !loja_id) {
            return res.status(400).json({erro: "Campos obrigatórios faltando"});
        }

        if(total <= 0) {
            return res.status(400).json({erro: "Total deve ser maior que zero"});
        }

        const pedido = await Pedido.create(req.body);
        res.status(201).json({mensagem: "Pedido criado com sucesso", pedido});
    }catch(e){
        res.status(500).json({erro: "Erro ao criar pedido: " + e.message});
    }
};

exports.getPedidos = async(req,res)=>{
    try{
        const result = await db.query(
            "SELECT * FROM pedidos ORDER BY data_pedido DESC"
        );
        res.json(result.rows);
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar pedidos: " + e.message});
    }
};

exports.getPedidoById = async(req,res)=>{
    try{
        const {id} = req.params;
        const result = await db.query(
            "SELECT * FROM pedidos WHERE id=$1",
            [id]
        );

        if(result.rows.length === 0) {
            return res.status(404).json({erro: "Pedido não encontrado"});
        }

        res.json(result.rows[0]);
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar pedido: " + e.message});
    }
};

exports.getPedidosByLoja = async(req,res)=>{
    try{
        const {loja_id} = req.params;
        const result = await db.query(
            "SELECT * FROM pedidos WHERE loja_id=$1 ORDER BY data_pedido DESC",
            [loja_id]
        );
        res.json(result.rows);
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar pedidos da loja: " + e.message});
    }
};

exports.updateStatus = async(req,res)=>{
    try{
        const {id} = req.params;
        const {status} = req.body;

        const validStatuses = ["aguardando pagamento", "pago", "em preparação", "em entrega", "entregue", "cancelado"];

        if(!status) {
            return res.status(400).json({erro: "Status é obrigatório"});
        }

        if(!validStatuses.includes(status)) {
            return res.status(400).json({erro: "Status inválido"});
        }

        // Verificar se pedido existe
        const check = await db.query("SELECT id FROM pedidos WHERE id=$1", [id]);
        if(check.rows.length === 0) {
            return res.status(404).json({erro: "Pedido não encontrado"});
        }

        await db.query(
            "UPDATE pedidos SET status=$1, updated_at=NOW() WHERE id=$2",
            [status, id]
        );

        res.json({mensagem: "Status atualizado com sucesso"});
    }catch(e){
        res.status(500).json({erro: "Erro ao atualizar status: " + e.message});
    }
};

exports.updatePedido = async(req,res)=>{
    try{
        const {id} = req.params;
        const {cliente_nome, telefone, endereco, total} = req.body;

        if(!cliente_nome || !telefone || !endereco || !total) {
            return res.status(400).json({erro: "Campos obrigatórios faltando"});
        }

        if(total <= 0) {
            return res.status(400).json({erro: "Total deve ser maior que zero"});
        }

        const result = await db.query(
            "UPDATE pedidos SET cliente_nome=$1, telefone=$2, endereco=$3, total=$4, updated_at=NOW() WHERE id=$5 RETURNING *",
            [cliente_nome, telefone, endereco, total, id]
        );

        if(result.rows.length === 0) {
            return res.status(404).json({erro: "Pedido não encontrado"});
        }

        res.json({mensagem: "Pedido atualizado com sucesso", pedido: result.rows[0]});
    }catch(e){
        res.status(500).json({erro: "Erro ao atualizar pedido: " + e.message});
    }
};

exports.deletePedido = async(req,res)=>{
    try{
        const {id} = req.params;

        const check = await db.query("SELECT id FROM pedidos WHERE id=$1", [id]);
        if(check.rows.length === 0) {
            return res.status(404).json({erro: "Pedido não encontrado"});
        }

        await db.query("DELETE FROM pedidos WHERE id=$1", [id]);
        res.json({mensagem: "Pedido removido com sucesso"});
    }catch(e){
        res.status(500).json({erro: "Erro ao remover pedido: " + e.message});
    }
};

exports.getPedidoStats = async(req,res)=>{
    try{
        const {loja_id} = req.params;

        // Total de pedidos
        const total = await db.query(
            "SELECT COUNT(*) FROM pedidos WHERE loja_id=$1",
            [loja_id]
        );

        // Pedidos por status
        const porStatus = await db.query(
            "SELECT status, COUNT(*) as total FROM pedidos WHERE loja_id=$1 GROUP BY status",
            [loja_id]
        );

        // Receita total
        const receita = await db.query(
            "SELECT SUM(total) as total FROM pedidos WHERE loja_id=$1",
            [loja_id]
        );

        res.json({
            total_pedidos: parseInt(total.rows[0].count),
            por_status: porStatus.rows,
            receita_total: parseFloat(receita.rows[0].total) || 0
        });
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar estatísticas: " + e.message});
    }
};