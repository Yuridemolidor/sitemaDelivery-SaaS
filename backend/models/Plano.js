const db = require("../database/db");

class Plano {

static async getAll(){

const result = await db.query(
"SELECT * FROM planos"
);

return result.rows;

}

static async create(nome,preco,limite_produtos,descricao){

const result = await db.query(
`INSERT INTO planos(nome,preco,limite_produtos,descricao)
VALUES($1,$2,$3,$4)
RETURNING *`,
[nome,preco,limite_produtos,descricao]
);

return result.rows[0];

}

}

module.exports = Plano;