const db = require("../database/db");

class Produto{
    static async create(data){
        const query = `
            INSERT INTO produtos
            (nome, descricao, preco, imagem, categoria, loja_id, ativo)
            VALUES($1, $2, $3, $4, $5, $6, true)
            RETURNING *
        `;

        const values = [
            data.nome,
            data.descricao || null,
            data.preco,
            data.imagem || null,
            data.categoria,
            data.loja_id
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async getByLoja(loja_id){
        const result = await db.query(
            "SELECT * FROM produtos WHERE loja_id=$1 AND ativo=true ORDER BY nome",
            [loja_id]
        );
        return result.rows;
    }

    static async getById(id){
        const result = await db.query(
            "SELECT * FROM produtos WHERE id=$1 AND ativo=true",
            [id]
        );
        return result.rows[0];
    }

    static async update(id, data){
        const query = `
            UPDATE produtos
            SET nome=$1, descricao=$2, preco=$3, imagem=$4, 
                categoria=$5, updated_at=NOW()
            WHERE id=$6 AND ativo=true
            RETURNING *
        `;

        const values = [
            data.nome,
            data.descricao || null,
            data.preco,
            data.imagem || null,
            data.categoria,
            id
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async delete(id){
        const result = await db.query(
            "UPDATE produtos SET ativo=false, updated_at=NOW() WHERE id=$1 RETURNING *",
            [id]
        );
        return result.rows[0];
    }
}

module.exports = Produto;