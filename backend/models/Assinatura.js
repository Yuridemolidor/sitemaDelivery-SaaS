const db = require("../database/db");

class Assinatura{

static async create(loja_id,plano_id){

const result = await db.query(
`INSERT INTO assinaturas
(loja_id,plano_id,data_inicio,status)
VALUES($1,$2,NOW(),'ativa')
RETURNING *`,
[loja_id,plano_id]
);

return result.rows[0];

}

static async getByLoja(loja_id){

const result = await db.query(
"SELECT * FROM assinaturas WHERE loja_id=$1",
[loja_id]
);

return result.rows[0];

}

}

module.exports = Assinatura;