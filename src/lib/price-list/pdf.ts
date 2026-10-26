import PDFDocument from 'pdfkit';
import {
  PRICE_LIST_COLUMNS,
  cellText,
  type PriceGroup,
  type PriceListColumn,
  type PriceListConfig,
  type PriceRow,
} from './config';

// Drawn directly with PDFKit rather than @react-pdf: react-pdf lays out every
// cell as a flex text node (~2ms each), so a full catalog took 40s+; PDFKit
// renders the same table in well under a second. Embeds the site's own fonts
// (Inter body, Playfair Display headings) — the built-in PDF fonts are
// WinAnsi-only and garble Turkish names like "İRİS"; falls back to them if
// the font files are missing.
//
// Compact by design: one continuous table per page (header repeated on each
// page) with brands/categories as thin band rows, rather than a separate title
// + header per group — with ~100 brands that halves the page count.

const INK = '#0a0a0a';
const MUTED = '#6b7280';
const RULE = '#ebebeb';
const ZEBRA = '#fafafa';
const BAND = '#f2f2f2';
const ACCENT = '#7f1d1d';

const MARGIN = 32;
const CONTENT_TOP = 66;
const FOOTER_SPACE = 40;
const CELL_PAD_X = 4.5;
const CELL_PAD_Y = 3;
const MIN_ROW = 13;
const HEADER_H = 15;
const BAND_H = 15;
const THUMB = 20;
const BODY_SIZE = 7.5;
const DESCRIPTION_MAX = 160;

export interface PriceListFonts {
  body: Buffer;
  bodyBold: Buffer;
  serif: Buffer;
  serifBold: Buffer;
}

interface RenderInput {
  fonts: PriceListFonts | null;
  config: PriceListConfig;
  groups: PriceGroup[];
  rowCount: number;
  logo: Buffer | null;
  images: Map<string, Buffer>;
  generatedAt: Date;
}

export function isLandscape(columns: PriceListColumn[]): boolean {
  return columns.reduce((n, c) => n + c.weight, 0) > 13;
}

export function renderPriceListPdf(input: RenderInput): Promise<Buffer> {
  const { fonts, config, groups, rowCount, logo, images, generatedAt } = input;
  const columns = PRICE_LIST_COLUMNS.filter((c) => config.columns.includes(c.id));

  const doc = new PDFDocument({
    size: 'A4',
    layout: isLandscape(columns) ? 'landscape' : 'portrait',
    margins: { top: CONTENT_TOP, bottom: FOOTER_SPACE, left: MARGIN, right: MARGIN },
    bufferPages: true,
    info: { Title: config.title, Author: 'Royal Perfumes', Creator: 'Royal Perfumes Admin' },
  });

  let BODY = 'Helvetica';
  let BODY_BOLD = 'Helvetica-Bold';
  let SERIF = 'Times-Roman';
  let SERIF_BOLD = 'Times-Bold';
  if (fonts) {
    doc.registerFont('Body', fonts.body);
    doc.registerFont('BodyBold', fonts.bodyBold);
    doc.registerFont('Serif', fonts.serif);
    doc.registerFont('SerifBold', fonts.serifBold);
    [BODY, BODY_BOLD, SERIF, SERIF_BOLD] = ['Body', 'BodyBold', 'Serif', 'SerifBold'];
  }

  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const pageW = doc.page.width;
  const pageH = doc.page.height;
  const contentW = pageW - MARGIN * 2;
  const bottom = pageH - FOOTER_SPACE;
  const totalWeight = columns.reduce((n, c) => n + c.weight, 0);
  const widths = columns.map((c) => (c.weight / totalWeight) * contentW);
  const xs = widths.map((_, i) => MARGIN + widths.slice(0, i).reduce((a, b) => a + b, 0));
  const dateText = generatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  let y = CONTENT_TOP;

  // ── Intro (first page only, kept to two short lines) ────────
  doc.font(SERIF).fontSize(18).fillColor(INK)
    .text(config.title, MARGIN, y, { width: contentW * 0.62, lineBreak: false, ellipsis: true });
  const meta = `${rowCount} PRODUCTS  ·  ${dateText.toUpperCase()}`;
  doc.font(BODY).fontSize(6.5).fillColor(MUTED)
    .text(meta, MARGIN, y + 7, { width: contentW, align: 'right', characterSpacing: 1.2, lineBreak: false });
  y += 22;
  if (config.note) {
    doc.font(BODY).fontSize(BODY_SIZE).fillColor('#404040')
      .text(config.note, MARGIN, y, { width: contentW, lineGap: 1.5 });
    y = doc.y + 4;
  }
  y += 4;

  // ── Table helpers ───────────────────────────────────────────
  const drawTableHeader = () => {
    doc.rect(MARGIN, y, contentW, HEADER_H).fill(INK);
    doc.fillColor('#ffffff');
    columns.forEach((c, i) => {
      // Narrow columns: tighten tracking, then the size, so labels never wrap.
      const label = c.label.toUpperCase();
      const avail = widths[i] - CELL_PAD_X * 2;
      let size = 6.2;
      let spacing = 1;
      doc.font(BODY_BOLD).fontSize(size);
      if (doc.widthOfString(label, { characterSpacing: spacing }) > avail) spacing = 0.2;
      while (size > 4.5 && doc.fontSize(size).widthOfString(label, { characterSpacing: spacing }) > avail) size -= 0.25;
      doc.fontSize(size).text(label, xs[i] + CELL_PAD_X, y + 5 + (6.2 - size) / 2, {
        width: avail + 2,
        align: c.align,
        characterSpacing: spacing,
        lineBreak: false,
      });
    });
    y += HEADER_H;
  };

  const newPage = () => {
    doc.addPage();
    y = CONTENT_TOP;
    drawTableHeader();
  };

  const cellFont = (c: PriceListColumn, row: PriceRow): { font: string; color: string } => {
    if (c.id === 'name' || c.id === 'final') return { font: BODY_BOLD, color: INK };
    if (c.id === 'stock' && !row.inStock) return { font: BODY, color: ACCENT };
    if (c.id === 'ref' || c.id === 'discount' || c.id === 'description') return { font: BODY, color: MUTED };
    return { font: BODY, color: INK };
  };

  const cellValue = (c: PriceListColumn, row: PriceRow) => {
    const text = cellText(row, c.id, config.currency);
    if (c.id === 'description') {
      if (!text) return '—';
      return text.length > DESCRIPTION_MAX ? `${text.slice(0, DESCRIPTION_MAX).trimEnd()}…` : text;
    }
    return text;
  };

  const rowHeight = (row: PriceRow) => {
    let h = 0;
    columns.forEach((c, i) => {
      if (c.id === 'image') {
        h = Math.max(h, THUMB);
        return;
      }
      doc.font(cellFont(c, row).font).fontSize(BODY_SIZE);
      h = Math.max(h, doc.heightOfString(cellValue(c, row), { width: widths[i] - CELL_PAD_X * 2, lineGap: 0.5 }));
    });
    return Math.max(h + CELL_PAD_Y * 2, MIN_ROW);
  };

  const drawRow = (row: PriceRow, index: number, h: number) => {
    if (index % 2 === 1) doc.rect(MARGIN, y, contentW, h).fill(ZEBRA);
    columns.forEach((c, i) => {
      if (c.id === 'image') {
        const img = row.image ? images.get(row.image) : undefined;
        if (img) {
          try {
            doc.image(img, xs[i] + (widths[i] - THUMB) / 2, y + (h - THUMB) / 2, { fit: [THUMB, THUMB], align: 'center', valign: 'center' });
            return;
          } catch {
            // fall through to the dash
          }
        }
        doc.font(BODY).fontSize(BODY_SIZE).fillColor('#d1d5db')
          .text('—', xs[i], y + h / 2 - 4, { width: widths[i], align: 'center', lineBreak: false });
        return;
      }
      const { font, color } = cellFont(c, row);
      doc.font(font).fontSize(BODY_SIZE).fillColor(color).text(cellValue(c, row), xs[i] + CELL_PAD_X, y + CELL_PAD_Y, {
        width: widths[i] - CELL_PAD_X * 2,
        align: c.align,
        lineGap: 0.5,
      });
    });
    doc.moveTo(MARGIN, y + h).lineTo(MARGIN + contentW, y + h).lineWidth(0.4).strokeColor(RULE).stroke();
    y += h;
  };

  const drawBand = (title: string, count: number) => {
    doc.rect(MARGIN, y, contentW, BAND_H).fill(BAND);
    doc.rect(MARGIN, y, 2, BAND_H).fill(INK);
    doc.font(SERIF_BOLD).fontSize(9).fillColor(INK)
      .text(title, MARGIN + 8, y + 3.5, { width: contentW * 0.75, lineBreak: false, ellipsis: true });
    doc.font(BODY).fontSize(6).fillColor(MUTED)
      .text(`${count} ${count === 1 ? 'ITEM' : 'ITEMS'}`, MARGIN, y + 5, { width: contentW - 6, align: 'right', characterSpacing: 1.2, lineBreak: false });
    y += BAND_H;
  };

  // ── Body ────────────────────────────────────────────────────
  if (rowCount === 0) {
    doc.font(BODY).fontSize(10).fillColor(MUTED)
      .text('No products match the selected filters.', MARGIN, y + 30, { width: contentW, align: 'center' });
  } else {
    drawTableHeader();
    for (const group of groups) {
      if (group.rows.length === 0) continue;
      if (group.title) {
        // Never leave a band stranded at the bottom of a page.
        if (y + BAND_H + rowHeight(group.rows[0]) > bottom) newPage();
        drawBand(group.title, group.rows.length);
      }
      group.rows.forEach((row, i) => {
        const h = rowHeight(row);
        if (y + h > bottom) newPage();
        drawRow(row, i, h);
      });
    }
  }

  // ── Header / footer on every page (needs the final page count) ──
  const range = doc.bufferedPageRange();
  for (let p = range.start; p < range.start + range.count; p++) {
    doc.switchToPage(p);
    // Temporarily drop the bottom margin so footer text can't trigger a new page.
    const savedBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    doc.rect(0, 0, pageW, 3).fill(ACCENT);

    let bx = MARGIN;
    if (logo) {
      try {
        doc.image(logo, MARGIN, 17, { fit: [24, 24] });
        bx += 31;
      } catch {
        // logo optional
      }
    }
    doc.font(SERIF_BOLD).fontSize(13).fillColor(INK).text('Royal Perfumes', bx, 16, { lineBreak: false });
    doc.font(BODY).fontSize(6).fillColor(MUTED).text('PREMIUM QUALITY WHOLESALE', bx, 36.5, { characterSpacing: 1.5, lineBreak: false });

    doc.font(BODY).fontSize(6.5).fillColor(INK)
      .text(config.title.toUpperCase(), MARGIN, 21, { width: contentW, align: 'right', characterSpacing: 1.5, lineBreak: false });
    doc.font(BODY).fontSize(6.5).fillColor(MUTED)
      .text(dateText, MARGIN, 31, { width: contentW, align: 'right', lineBreak: false });
    doc.moveTo(MARGIN, 48).lineTo(pageW - MARGIN, 48).lineWidth(0.6).strokeColor(INK).stroke();

    const fy = pageH - 26;
    doc.moveTo(MARGIN, fy - 6).lineTo(pageW - MARGIN, fy - 6).lineWidth(0.4).strokeColor(RULE).stroke();
    doc.font(BODY).fontSize(6).fillColor(MUTED)
      .text('ROYALPERFUMES.COMPANY · PRICES SUBJECT TO CHANGE WITHOUT NOTICE', MARGIN, fy, { characterSpacing: 0.8, lineBreak: false });
    doc.text(`${p - range.start + 1} / ${range.count}`, MARGIN, fy, { width: contentW, align: 'right', lineBreak: false });

    doc.page.margins.bottom = savedBottom;
  }

  doc.end();
  return done;
}
