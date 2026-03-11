import Procedimento from "../models/procedimentoModel.js";
import Paciente from "../models/pacienteModel.js";

const normalizeDateUTC = (value) => {
  const d = new Date(value);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()));
};

const assertPacienteScope = async (pacienteId, user) => {
  const paciente = await Paciente.findById(pacienteId);
  if (!paciente) {
    return { ok: false, status: 404, message: "Paciente não encontrado" };
  }
  if (user.role !== "admin" && String(paciente.fisioterapeuta) !== String(user._id)) {
    return { ok: false, status: 403, message: "Acesso negado" };
  }
  return { ok: true, paciente };
};

export const listProcedimentos = async (req, res) => {
  const query = req.user.role === "admin" ? {} : { fisioterapeuta: req.user._id };
  const procedimentos = await Procedimento.find(query).sort({ dataRealizacao: -1 }).populate('paciente', 'nome');
  res.json(procedimentos);
};

export const createProcedimento = async (req, res) => {
  const { paciente, dataRealizacao, planoSaude, valorPlano, evolucao } = req.body;
  const scope = await assertPacienteScope(paciente, req.user);
  if (!scope.ok) {
    return res.status(scope.status).json({ message: scope.message });
  }
  const dataUTC = normalizeDateUTC(dataRealizacao);
  const proc = await Procedimento.create({
    paciente,
    fisioterapeuta: req.user._id,
    dataRealizacao: dataUTC,
    planoSaude,
    valorPlano,
    evolucao,
  });
  res.status(201).json(proc);
};

export const getProcedimento = async (req, res) => {
  const proc = await Procedimento.findById(req.params.id);
  if (!proc) {
    return res.status(404).json({ message: "Procedimento não encontrado" });
  }
  if (req.user.role !== "admin" && String(proc.fisioterapeuta) !== String(req.user._id)) {
    return res.status(403).json({ message: "Acesso negado" });
  }
  res.json(proc);
};

export const updateProcedimento = async (req, res) => {
  const proc = await Procedimento.findById(req.params.id);
  if (!proc) {
    return res.status(404).json({ message: "Procedimento não encontrado" });
  }
  if (req.user.role !== "admin" && String(proc.fisioterapeuta) !== String(req.user._id)) {
    return res.status(403).json({ message: "Acesso negado" });
  }
  const updates = { ...req.body };
  delete updates.valorBase;
  if (updates.dataRealizacao) {
    updates.dataRealizacao = normalizeDateUTC(updates.dataRealizacao);
  }
  const updated = await Procedimento.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json(updated);
};

export const deleteProcedimento = async (req, res) => {
  const proc = await Procedimento.findById(req.params.id);
  if (!proc) {
    return res.status(404).json({ message: "Procedimento não encontrado" });
  }
  if (req.user.role !== "admin" && String(proc.fisioterapeuta) !== String(req.user._id)) {
    return res.status(403).json({ message: "Acesso negado" });
  }
  await proc.deleteOne();
  res.json({ message: "Procedimento removido" });
};

export const listProcedimentosPorPaciente = async (req, res) => {
  const pacienteId = req.params.pacienteId;
  const scope = await assertPacienteScope(pacienteId, req.user);
  if (!scope.ok) {
    return res.status(scope.status).json({ message: scope.message });
  }
  const query = req.user.role === "admin" ? { paciente: pacienteId } : { paciente: pacienteId, fisioterapeuta: req.user._id };
  const procedimentos = await Procedimento.find(query).sort({ dataRealizacao: -1 });
  res.json(procedimentos);
};
