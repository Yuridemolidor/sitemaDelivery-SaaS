const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");

// Funções de hash simples (sem bcrypt)
const hashPassword = (senha) => {
    return crypto.createHash('sha256').update(senha).digest('hex');
};

const comparePassword = (senha, hash) => {
    return hashPassword(senha) === hash;
};

// Validação de email
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Validação de senha
const validatePassword = (senha) => {
    return senha.length >= 6;
};

exports.register = async(req,res)=>{
    try{
        const {nome, email, senha, tipo} = req.body;

        // Validações
        if(!nome || !email || !senha || !tipo) {
            return res.status(400).json({erro: "Todos os campos são obrigatórios"});
        }

        if(!validateEmail(email)) {
            return res.status(400).json({erro: "Email inválido"});
        }

        if(!validatePassword(senha)) {
            return res.status(400).json({erro: "Senha deve ter no mínimo 6 caracteres"});
        }

        if(!["admin", "loja", "cliente"].includes(tipo)) {
            return res.status(400).json({erro: "Tipo de usuário inválido"});
        }

        // Verificar se email já existe
        const userExists = await User.findByEmail(email);
        if(userExists) {
            return res.status(400).json({erro: "Email já cadastrado"});
        }

        const hash = hashPassword(senha);
        const user = await User.create(nome, email, hash, tipo);

        res.status(201).json({
            mensagem: "Usuário criado com sucesso",
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                tipo: user.tipo
            }
        });

    }catch(e){
        res.status(500).json({erro: "Erro ao registrar: " + e.message});
    }
};

exports.login = async(req,res)=>{
    try{
        const {email, senha} = req.body;

        if(!email || !senha) {
            return res.status(400).json({erro: "Email e senha são obrigatórios"});
        }

        const user = await User.findByEmail(email);

        if(!user) {
            return res.status(401).json({erro: "Credenciais inválidas"});
        }

        const match = comparePassword(senha, user.senha);

        if(!match) {
            return res.status(401).json({erro: "Credenciais inválidas"});
        }

        const token = jwt.sign(
            {id: user.id, tipo: user.tipo, email: user.email},
            "segredo_jwt",
            {expiresIn: "7d"}
        );

        res.json({
            mensagem: "Login realizado com sucesso",
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                tipo: user.tipo
            }
        });

    }catch(e){
        res.status(500).json({erro: "Erro ao fazer login: " + e.message});
    }
};

exports.logout = async(req,res)=>{
    res.json({mensagem: "Logout realizado com sucesso"});
};