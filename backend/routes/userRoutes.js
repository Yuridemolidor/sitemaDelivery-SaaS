const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", userController.getAllUsers);

router.get("/:id", userController.getUserById);

router.put("/:id", authMiddleware, userController.updateUser);

router.delete("/:id", authMiddleware, userController.deleteUser);

router.post("/:id/change-password", authMiddleware, userController.changePassword);

module.exports = router;