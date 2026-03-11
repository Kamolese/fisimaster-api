import mongoose from "mongoose";

const procedimentoSchema = new mongoose.Schema(
  {
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: "Paciente", required: true },
    fisioterapeuta: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dataRealizacao: { type: Date, required: true },
    planoSaude: {
      type: String,
      enum: ["SUS", "PARTICULAR", "UNIMED", "AMIL", "BRADESCO", "SULAMERICA", "HAPVIDA"],
      required: true,
    },
    valorPlano: { type: Number, required: true, min: 0 },
    evolucao: { type: String, trim: true },
    valorBase: { type: Number, default: 5, immutable: true },
  },
  { timestamps: true }
);

const Procedimento = mongoose.model("Procedimento", procedimentoSchema);
export default Procedimento;
