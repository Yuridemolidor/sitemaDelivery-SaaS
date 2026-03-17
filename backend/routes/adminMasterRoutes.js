const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMasterController = require("../controllers/adminMasterController");

const router = express.Router();

// Middleware para verificar se é admin
const isAdminMaster = (req, res, next) => {
    if (req.body.tipo !== 'admin') {
        return res.status(403).json({ erro: "Acesso restrito ao admin master" });
    }
    next();
};

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// ========================================
// ROTAS DO ADMIN MASTER
// ========================================

// 1. Dashboard executivo
router.get("/dashboard", adminMasterController.getDashboardExecutivo);

// 2. Listar todas as lojas
router.get("/lojas", adminMasterController.listarTodasLojas);

// 3. Detalhes completos de uma loja
router.get("/lojas/:lojaId", adminMasterController.detalheLojaCompleto);

// 4. Alterar status da loja
router.put("/lojas/:lojaId/status", adminMasterController.alterarStatusLoja);

// 5. Renovar assinatura
router.post("/lojas/:lojaId/renovar-assinatura", adminMasterController.renovarAssinatura);

// 6. Relatório de receita
router.get("/receita/relatorio", adminMasterController.relatorioReceita);

// 7. Listar problemas/reclamações
router.get("/problemas", adminMasterController.listarProblemas);

module.exports = router;
