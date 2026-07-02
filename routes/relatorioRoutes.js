import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getRelatorios, sendRelatorioCompleto, sendRelatorioParticular, sendRelatorioPlanoSaude, downloadRelatorioPDF, downloadRelatorioPDFPlanoSaude, getRelatorioMensal } from "../controllers/relatorioController.js";

const router = express.Router();

router.get("/", protect, getRelatorios);
router.get("/mensal", protect, getRelatorioMensal);
router.post("/email", protect, sendRelatorioCompleto);
router.post("/email/particular", protect, sendRelatorioParticular);
router.post("/email/plano-saude", protect, sendRelatorioPlanoSaude);
router.get("/download", protect, downloadRelatorioPDF);
router.get("/download/plano-saude", protect, downloadRelatorioPDFPlanoSaude);

export default router;
