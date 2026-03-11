import Paciente from "../models/pacienteModel.js";

export const listPacientes = async (req, res) => {
  const base = req.user.role === "admin" ? {} : { fisioterapeuta: req.user._id };
  const q = (req.query.q || "").trim();
  const query = { ...base };
  if (q) {
    query.nome = { $regex: q, $options: "i" };
  }
  const pacientes = await Paciente.find(query).sort({ createdAt: -1 });
  res.json(pacientes);
};

export const createPaciente = async (req, res) => {
  const data = { ...req.body, fisioterapeuta: req.user._id };
  const paciente = await Paciente.create(data);
  res.status(201).json(paciente);
};

export const getPaciente = async (req, res) => {
  const paciente = await Paciente.findById(req.params.id);
  if (!paciente) {
    return res.status(404).json({ message: "Paciente não encontrado" });
  }
  if (req.user.role !== "admin" && String(paciente.fisioterapeuta) !== String(req.user._id)) {
    return res.status(403).json({ message: "Acesso negado" });
  }
  res.json(paciente);
};

export const updatePaciente = async (req, res) => {
  const paciente = await Paciente.findById(req.params.id);
  if (!paciente) {
    return res.status(404).json({ message: "Paciente não encontrado" });
  }
  if (req.user.role !== "admin" && String(paciente.fisioterapeuta) !== String(req.user._id)) {
    return res.status(403).json({ message: "Acesso negado" });
  }
  const updates = { ...req.body };
  delete updates.fisioterapeuta;
  const updated = await Paciente.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json(updated);
};

export const deletePaciente = async (req, res) => {
  const paciente = await Paciente.findById(req.params.id);
  if (!paciente) {
    return res.status(404).json({ message: "Paciente não encontrado" });
  }
  if (req.user.role !== "admin" && String(paciente.fisioterapeuta) !== String(req.user._id)) {
    return res.status(403).json({ message: "Acesso negado" });
  }
  await paciente.deleteOne();
  res.json({ message: "Paciente removido" });
};
