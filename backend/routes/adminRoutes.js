const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/dashboard", authMiddleware, adminController.dashboard);

router.get("/relatorio/pedidos", authMiddleware, adminController.getRelatorioPedidos);

router.get("/lojas/mais-vendidas", authMiddleware, adminController.getLojasMaisVendidas);

router.get("/produtos/mais-vendidos", authMiddleware, adminController.getProdutosMaisVendidos);

router.get("/estatisticas/gerais", authMiddleware, adminController.getEstatisticasGerais);

module.exports = router;