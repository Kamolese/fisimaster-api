import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { listProcedimentos, createProcedimento, getProcedimento, updateProcedimento, deleteProcedimento, listProcedimentosPorPaciente } from "../controllers/procedimentoController.js";

const router = express.Router();

router.get("/", protect, listProcedimentos);
router.post("/", protect, createProcedimento);
router.get("/paciente/:pacienteId", protect, listProcedimentosPorPaciente);
router.get("/:id", protect, getProcedimento);
router.put("/:id", protect, updateProcedimento);
router.delete("/:id", protect, deleteProcedimento);

export default router;
