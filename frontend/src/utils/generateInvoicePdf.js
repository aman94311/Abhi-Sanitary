import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const NAVY = [28, 48, 130];
const PURPLE = [98, 76, 158];
const GREY = [90, 90, 90];
const INK = [20, 20, 20];
const LINE = [60, 60, 60];
const HEAD_BG = [232, 232, 244];
const M = 10;

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
  'Eighteen', 'Nineteen',
];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const twoDigits = (n) =>
  n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? ` ${ones[n % 10]}` : '');

const threeDigits = (n) => {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return (h ? `${ones[h]} Hundred${r ? ' ' : ''}` : '') + (r ? twoDigits(r) : '');
};

export const amountInWords = (amount) => {
  const rounded = Math.round((Number(amount) || 0) * 100) / 100;
  let rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  const crore = Math.floor(rupees / 10000000);
  rupees %= 10000000;
  const lakh = Math.floor(rupees / 100000);
  rupees %= 100000;
  const thousand = Math.floor(rupees / 1000);
  rupees %= 1000;

  const parts = [];
  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (rupees) parts.push(threeDigits(rupees));

  let words = `${parts.length ? parts.join(' ') : 'Zero'} Rupees`;
  if (paise) words += ` and ${twoDigits(paise)} Paise`;
  return `${words} Only`;
};

const round2 = (n) => Math.round(n * 100) / 100;

export const formatINR = (n) =>
  Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const calcTotals = (items, cgstRate, sgstRate) => {
  const subtotal = round2(
    items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0)
  );
  const cgst = round2((subtotal * (Number(cgstRate) || 0)) / 100);
  const sgst = round2((subtotal * (Number(sgstRate) || 0)) / 100);
  return { subtotal, cgst, sgst, grand: round2(subtotal + cgst + sgst) };
};

const formatDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}-${m}-${y}` : iso;
};

export const buildInvoicePdf = ({ shop, invoice }) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const drawBorder = () => {
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.rect(M, M, pageW - 2 * M, pageH - 2 * M);
  };

  const rule = (y) => {
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(M, y, pageW - M, y);
  };

  const field = (label, value, x, y, maxW, labelW = 24) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(value || '-'), maxW - labelW);
    doc.text(lines, x + labelW, y);
    return y + Math.max(1, lines.length) * 4.4 + 1.2;
  };

  const { client, items, cgstRate, sgstRate } = invoice;
  const delivery = invoice.delivery || client;
  const totals = calcTotals(items, cgstRate, sgstRate);
  const isTaxInvoice = Number(cgstRate) > 0 || Number(sgstRate) > 0;

  // ---------- Badge ----------
  const badgeW = 38;
  doc.setFillColor(...PURPLE);
  doc.roundedRect(pageW - M - badgeW - 4, M + 4, badgeW, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(isTaxInvoice ? 'Tax Invoice' : 'Invoice', pageW - M - 4 - badgeW / 2, M + 9.3, {
    align: 'center',
  });

  // ---------- Shop header ----------
  let y = M + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...NAVY);
  doc.text((shop.name || '').toUpperCase(), pageW / 2, y, { align: 'center' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);

  const headerLines = [];
  const ids = [shop.gstin && `GSTIN: ${shop.gstin}`, shop.pan && `PAN: ${shop.pan}`]
    .filter(Boolean)
    .join('   |   ');
  if (ids) headerLines.push(ids);
  if (shop.address) headerLines.push(...doc.splitTextToSize(shop.address, pageW - 2 * M - 30));
  const contact = [shop.phone && `Tel: ${shop.phone}`, shop.email && `Email: ${shop.email}`]
    .filter(Boolean)
    .join('   |   ');
  if (contact) headerLines.push(contact);

  headerLines.forEach((line) => {
    doc.text(line, pageW / 2, y, { align: 'center' });
    y += 4.2;
  });

  y += 1;
  rule(y);
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(`State Name: ${shop.stateName || ''}, State Code: ${shop.stateCode || ''}`, M + 3, y);
  doc.text(
    `Place of Supply: ${shop.placeOfSupply || shop.stateName || ''}`,
    pageW - M - 3,
    y,
    { align: 'right' }
  );
  y += 3;
  rule(y);
  y += 6;

  // ---------- Client + invoice info ----------
  const rx = pageW - M - 62;
  let yl = field('Client Name:', client.name, M + 3, y, 110);
  yl = field('Address:', client.address, M + 3, yl, 110);
  if (client.phone) yl = field('Phone:', client.phone, M + 3, yl, 110);
  yl = field('GSTIN:', client.gstin, M + 3, yl, 110);
  let yr = field('Date:', formatDate(invoice.date), rx, y, 62, 22);
  yr = field('Invoice No.:', invoice.invoiceNo, rx, yr, 62, 22);

  y = Math.max(yl, yr);
  rule(y);
  y += 6;

  // ---------- Delivery address ----------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text('Delivery Address:', M + 3, y);
  y += 5.5;

  let dl = field('Client Name:', delivery.name, M + 3, y, 110);
  dl = field('Address:', delivery.address, M + 3, dl, 110);
  dl = field('GSTIN:', delivery.gstin, M + 3, dl, 110);
  const dr = field(
    'State Name:',
    `${delivery.stateName || ''}${delivery.stateCode ? `, ${delivery.stateCode}` : ''}`,
    rx,
    y,
    62,
    22
  );

  y = Math.max(dl, dr);
  rule(y);
  // Ab y wahi hai jahan se items table shuru hogi

  // ---------- Neeche ke hisse ki height (table se PEHLE nikalte hain, taaki page ek hi rahe) ----------
  const rowH = 7.5;
  const boxW = 90;
  const boxX = pageW - M - boxW;
  const leftW = boxX - (M + 3) - 4;

  const totalRows = [['Total Value', totals.subtotal]];
  if (Number(cgstRate) > 0) totalRows.push([`Add : CGST ${cgstRate}%`, totals.cgst]);
  if (Number(sgstRate) > 0) totalRows.push([`Add : SGST ${sgstRate}%`, totals.sgst]);
  totalRows.push(['Grand Total', totals.grand]);
  const totalsH = totalRows.length * rowH;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const bankLines = shop.bankDetails ? doc.splitTextToSize(shop.bankDetails, leftW) : [];
  const termsLines = shop.terms ? doc.splitTextToSize(shop.terms, leftW) : [];
  const leftH =
    (bankLines.length ? 4.2 + bankLines.length * 4 + 3 : 0) +
    (termsLines.length ? 4.2 + termsLines.length * 4 + 3 : 0);
  const midH = Math.max(totalsH, leftH);

  doc.setFontSize(9);
  const wordLines = doc.splitTextToSize(amountInWords(totals.grand), pageW - 2 * M - 40);
  const wordsH = wordLines.length * 4.4;

  const SIG_H = 30;
  const bottomH = midH + 7 + wordsH + 4 + SIG_H;

  // ---------- Items table ----------
  const ROW_H = 8;
  const HEAD_H = 8;
  const descW = pageW - 2 * M - (14 + 24 + 16 + 28 + 32) - 4.4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const itemRowsH = items.reduce((sum, it) => {
    const n = Math.max(1, doc.splitTextToSize(String(it.description || ''), descW).length);
    return sum + Math.max(ROW_H, n * 3.65 + 4);
  }, 0);

  const rows = items.map((it, i) => [
    i + 1,
    it.description,
    it.hsn || '',
    it.qty,
    formatINR(it.rate),
    formatINR((Number(it.qty) || 0) * (Number(it.rate) || 0)),
  ]);

  // Bachi hui jagah jitni khali rows, taaki table page bhar de aur sab kuch page 1 pe rahe
  const room = pageH - M - bottomH - y - HEAD_H - itemRowsH - 2;
  const padCount = Math.max(0, Math.floor(room / ROW_H));
  for (let i = 0; i < padCount; i += 1) rows.push(['', '', '', '', '', '']);

  autoTable(doc, {
    startY: y,
    head: [['S.No', 'Description', 'HSN Code', 'Qty', 'Rate', 'Amount']],
    body: rows,
    theme: 'grid',
    margin: { left: M, right: M, top: M + 2, bottom: M + 2 },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: { top: 2, bottom: 2, left: 2.2, right: 2.2 },
      lineColor: LINE,
      lineWidth: 0.2,
      textColor: INK,
      minCellHeight: ROW_H,
      valign: 'middle',
    },
    headStyles: {
      fillColor: HEAD_BG,
      textColor: NAVY,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 32, halign: 'right' },
    },
    didDrawPage: drawBorder,
  });

  // ---------- Totals + bank/terms (side by side) ----------
  let ty = doc.lastAutoTable.finalY;
  if (ty + bottomH > pageH - M) {
    // Bahut zyada items: totals aakhri page par
    doc.addPage();
    drawBorder();
    ty = M + 6;
  }

  totalRows.forEach(([label, value], i) => {
    const ry = ty + i * rowH;
    const isGrand = i === totalRows.length - 1;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    if (isGrand) {
      doc.setFillColor(...HEAD_BG);
      doc.rect(boxX, ry, boxW, rowH, 'FD');
    } else {
      doc.rect(boxX, ry, boxW, rowH);
    }
    doc.setFont('helvetica', isGrand ? 'bold' : 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...(isGrand ? NAVY : INK));
    doc.text(label, boxX + 3, ry + 5);
    doc.text(formatINR(value), pageW - M - 3, ry + 5, { align: 'right' });
  });

  // Bank details / terms (left side, totals ke bagal me)
  let yl2 = ty + 4;
  doc.setTextColor(...INK);
  if (bankLines.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Bank Details:', M + 3, yl2);
    yl2 += 4.2;
    doc.setFont('helvetica', 'normal');
    doc.text(bankLines, M + 3, yl2);
    yl2 += bankLines.length * 4 + 3;
  }
  if (termsLines.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Terms & Conditions:', M + 3, yl2);
    yl2 += 4.2;
    doc.setFont('helvetica', 'normal');
    doc.text(termsLines, M + 3, yl2);
  }

  // ---------- Amount in words ----------
  const yWords = ty + midH + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text('Amount in Words:', M + 3, yWords);
  doc.setFont('helvetica', 'normal');
  doc.text(wordLines, M + 36, yWords);

  // ---------- Signature (page ke neeche, right side) ----------
  const sigY = Math.max(yWords + wordsH + 4, pageH - M - SIG_H);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text(`For ${(shop.name || '').toUpperCase()}`, pageW - M - 3, sigY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Authorised Signature', pageW - M - 3, sigY + 24, { align: 'right' });

  return doc;
};