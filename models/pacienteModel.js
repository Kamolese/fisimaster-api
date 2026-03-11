import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    number: { type: String, trim: true },
    complement: { type: String, trim: true },
    district: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zip: { type: String, trim: true },
  },
  { _id: false }
);

const pacienteSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    dataNascimento: { type: Date },
    telefone: { type: String, trim: true },
    endereco: { type: addressSchema },
    planoSaude: {
      type: String,
      enum: ["SUS", "PARTICULAR", "UNIMED", "AMIL", "BRADESCO", "SULAMERICA", "HAPVIDA"],
      default: "SUS",
    },
    fisioterapeuta: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Paciente = mongoose.model("Paciente", pacienteSchema);
export default Paciente;
