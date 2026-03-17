const express = require("express");
const router = express.Router();
const produtoController = require("../controllers/produtoController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, produtoController.createProduto);

router.get("/loja/:loja_id", produtoController.getProdutos);

router.get("/:id", produtoController.getProdutoById);

router.put("/:id", authMiddleware, produtoController.updateProduto);

router.delete("/:id", authMiddleware, produtoController.deleteProduto);

router.get("/search", produtoController.searchProdutos);

module.exports = router;