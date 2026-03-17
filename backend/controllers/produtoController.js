const Produto = require("../models/Produto");
const db = require("../database/db");

exports.createProduto = async(req,res)=>{
    try{
        const {nome, descricao, preco, imagem, categoria, loja_id} = req.body;

        // Validações
        if(!nome || !preco || !categoria || !loja_id) {
            return res.status(400).json({erro: "Campos obrigatórios faltando"});
        }

        if(preco <= 0) {
            return res.status(400).json({erro: "Preço deve ser maior que zero"});
        }

        const produto = await Produto.create(req.body);
        res.status(201).json({mensagem: "Produto criado com sucesso", produto});
    }catch(e){
        res.status(500).json({erro: "Erro ao criar produto: " + e.message});
    }
};

exports.getProdutos = async(req,res)=>{
    try{
        const {loja_id} = req.params;
        const produtos = await Produto.getByLoja(loja_id);
        res.json(produtos);
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar produtos: " + e.message});
    }
};

exports.getProdutoById = async(req,res)=>{
    try{
        const {id} = req.params;
        const produto = await Produto.getById(id);

        if(!produto) {
            return res.status(404).json({erro: "Produto não encontrado"});
        }

        res.json(produto);
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar produto: " + e.message});
    }
};

exports.updateProduto = async(req,res)=>{
    try{
        const {id} = req.params;
        const {nome, descricao, preco, imagem, categoria} = req.body;

        if(!nome || !preco || !categoria) {
            return res.status(400).json({erro: "Campos obrigatórios faltando"});
        }

        if(preco <= 0) {
            return res.status(400).json({erro: "Preço deve ser maior que zero"});
        }

        const produto = await Produto.update(id, req.body);

        if(!produto) {
            return res.status(404).json({erro: "Produto não encontrado"});
        }

        res.json({mensagem: "Produto atualizado com sucesso", produto});
    }catch(e){
        res.status(500).json({erro: "Erro ao atualizar produto: " + e.message});
    }
};

exports.deleteProduto = async(req,res)=>{
    try{
        const {id} = req.params;
        const result = await Produto.delete(id);

        if(!result) {
            return res.status(404).json({erro: "Produto não encontrado"});
        }

        res.json({mensagem: "Produto removido com sucesso"});
    }catch(e){
        res.status(500).json({erro: "Erro ao remover produto: " + e.message});
    }
};

exports.searchProdutos = async(req,res)=>{
    try{
        const {q, categoria, loja_id} = req.query;

        if(!q && !categoria && !loja_id) {
            return res.status(400).json({erro: "Defina um critério de busca"});
        }

        let query = "SELECT * FROM produtos WHERE ativo=true";
        let params = [];

        if(q) {
            query += " AND (nome ILIKE $" + (params.length + 1) + " OR descricao ILIKE $" + (params.length + 2) + ")";
            params.push("%" + q + "%", "%" + q + "%");
        }

        if(categoria) {
            query += " AND categoria=$" + (params.length + 1);
            params.push(categoria);
        }

        if(loja_id) {
            query += " AND loja_id=$" + (params.length + 1);
            params.push(loja_id);
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar produtos: " + e.message});
    }
};