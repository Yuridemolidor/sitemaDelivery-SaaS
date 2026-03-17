const Loja = require("../models/Loja");
const db = require("../database/db");

exports.createLoja = async(req,res)=>{
    try{
        const {nome, descricao, telefone, endereco, taxa_entrega, pix, user_id, plano_id} = req.body;

        // Validações
        if(!nome || !telefone || !endereco || !user_id || !plano_id) {
            return res.status(400).json({erro: "Campos obrigatórios faltando"});
        }

        if(taxa_entrega < 0) {
            return res.status(400).json({erro: "Taxa de entrega não pode ser negativa"});
        }

        const loja = await Loja.create(req.body);
        res.status(201).json({mensagem: "Loja criada com sucesso", loja});
    }catch(e){
        res.status(500).json({erro: "Erro ao criar loja: " + e.message});
    }
};

exports.getLojas = async(req,res)=>{
    try{
        const lojas = await Loja.getAll();
        res.json(lojas);
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar lojas: " + e.message});
    }
};

exports.getLojaById = async(req,res)=>{
    try{
        const {id} = req.params;
        const loja = await Loja.getById(id);

        if(!loja) {
            return res.status(404).json({erro: "Loja não encontrada"});
        }

        res.json(loja);
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar loja: " + e.message});
    }
};

exports.getLojasByUser = async(req,res)=>{
    try{
        const {user_id} = req.params;
        const lojas = await Loja.getByUser(user_id);
        res.json(lojas);
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar lojas do usuário: " + e.message});
    }
};

exports.updateLoja = async(req,res)=>{
    try{
        const {id} = req.params;
        const {nome, descricao, telefone, endereco, taxa_entrega, pix} = req.body;

        if(!nome || !telefone || !endereco) {
            return res.status(400).json({erro: "Campos obrigatórios faltando"});
        }

        const loja = await Loja.update(id, req.body);

        if(!loja) {
            return res.status(404).json({erro: "Loja não encontrada"});
        }

        res.json({mensagem: "Loja atualizada com sucesso", loja});
    }catch(e){
        res.status(500).json({erro: "Erro ao atualizar loja: " + e.message});
    }
};

exports.deleteLoja = async(req,res)=>{
    try{
        const {id} = req.params;
        const result = await Loja.delete(id);

        if(!result) {
            return res.status(404).json({erro: "Loja não encontrada"});
        }

        res.json({mensagem: "Loja removida com sucesso"});
    }catch(e){
        res.status(500).json({erro: "Erro ao remover loja: " + e.message});
    }
};

exports.getLojaStats = async(req,res)=>{
    try{
        const {id} = req.params;

        // Verificar se loja existe
        const loja = await Loja.getById(id);
        if(!loja) {
            return res.status(404).json({erro: "Loja não encontrada"});
        }

        // Total de produtos
        const produtos = await db.query(
            "SELECT COUNT(*) FROM produtos WHERE loja_id=$1 AND ativo=true",
            [id]
        );

        // Total de pedidos
        const pedidos = await db.query(
            "SELECT COUNT(*) FROM pedidos WHERE loja_id=$1",
            [id]
        );

        // Total de vendas
        const vendas = await db.query(
            "SELECT SUM(total) FROM pedidos WHERE loja_id=$1",
            [id]
        );

        res.json({
            total_produtos: parseInt(produtos.rows[0].count),
            total_pedidos: parseInt(pedidos.rows[0].count),
            total_vendas: parseFloat(vendas.rows[0].sum) || 0
        });
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar estatísticas: " + e.message});
    }
};