import { jsPDF } from "jspdf";
import "jspdf-autotable";

const currency = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const formatDMY = (ymd) => {
  if (!ymd) return "";
  const m = String(ymd).match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(ymd);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export const buildPDFHTML = (data) => {
  const rows = data.detalhes
    .map(
      (d) =>
        `<tr><td>${d.paciente}</td><td>${d.totalProcedimentos}</td><td>${formatDMY(d.primeiroProcedimento)}</td><td>${formatDMY(d.ultimoProcedimento)}</td><td>${currency(d.totalParticular)}</td><td>${currency(d.totalPlanoSaude)}</td></tr>`
    )
    .join("");
  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
        h2 { margin: 0 0 12px 0; }
      </style>
    </head>
    <body>
      <h2>Relatório Completo (PDF)</h2>
      <p>Período: ${formatDMY(data.periodoInicio)} a ${formatDMY(data.periodoFim)}</p>
      <p>Pacientes atendidos: ${data.pacientesAtendidos}</p>
      <p>Produção Particular: ${currency(data.totalParticular)}</p>
      <p>Produção Planos (soma direta): ${currency(data.totalPlanoSaude)}</p>
      <p>Produção Total: ${currency(data.totalParticular + data.totalPlanoSaude)}</p>
      <table>
        <thead><tr><th>Paciente</th><th>Procedimentos</th><th>Primeiro</th><th>Último</th><th>Particular</th><th>Planos</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
  </html>`;
};

export const generatePDFBuffer = async (data) => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = margin;

  doc.setFontSize(16);
  doc.text("Relatório Completo (PDF)", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 12;

  doc.setFontSize(10);
  doc.text(`Período: ${formatDMY(data.periodoInicio)} a ${formatDMY(data.periodoFim)}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Pacientes atendidos: ${data.pacientesAtendidos}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Produção Particular: ${currency(data.totalParticular)}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Produção Planos: ${currency(data.totalPlanoSaude)}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Produção Total: ${currency(data.totalParticular + data.totalPlanoSaude)}`, margin, yPosition);
  yPosition += 10;

  const tableData = data.detalhes.map((d) => [
    d.paciente,
    String(d.totalProcedimentos),
    formatDMY(d.primeiroProcedimento),
    formatDMY(d.ultimoProcedimento),
    currency(d.totalParticular),
    currency(d.totalPlanoSaude),
  ]);

  if (tableData.length > 0) {
    doc.autoTable({
      head: [["Paciente", "Procedimentos", "Primeiro", "Último", "Particular", "Planos"]],
      body: tableData,
      startY: yPosition,
      margin: margin,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
        halign: "left",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
  }

  return Buffer.from(doc.output("arraybuffer"));
};

export const generatePDFPlanoSaudeBuffer = async (data) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = margin;

  doc.setFontSize(14);
  doc.text("Relatório de Produção Planos de Saúde - FisiMaster", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;

  doc.setFontSize(10);
  doc.text(`Período: ${formatDMY(data.periodoInicio)} até ${formatDMY(data.periodoFim)}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 12;

  doc.setFontSize(11);
  doc.text("Resumo", margin, yPosition);
  yPosition += 8;

  const summaryData = [
    ["Procedimentos Planos de Saúde:", String(data.procedimentosPlanosCount || 0)],
    ["Produção Planos de Saúde:", currency(data.totalPlanoSaudeMultiplicado || 0)],
    ["Evoluções Planos de Saúde:", String(data.evolucoesPlanosCount || 0)],
    ["Pacientes Atendidos:", String(data.pacientesPlanosAtendidos || 0)],
  ];

  doc.autoTable({
    head: [["Descrição", "Valor"]],
    body: summaryData,
    startY: yPosition,
    margin: margin,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "right" },
    },
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.text("Procedimentos Planos de Saúde Detalhados", margin, yPosition);
  yPosition += 8;

  const tableData = (data.detalhesPlanos || []).map((d) => [
    d.paciente || "",
    d.planoSaude || "",
    formatDMY(d.primeiroProcedimento) || "",
    formatDMY(d.ultimoProcedimento) || "",
    String(d.procedimentosPlanos || 0),
    String(d.evolucoesPlanos || 0),
  ]);

  if (tableData.length > 0) {
    doc.autoTable({
      head: [["Paciente", "Plano de Saúde", "Primeiro", "Último", "Procedimentos", "Evoluções"]],
      body: tableData,
      startY: yPosition,
      margin: margin,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
  }

  return Buffer.from(doc.output("arraybuffer"));
};
