import * as XLSX from 'xlsx';
import { PRICE_LIST_COLUMNS, type PriceGroup, type PriceListConfig } from './config';

const MONEY_COLUMNS = new Set(['price', 'discount', 'final']);

/**
 * Builds the .xlsx on the server. Prices are written as real numbers with a
 * currency number format (so they sum/sort in Excel), with a title block on
 * top and the group name as its own column when grouping is on.
 */
export function buildPriceListWorkbook(
  config: PriceListConfig,
  groups: PriceGroup[],
  generatedAt: Date
): Buffer {
  const columns = PRICE_LIST_COLUMNS.filter((c) => config.columns.includes(c.id) && !c.pdfOnly);
  const groupLabel = config.groupBy === 'brand' ? 'Brand' : config.groupBy === 'category' ? 'Category' : null;
  // Don't repeat the group column if it's also selected as a regular column.
  const showGroupCol = groupLabel && !columns.some((c) => c.id === config.groupBy);

  const headers = [...(showGroupCol ? [groupLabel!] : []), ...columns.map((c) => c.label)];
  const titleRows: (string | number)[][] = [
    ['Royal Perfumes — ' + config.title],
    [`Generated ${generatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`],
    ...(config.note ? [[config.note]] : []),
    [],
  ];
  const headerRowIndex = titleRows.length;

  const body: (string | number)[][] = [];
  for (const g of groups) {
    for (const r of g.rows) {
      const cells = columns.map((c) => {
        if (c.id === 'discount') return r.discount > 0 ? r.discount : '';
        if (MONEY_COLUMNS.has(c.id)) return r.price > 0 ? r[c.id as 'price' | 'final'] : 'On request';
        if (c.id === 'stock') return r.inStock ? 'In stock' : 'Out of stock';
        return r[c.id as 'ref'] as string;
      });
      body.push(showGroupCol ? [g.title ?? '', ...cells] : cells);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...body]);

  // Currency format on money columns.
  const offset = showGroupCol ? 1 : 0;
  const numFmt = `"${config.currency.replace(/"/g, '')}"#,##0.00`;
  columns.forEach((c, ci) => {
    if (!MONEY_COLUMNS.has(c.id)) return;
    for (let r = 0; r < body.length; r++) {
      const ref = XLSX.utils.encode_cell({ r: headerRowIndex + 1 + r, c: ci + offset });
      if (ws[ref] && ws[ref].t === 'n') ws[ref].z = numFmt;
    }
  });

  // Column widths from content length.
  ws['!cols'] = headers.map((h, ci) => {
    const longest = body.reduce((m, row) => Math.max(m, String(row[ci] ?? '').length), h.length);
    return { wch: Math.min(Math.max(longest + 2, 8), 60) };
  });
  ws['!autofilter'] = {
    ref: XLSX.utils.encode_range({ s: { r: headerRowIndex, c: 0 }, e: { r: headerRowIndex + body.length, c: headers.length - 1 } }),
  };
  // Freeze everything above and including the header row.
  ws['!views'] = [{ state: 'frozen', ySplit: headerRowIndex + 1 }] as unknown as XLSX.WorkSheet['!views'];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Price List');
  wb.Props = { Title: config.title, Author: 'Royal Perfumes' };
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}
