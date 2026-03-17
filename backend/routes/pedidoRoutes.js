const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, pedidoController.createPedido);

router.get("/", pedidoController.getPedidos);

router.get("/:id", pedidoController.getPedidoById);

router.get("/loja/:loja_id", pedidoController.getPedidosByLoja);

router.get("/loja/:loja_id/stats", pedidoController.getPedidoStats);

router.put("/:id", authMiddleware, pedidoController.updatePedido);

router.put("/:id/status", authMiddleware, pedidoController.updateStatus);

router.delete("/:id", authMiddleware, pedidoController.deletePedido);

module.exports = router;