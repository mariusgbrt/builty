import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote, QuoteItem } from '../hooks/useQuotes';
import { Invoice, InvoiceItem } from '../hooks/useInvoices';

interface Company {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  siret?: string;
  vat_number?: string;
  logo_url?: string;
  primary_color?: string;
}

interface Client {
  name: string;
}

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export async function generateQuotePDF(
  quote: Quote,
  items: QuoteItem[],
  company: Company,
  client: Client | undefined
) {
  const doc = new jsPDF();
  const primaryColor = company.primary_color || '#0D47A1';
  const colorRgb = hexToRgb(primaryColor);

  let yPosition = 20;

  if (company.logo_url) {
    try {
      const img = await loadImage(company.logo_url);
      const imgWidth = 40;
      const imgHeight = (img.height / img.width) * imgWidth;
      doc.addImage(img, 'PNG', 15, yPosition, imgWidth, imgHeight);
      yPosition = Math.max(yPosition + imgHeight + 10, 50);
    } catch (error) {
      console.error('Erreur chargement logo:', error);
      yPosition = 50;
    }
  }

  doc.setFontSize(10);
  doc.setTextColor(100);
  const companyInfoX = 120;
  let companyY = 20;
  doc.text(company.name, companyInfoX, companyY);
  companyY += 5;
  if (company.address) {
    doc.text(company.address, companyInfoX, companyY);
    companyY += 5;
  }
  if (company.postal_code && company.city) {
    doc.text(`${company.postal_code} ${company.city}`, companyInfoX, companyY);
    companyY += 5;
  }
  if (company.email) {
    doc.text(company.email, companyInfoX, companyY);
    companyY += 5;
  }
  if (company.phone) {
    doc.text(company.phone, companyInfoX, companyY);
    companyY += 5;
  }
  if (company.siret) {
    doc.text(`SIRET: ${company.siret}`, companyInfoX, companyY);
    companyY += 5;
  }

  yPosition = Math.max(yPosition, companyY + 10);

  doc.setFontSize(24);
  doc.setTextColor(colorRgb.r, colorRgb.g, colorRgb.b);
  doc.text('DEVIS', 15, yPosition);
  yPosition += 15;

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Numéro: ${quote.quote_number}`, 15, yPosition);
  yPosition += 7;
  doc.text(`Date: ${new Date(quote.created_at).toLocaleDateString('fr-FR')}`, 15, yPosition);
  yPosition += 7;
  doc.text(`Statut: ${quote.status}`, 15, yPosition);
  yPosition += 15;

  doc.setFontSize(12);
  doc.setTextColor(colorRgb.r, colorRgb.g, colorRgb.b);
  doc.text('CLIENT', 15, yPosition);
  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(client?.name || 'Client inconnu', 15, yPosition);
  yPosition += 15;

  const tableData = items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unit_price_ht.toFixed(2)} €`,
    `${item.tva_rate}%`,
    `${item.total_ht.toFixed(2)} €`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Description', 'Qté', 'PU HT', 'TVA', 'Total HT']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [colorRgb.r, colorRgb.g, colorRgb.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 20, halign: 'right' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.text(`Total HT: ${quote.amount_ht?.toFixed(2)} €`, 140, finalY);
  doc.text(`TVA: ${quote.tva_amount?.toFixed(2)} €`, 140, finalY + 7);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(colorRgb.r, colorRgb.g, colorRgb.b);
  doc.text(`Total TTC: ${quote.amount_ttc?.toFixed(2)} €`, 140, finalY + 14);

  if (quote.notes) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0);
    doc.text('Notes:', 15, finalY + 25);
    const splitNotes = doc.splitTextToSize(quote.notes, 180);
    doc.text(splitNotes, 15, finalY + 32);
  }

  doc.save(`Devis_${quote.quote_number}.pdf`);
}

export async function generateInvoicePDF(
  invoice: Invoice,
  items: InvoiceItem[],
  company: Company,
  client: Client | undefined
) {
  const doc = new jsPDF();
  const primaryColor = company.primary_color || '#0D47A1';
  const colorRgb = hexToRgb(primaryColor);

  let yPosition = 20;

  if (company.logo_url) {
    try {
      const img = await loadImage(company.logo_url);
      const imgWidth = 40;
      const imgHeight = (img.height / img.width) * imgWidth;
      doc.addImage(img, 'PNG', 15, yPosition, imgWidth, imgHeight);
      yPosition = Math.max(yPosition + imgHeight + 10, 50);
    } catch (error) {
      console.error('Erreur chargement logo:', error);
      yPosition = 50;
    }
  }

  doc.setFontSize(10);
  doc.setTextColor(100);
  const companyInfoX = 120;
  let companyY = 20;
  doc.text(company.name, companyInfoX, companyY);
  companyY += 5;
  if (company.address) {
    doc.text(company.address, companyInfoX, companyY);
    companyY += 5;
  }
  if (company.postal_code && company.city) {
    doc.text(`${company.postal_code} ${company.city}`, companyInfoX, companyY);
    companyY += 5;
  }
  if (company.email) {
    doc.text(company.email, companyInfoX, companyY);
    companyY += 5;
  }
  if (company.phone) {
    doc.text(company.phone, companyInfoX, companyY);
    companyY += 5;
  }
  if (company.siret) {
    doc.text(`SIRET: ${company.siret}`, companyInfoX, companyY);
    companyY += 5;
  }
  if (company.vat_number) {
    doc.text(`TVA: ${company.vat_number}`, companyInfoX, companyY);
    companyY += 5;
  }

  yPosition = Math.max(yPosition, companyY + 10);

  doc.setFontSize(24);
  doc.setTextColor(colorRgb.r, colorRgb.g, colorRgb.b);
  doc.text('FACTURE', 15, yPosition);
  yPosition += 15;

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Numéro: ${invoice.invoice_number}`, 15, yPosition);
  yPosition += 7;
  doc.text(`Date émission: ${new Date(invoice.issue_date).toLocaleDateString('fr-FR')}`, 15, yPosition);
  yPosition += 7;
  doc.text(`Date échéance: ${new Date(invoice.due_date).toLocaleDateString('fr-FR')}`, 15, yPosition);
  yPosition += 7;
  doc.text(`Conditions: ${invoice.payment_terms || '30 jours'}`, 15, yPosition);
  yPosition += 7;
  doc.text(`Statut: ${invoice.status}`, 15, yPosition);
  yPosition += 15;

  doc.setFontSize(12);
  doc.setTextColor(colorRgb.r, colorRgb.g, colorRgb.b);
  doc.text('CLIENT', 15, yPosition);
  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(client?.name || 'Client inconnu', 15, yPosition);
  yPosition += 15;

  const tableData = items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unit_price_ht.toFixed(2)} €`,
    `${item.tva_rate}%`,
    `${item.total_ht.toFixed(2)} €`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Description', 'Qté', 'PU HT', 'TVA', 'Total HT']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [colorRgb.r, colorRgb.g, colorRgb.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 20, halign: 'right' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.text(`Total HT: ${invoice.amount_ht?.toFixed(2)} €`, 140, finalY);
  doc.text(`TVA: ${invoice.tva_amount?.toFixed(2)} €`, 140, finalY + 7);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(colorRgb.r, colorRgb.g, colorRgb.b);
  doc.text(`Total TTC: ${invoice.amount_ttc?.toFixed(2)} €`, 140, finalY + 14);

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0);
  const remainingAmount = (invoice.amount_ttc || 0) - (invoice.amount_paid || 0);
  doc.text(`Montant payé: ${invoice.amount_paid?.toFixed(2)} €`, 140, finalY + 21);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(200, 0, 0);
  doc.text(`Reste à payer: ${remainingAmount.toFixed(2)} €`, 140, finalY + 28);

  if (invoice.notes) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0);
    doc.text('Notes:', 15, finalY + 40);
    const splitNotes = doc.splitTextToSize(invoice.notes, 180);
    doc.text(splitNotes, 15, finalY + 47);
  }

  doc.save(`Facture_${invoice.invoice_number}.pdf`);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 13, g: 71, b: 161 };
}
