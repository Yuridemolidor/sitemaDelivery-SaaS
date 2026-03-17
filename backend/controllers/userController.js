const db = require("../database/db");
const crypto = require("crypto");

const hashPassword = (senha) => {
    return crypto.createHash('sha256').update(senha).digest('hex');
};

const comparePassword = (senha, hash) => {
    return hashPassword(senha) === hash;
};

exports.getAllUsers = async(req,res)=>{
    try{
        const result = await db.query("SELECT id, nome, email, tipo, created_at FROM users ORDER BY created_at DESC");
        res.json(result.rows);
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar usuários: " + e.message});
    }
};

exports.getUserById = async(req,res)=>{
    try{
        const {id} = req.params;
        const result = await db.query("SELECT id, nome, email, tipo, created_at FROM users WHERE id=$1", [id]);
        
        if(result.rows.length === 0) {
            return res.status(404).json({erro: "Usuário não encontrado"});
        }
        
        res.json(result.rows[0]);
    }catch(e){
        res.status(500).json({erro: "Erro ao buscar usuário: " + e.message});
    }
};

exports.updateUser = async(req,res)=>{
    try{
        const {id} = req.params;
        const {nome, email} = req.body;

        if(!nome || !email) {
            return res.status(400).json({erro: "Nome e email são obrigatórios"});
        }

        const result = await db.query(
            "UPDATE users SET nome=$1, email=$2 WHERE id=$3 RETURNING id, nome, email, tipo",
            [nome, email, id]
        );

        if(result.rows.length === 0) {
            return res.status(404).json({erro: "Usuário não encontrado"});
        }

        res.json({mensagem: "Usuário atualizado com sucesso", user: result.rows[0]});
    }catch(e){
        res.status(500).json({erro: "Erro ao atualizar usuário: " + e.message});
    }
};

exports.deleteUser = async(req,res)=>{
    try{
        const {id} = req.params;

        // Verificar se existe
        const check = await db.query("SELECT id FROM users WHERE id=$1", [id]);
        if(check.rows.length === 0) {
            return res.status(404).json({erro: "Usuário não encontrado"});
        }

        await db.query("DELETE FROM users WHERE id=$1", [id]);
        res.json({mensagem: "Usuário removido com sucesso"});
    }catch(e){
        res.status(500).json({erro: "Erro ao remover usuário: " + e.message});
    }
};

exports.changePassword = async(req,res)=>{
    try{
        const {id} = req.params;
        const {senhaAtual, senhaNova} = req.body;

        if(!senhaAtual || !senhaNova) {
            return res.status(400).json({erro: "Senha atual e nova são obrigatórias"});
        }

        if(senhaNova.length < 6) {
            return res.status(400).json({erro: "Nova senha deve ter no mínimo 6 caracteres"});
        }

        const user = await db.query("SELECT senha FROM users WHERE id=$1", [id]);
        if(user.rows.length === 0) {
            return res.status(404).json({erro: "Usuário não encontrado"});
        }

        const match = comparePassword(senhaAtual, user.rows[0].senha);
        if(!match) {
            return res.status(401).json({erro: "Senha atual incorreta"});
        }

        const hash = hashPassword(senhaNova);
        await db.query("UPDATE users SET senha=$1 WHERE id=$2", [hash, id]);

        res.json({mensagem: "Senha alterada com sucesso"});
    }catch(e){
        res.status(500).json({erro: "Erro ao alterar senha: " + e.message});
    }
};