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

export const generatePDFBuffer = async (html) => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  let yPosition = margin;

  doc.setFontSize(16);
  doc.text("Relatório Completo (PDF)", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  doc.setFontSize(10);
  const lines = html.match(/<p>(.*?)<\/p>/g) || [];
  lines.forEach((line) => {
    const text = line.replace(/<\/?p>/g, "");
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(text, margin, yPosition);
    yPosition += 8;
  });

  yPosition += 5;
  const tableMatch = html.match(/<tbody>(.*?)<\/tbody>/s);
  if (tableMatch) {
    const tableData = [];
    const headerMatch = html.match(/<thead>(.*?)<\/thead>/);
    if (headerMatch) {
      const headers = headerMatch[1].match(/<th>(.*?)<\/th>/g);
      tableData.push(headers.map((h) => h.replace(/<\/?th>/g, "")));
    }

    const rowMatches = tableMatch[1].match(/<tr>(.*?)<\/tr>/g) || [];
    rowMatches.forEach((row) => {
      const cells = row.match(/<td>(.*?)<\/td>/g);
      if (cells) {
        tableData.push(cells.map((cell) => cell.replace(/<\/?td>/g, "")));
      }
    });

    if (tableData.length > 0) {
      doc.autoTable({
        head: [tableData[0]],
        body: tableData.slice(1),
        startY: yPosition,
        margin: margin,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });
    }
  }

  return doc.output("arraybuffer");
};
