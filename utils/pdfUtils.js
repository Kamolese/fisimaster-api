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
