import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function exportToCSV(filename, data) {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Header row
  csvRows.push(headers.join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header] === null || row[header] === undefined ? '' : row[header];
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(title, headers, rows, filename) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  // Header styling
  doc.setFillColor(11, 17, 32); // Industrial dark slate
  doc.rect(0, 0, doc.internal.pageSize.width, 60, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(6, 182, 212); // Cyan
  doc.text('DTAM | DIGITAL TWIN ASSET MANAGEMENT', 30, 36);

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Light slate
  doc.text(`Generated on: ${new Date().toLocaleString()}`, doc.internal.pageSize.width - 240, 36);

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 30, 90);

  doc.autoTable({
    startY: 105,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [248, 250, 252],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249],
    },
    margin: { top: 105, left: 30, right: 30 },
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
}
