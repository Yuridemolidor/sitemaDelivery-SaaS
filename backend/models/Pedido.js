const db = require("../database/db");

class Pedido{

static async create(data){

const query = `
INSERT INTO pedidos
(cliente_nome,telefone,endereco,total,status,loja_id,data_pedido)
VALUES($1,$2,$3,$4,'aguardando pagamento',$5,NOW())
RETURNING *
`;

const values = [
data.cliente_nome,
data.telefone,
data.endereco,
data.total,
data.loja_id
];

const result = await db.query(query,values);

return result.rows[0];

}

}

module.exports = Pedido;