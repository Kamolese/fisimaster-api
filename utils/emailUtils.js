import nodemailer from "nodemailer";

const createTransport = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    pool: true,
    maxConnections: 2,
    maxMessages: 100,
    socketTimeout: 60000,
  });
  return transporter;
};

export const sendEmail = async (to, subject, html) => {
  const transporter = createTransport();
  await transporter.verify();
  const info = await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
  return info;
};

const currency = (v) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
};

export const buildCompleteReportHTML = (data) => {
  const formatDate = (ymd) => {
    if (!ymd) return "";
    const parts = String(ymd).split("-");
    if (parts.length !== 3) return ymd;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  };
  const rows = data.detalhes
    .map(
      (d) =>
        `<tr><td>${d.paciente}</td><td>${d.totalProcedimentos}</td><td>${formatDate(d.primeiroProcedimento)}</td><td>${formatDate(d.ultimoProcedimento)}</td><td>${currency(d.totalParticular)}</td><td>${currency(d.totalPlanoSaudeMultiplicado)}</td></tr>`
    )
    .join("");
  const html = `
  <div style="font-family: Arial;">
    <h2>Relatório Completo</h2>
    <p>Período: ${formatDate(data.periodoInicio)} a ${formatDate(data.periodoFim)}</p>
    <p>Pacientes atendidos: ${data.pacientesAtendidos}</p>
    <p>Produção Particular: ${currency(data.totalParticular)}</p>
    <p>Produção Planos de Saúde: ${currency(data.totalPlanoSaudeMultiplicado)}</p>
    <p>Produção Total: ${currency(data.producaoTotal)}</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead><tr><th>Paciente</th><th>Procedimentos</th><th>Primeiro</th><th>Último</th><th>Particular</th><th>Planos de Saúde</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
  return html;
};

export const buildParticularReportHTML = (data) => {
  const html = `
  <div style="font-family: Arial;">
    <h2>Relatório Particular</h2>
    <p>Período: ${data.periodoInicio} a ${data.periodoFim}</p>
    <p>Total Particular: ${currency(data.totalParticular)}</p>
  </div>`;
  return html;
};

export const buildPlanoSaudeReportHTML = (data) => {
  const formatDate = (ymd) => {
    if (!ymd) return "";
    const parts = String(ymd).split("-");
    if (parts.length !== 3) return ymd;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  };
  const rows = (data.detalhesPlanos || [])
    .map(
      (d) =>
        `<tr>
          <td>${d.paciente}</td>
          <td>${d.planoSaude || ""}</td>
          <td>${formatDate(d.primeiroProcedimento)}</td>
          <td>${formatDate(d.ultimoProcedimento)}</td>
          <td style="text-align:right;">${d.procedimentosPlanos || 0}</td>
          <td style="text-align:right;">${d.evolucoesPlanos || 0}</td>
        </tr>`
    )
    .join("");
  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, Helvetica, sans-serif; color:#0f172a; }
        .title { text-align:center; color:#1d4ed8; margin-top:12px; }
        .period { text-align:center; color:#334155; margin-bottom:16px; }
        .card { border:1px solid #e5e7eb; border-radius:10px; padding:12px; margin:0 auto 16px; max-width:900px; }
        .card h3 { color:#1d4ed8; margin:0 0 10px; }
        .summary { width:100%; border-collapse:collapse; }
        .summary td { border-top:1px solid #e5e7eb; padding:10px; }
        .summary td:first-child { color:#475569; }
        .summary td:last-child { text-align:right; font-weight:600; }
        table { width:100%; border-collapse:collapse; }
        th, td { border-bottom:1px solid #e5e7eb; padding:10px; text-align:left; }
        th { background:#f8fafc; color:#1d4ed8; }
      </style>
    </head>
    <body>
      <h2 class="title">Relatório de Produção Planos de Saúde - FisiMaster</h2>
      <div class="period">Período: ${formatDate(data.periodoInicio)} até ${formatDate(data.periodoFim)}</div>
      <div class="card">
        <h3>Resumo</h3>
        <table class="summary">
          <tr><td>Procedimentos Planos de Saúde:</td><td>${data.procedimentosPlanosCount || 0}</td></tr>
          <tr><td>Produção Planos de Saúde:</td><td>${currency(data.totalPlanoSaudeMultiplicado || 0)}</td></tr>
          <tr><td>Evoluções Planos de Saúde:</td><td>${data.evolucoesPlanosCount || 0}</td></tr>
          <tr><td>Pacientes Atendidos:</td><td>${data.pacientesPlanosAtendidos || 0}</td></tr>
        </table>
      </div>
      <div class="card">
        <h3>Procedimentos Planos de Saúde Detalhados</h3>
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Plano de Saúde</th>
              <th>Primeiro Procedimento</th>
              <th>Último Procedimento</th>
              <th>Procedimentos</th>
              <th>Evoluções</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </body>
  </html>`;
  return html;
};
