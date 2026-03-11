import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import pacienteRoutes from "./routes/pacienteRoutes.js";
import procedimentoRoutes from "./routes/procedimentoRoutes.js";
import relatorioRoutes from "./routes/relatorioRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/pacientes", pacienteRoutes);
app.use("/api/procedimentos", procedimentoRoutes);
app.use("/api/relatorios", relatorioRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
