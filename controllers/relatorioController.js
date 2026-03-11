import Procedimento from "../models/procedimentoModel.js";
import Paciente from "../models/pacienteModel.js";
import { sendEmail, buildCompleteReportHTML, buildParticularReportHTML, buildPlanoSaudeReportHTML } from "../utils/emailUtils.js";
import { buildPDFHTML, generatePDFBuffer } from "../utils/pdfUtils.js";

const parsePeriod = (req) => {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const startStr = String(req.query.start || `${y}-${String(m + 1).padStart(2, "0")}-01`);
  const endStr = String(req.query.end || `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`);
  const [ys, ms, ds] = startStr.split("-").map((v) => parseInt(v, 10));
  const [ye, me, de] = endStr.split("-").map((v) => parseInt(v, 10));
  const validYs = Number.isFinite(ys) && ys > 0;
  const validMs = Number.isFinite(ms) && ms >= 1 && ms <= 12;
  const validDs = Number.isFinite(ds) && ds >= 1 && ds <= 31;
  const validYe = Number.isFinite(ye) && ye > 0;
  const validMe = Number.isFinite(me) && me >= 1 && me <= 12;
  const validDe = Number.isFinite(de) && de >= 1 && de <= 31;
  const start = new Date(Date.UTC(validYs ? ys : y, (validMs ? ms : m + 1) - 1, validDs ? ds : 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(validYe ? ye : y, (validMe ? me : m + 1) - 1, validDe ? de : lastDay, 23, 59, 59, 999));
  return { start, end, startStr, endStr };
};

const currency = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const aggregateData = async (user, period) => {
  const baseQuery = {
    fisioterapeuta: user.role === "admin" ? { $exists: true } : user._id,
    dataRealizacao: { $gte: period.start, $lte: period.end },
  };
  const procedimentos = await Procedimento.find(baseQuery).populate("paciente", "nome planoSaude");
  let totalParticular = 0;
  let totalPlanoSaude = 0;
  let procedimentosPlanosCountRaw = 0;
  let evolucoesPlanosCount = 0;
  const byPaciente = new Map();
  const evolucoes = new Map();
  procedimentos.forEach((p) => {
    const nome = p.paciente?.nome || "";
    const planoPaciente = p.paciente?.planoSaude || "";
    const key = String(p.paciente?._id || "");
    const item = byPaciente.get(key) || { paciente: nome, planoPaciente, primeiroPlan: null, ultimoPlan: null, countPlanos: 0, evolucoesPlanos: 0, particular: 0, planos: 0 };
    const ts = p.dataRealizacao.getTime();
    if (p.planoSaude === "PARTICULAR") {
      totalParticular += p.valorPlano;
      item.particular += p.valorPlano;
    } else {
      totalPlanoSaude += p.valorPlano;
      item.planos += p.valorPlano;
      item.countPlanos += 1;
      procedimentosPlanosCountRaw += 1;
      item.primeiroPlan = item.primeiroPlan ? Math.min(item.primeiroPlan, ts) : ts;
      item.ultimoPlan = item.ultimoPlan ? Math.max(item.ultimoPlan, ts) : ts;
    }
    if (p.evolucao) {
      const ev = evolucoes.get(key) || [];
      ev.push(p.evolucao);
      evolucoes.set(key, ev);
    }
    byPaciente.set(key, item);
  });
  const detalhes = Array.from(byPaciente.entries()).map(([key, d]) => ({
    paciente: d.paciente,
    planoSaude: d.planoPaciente,
    totalProcedimentos: d.countPlanos * 5,
    primeiroProcedimento: d.primeiroPlan ? new Date(d.primeiroPlan).toISOString().slice(0, 10) : "",
    ultimoProcedimento: d.ultimoPlan ? new Date(d.ultimoPlan).toISOString().slice(0, 10) : "",
    totalParticular: d.particular,
    totalPlanoSaudeMultiplicado: d.planos * 5,
    totalPlanoSaude: d.planos,
    evolucoes: evolucoes.get(key) || [],
    procedimentosPlanos: d.countPlanos * 5,
    evolucoesPlanos: Math.floor((d.countPlanos * 5) / 5),
  }));
  evolucoesPlanosCount = Math.floor((procedimentosPlanosCountRaw * 5) / 5);
  const pacientesAtendidos = byPaciente.size;
  const pacientesPlanosAtendidos = detalhes.filter((d) => d.procedimentosPlanos > 0).length;
  const totalPlanoSaudeMultiplicado = totalPlanoSaude * 5;
  const producaoTotal = totalParticular + totalPlanoSaudeMultiplicado;
  return {
    periodoInicio: period.startStr,
    periodoFim: period.endStr,
    pacientesAtendidos,
    pacientesPlanosAtendidos,
    totalParticular,
    totalPlanoSaude,
    totalPlanoSaudeMultiplicado,
    producaoTotal,
    detalhes,
    procedimentosPlanosCount: procedimentosPlanosCountRaw * 5,
    evolucoesPlanosCount,
    detalhesPlanos: detalhes.filter((d) => d.procedimentosPlanos > 0),
  };
};

export const getRelatorios = async (req, res) => {
  const period = parsePeriod(req);
  const data = await aggregateData(req.user, period);
  res.json(data);
};

export const sendRelatorioCompleto = async (req, res) => {
  const period = parsePeriod(req);
  const data = await aggregateData(req.user, period);
  const html = buildCompleteReportHTML(data);
  const to = req.body.to || req.user.email;
  const info = await sendEmail(to, "Relatório Completo", html);
  res.json({ message: "E-mail enviado", id: info.messageId });
};

export const sendRelatorioParticular = async (req, res) => {
  const period = parsePeriod(req);
  const data = await aggregateData(req.user, period);
  const html = buildParticularReportHTML(data);
  const to = req.body.to || req.user.email;
  const info = await sendEmail(to, "Relatório Particular", html);
  res.json({ message: "E-mail enviado", id: info.messageId });
};

export const sendRelatorioPlanoSaude = async (req, res) => {
  const period = parsePeriod(req);
  const data = await aggregateData(req.user, period);
  const html = buildPlanoSaudeReportHTML(data);
  const to = req.body.to || req.user.email;
  const info = await sendEmail(to, "Relatório Planos de Saúde", html);
  res.json({ message: "E-mail enviado", id: info.messageId });
};

export const downloadRelatorioPDF = async (req, res) => {
  const period = parsePeriod(req);
  const data = await aggregateData(req.user, period);
  const html = buildPDFHTML(data);
  const buffer = await generatePDFBuffer(html);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=relatorio.pdf");
  res.send(buffer);
};

export const getRelatorioMensal = async (req, res) => {
  const now = new Date();
  const year = parseInt(req.query.year || now.getUTCFullYear(), 10);
  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
  const match = {
    dataRealizacao: { $gte: start, $lte: end },
  };
  if (req.user.role !== "admin") {
    match.fisioterapeuta = req.user._id;
  }
  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: { m: { $month: "$dataRealizacao" }, y: { $year: "$dataRealizacao" } },
        particularSum: { $sum: { $cond: [{ $eq: ["$planoSaude", "PARTICULAR"] }, "$valorPlano", 0] } },
        planosSum: { $sum: { $cond: [{ $ne: ["$planoSaude", "PARTICULAR"] }, "$valorPlano", 0] } },
      },
    },
    { $sort: { "_id.y": 1, "_id.m": 1 } },
  ];
  const agg = await Procedimento.aggregate(pipeline);
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, particular: 0, planos: 0 }));
  agg.forEach((r) => {
    const idx = r._id.m - 1;
    months[idx] = { month: r._id.m, particular: r.particularSum, planos: r.planosSum };
  });
  const labels = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const particular = months.map((m) => m.particular);
  const planosMultiplicado = months.map((m) => m.planos * 5);
  const total = months.map((_, i) => particular[i] + planosMultiplicado[i]);
  res.json({ year, labels, particular, planosMultiplicado, total });
};
