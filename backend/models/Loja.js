const db = require("../database/db");

class Loja{
    static async create(data){
        const query = `
            INSERT INTO lojas
            (nome, descricao, telefone, endereco, taxa_entrega, pix, user_id, plano_id, ativo)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, true)
            RETURNING *
        `;

        const values = [
            data.nome,
            data.descricao || null,
            data.telefone,
            data.endereco,
            data.taxa_entrega || 0,
            data.pix || null,
            data.user_id,
            data.plano_id
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async getAll(){
        const result = await db.query("SELECT * FROM lojas WHERE ativo=true ORDER BY nome");
        return result.rows;
    }

    static async getById(id){
        const result = await db.query("SELECT * FROM lojas WHERE id=$1 AND ativo=true", [id]);
        return result.rows[0];
    }

    static async getByUser(user_id){
        const result = await db.query(
            "SELECT * FROM lojas WHERE user_id=$1 AND ativo=true ORDER BY nome",
            [user_id]
        );
        return result.rows;
    }

    static async update(id, data){
        const query = `
            UPDATE lojas
            SET nome=$1, descricao=$2, telefone=$3, endereco=$4, 
                taxa_entrega=$5, pix=$6, updated_at=NOW()
            WHERE id=$7 AND ativo=true
            RETURNING *
        `;

        const values = [
            data.nome,
            data.descricao || null,
            data.telefone,
            data.endereco,
            data.taxa_entrega || 0,
            data.pix || null,
            id
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async delete(id){
        const result = await db.query(
            "UPDATE lojas SET ativo=false, updated_at=NOW() WHERE id=$1 RETURNING *",
            [id]
        );
        return result.rows[0];
    }
}

module.exports = Loja;