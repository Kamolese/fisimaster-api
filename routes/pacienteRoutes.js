import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { listPacientes, createPaciente, getPaciente, updatePaciente, deletePaciente } from "../controllers/pacienteController.js";

const router = express.Router();

router.get("/", protect, listPacientes);
router.post("/", protect, createPaciente);
router.get("/:id", protect, getPaciente);
router.put("/:id", protect, updatePaciente);
router.delete("/:id", protect, deletePaciente);

export default router;
