import express from "express";
import { registerUser, loginUser, getMe, listUsers } from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/", protect, admin, listUsers);

export default router;
