import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ReportMeta {
  title: string;
  subtitle?: string;
  filenameBase: string;
}

export interface ExportColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

export interface PdfTheme {
  accentRgb?: [number, number, number];
}

const DEFAULT_ACCENT: [number, number, number] = [6, 182, 212];

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(filenameBase: string, columns: ExportColumn<unknown>[], rows: unknown[]): void {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const header = columns.map((col) => escape(col.header)).join(',');
  const body = rows.map((row) =>
    columns.map((col) => escape(String(col.value(row)))).join(','),
  );
  triggerDownload(
    new Blob([`\uFEFF${[header, ...body].join('\n')}`], { type: 'text/csv;charset=utf-8' }),
    `${filenameBase}.csv`,
  );
}

export function downloadExcel<T>(
  meta: ReportMeta,
  columns: ExportColumn<T>[],
  rows: T[],
  sheetName = 'Datos',
): void {
  const sheet = XLSX.utils.aoa_to_sheet([
    columns.map((col) => col.header),
    ...rows.map((row) => columns.map((col) => col.value(row))),
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  XLSX.writeFile(workbook, `${meta.filenameBase}.xlsx`);
}

export function downloadPdf<T>(
  meta: ReportMeta,
  columns: ExportColumn<T>[],
  rows: T[],
  theme: PdfTheme = {},
): void {
  const accent = theme.accentRgb ?? DEFAULT_ACCENT;
  const doc = new jsPDF();
  let y = 18;

  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(meta.title, 14, y);
  y += 8;

  if (meta.subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(meta.subtitle, 14, y);
    y += 6;
  }

  doc.setFontSize(9);
  doc.setTextColor(120, 130, 145);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, y);

  autoTable(doc, {
    startY: y + 8,
    head: [columns.map((col) => col.header)],
    body: rows.map((row) => columns.map((col) => String(col.value(row)))),
    headStyles: { fillColor: accent, textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  doc.save(`${meta.filenameBase}.pdf`);
}
