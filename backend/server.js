const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const lojaRoutes = require("./routes/lojaRoutes");
const produtoRoutes = require("./routes/produtoRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminMasterRoutes = require("./routes/adminMasterRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lojas", lojaRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin-master", adminMasterRoutes);

// Rota raiz
app.get("/", (req, res) => {
    res.json({
        mensagem: "Bem-vindo à API Sitema Delivery SaaS",
        versao: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            users: "/api/users",
            lojas: "/api/lojas",
            produtos: "/api/produtos",
            pedidos: "/api/pedidos",
            admin: "/api/admin"
        }
    });
});

// Middleware de erro 404
app.use((req, res) => {
    res.status(404).json({
        erro: "Rota não encontrada",
        path: req.path
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        erro: "Erro interno do servidor",
        mensagem: err.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});