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

// ========================================
// MIDDLEWARES DE SEGURANÇA
// ========================================

// 1. Headers de segurança - Protege contra cópia
app.use((req, res, next) => {
    // Impedir cache agressivo
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    // Copyright e DMCA
    res.set('X-Copyright', '© 2026 - Todos os direitos reservados');
    res.set('X-License', 'Proprietary - Reprodução proibida');
    
    // Impedir frame em outros sites (clickjacking)
    res.set('X-Frame-Options', 'DENY');
    res.set('X-Content-Frame-Options', 'DENY');
    
    // Impedir sniffing
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-XSS-Protection', '1; mode=block');
    
    // Content Security Policy (bloqueia injections)
    res.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' https://cdn.jsdelivr.net");
    
    // Impedir indexação
    res.set('X-Robots-Tag', 'noindex, nofollow');
    
    // Versão do servidor (dificultar identificação)
    res.removeHeader('X-Powered-By');
    
    next();
});

// 2. Rate Limiting - Protege contra scraping e força bruta
const makeRateLimiter = (windowMs, max) => {
    const requests = new Map();
    return (req, res, next) => {
        const key = req.ip;
        const now = Date.now();
        const window = windowMs;
        
        if (!requests.has(key)) {
            requests.set(key, []);
        }
        
        const times = requests.get(key).filter(t => now - t < window);
        times.push(now);
        requests.set(key, times);
        
        if (times.length > max) {
            res.set('Retry-After', Math.ceil(window / 1000));
            return res.status(429).json({ 
                erro: 'Muitas requisições. Tente novamente mais tarde.',
                retryAfter: Math.ceil(window / 1000)
            });
        }
        
        next();
    };
};

// Rate limiters por rota
const apiLimiter = makeRateLimiter(15 * 60 * 1000, 100);    // 100 req por 15 min
const authLimiter = makeRateLimiter(15 * 60 * 1000, 10);    // 10 req por 15 min (login/register)
const strictLimiter = makeRateLimiter(60 * 1000, 5);        // 5 req por minuto (admin)

// Middlewares de CORS e JSON
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Rotas
app.use("/api/auth", authLimiter, authRoutes);           // Rate limitado (força bruta)
app.use("/api/users", apiLimiter, userRoutes);
app.use("/api/lojas", apiLimiter, lojaRoutes);
app.use("/api/produtos", apiLimiter, produtoRoutes);
app.use("/api/pedidos", apiLimiter, pedidoRoutes);
app.use("/api/admin", strictLimiter, adminRoutes);         // Muito limitado (admin)
app.use("/api/admin-master", strictLimiter, adminMasterRoutes); // Muito limitado (admin master)

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