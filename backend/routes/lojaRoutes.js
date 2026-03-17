const express = require("express");
const router = express.Router();
const lojaController = require("../controllers/lojaController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, lojaController.createLoja);

router.get("/", lojaController.getLojas);

router.get("/:id", lojaController.getLojaById);

router.get("/:id/stats", lojaController.getLojaStats);

router.get("/user/:user_id", lojaController.getLojasByUser);

router.put("/:id", authMiddleware, lojaController.updateLoja);

router.delete("/:id", authMiddleware, lojaController.deleteLoja);

module.exports = router;