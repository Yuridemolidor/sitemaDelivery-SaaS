const db = require("../database/db");

class User {

static async create(nome,email,senha,tipo){

const query = `
INSERT INTO users(nome,email,senha,tipo)
VALUES($1,$2,$3,$4)
RETURNING *
`;

const values = [nome,email,senha,tipo];

const result = await db.query(query,values);

return result.rows[0];

}

static async findByEmail(email){

const result = await db.query(
"SELECT * FROM users WHERE email = $1",
[email]
);

return result.rows[0];

}

}

module.exports = User;