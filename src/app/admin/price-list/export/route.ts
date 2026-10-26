import { NextResponse, type NextRequest } from 'next/server';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { requireDashboardUser } from '@/lib/telegram/require-user';
import { parsePriceListParams } from '@/lib/price-list/config';
import { getPriceListGroups } from '@/lib/price-list/data';
import { buildPriceListWorkbook } from '@/lib/price-list/excel';
import { renderPriceListPdf, type PriceListFonts } from '@/lib/price-list/pdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Large catalogs with thumbnails take a while to render.
export const maxDuration = 300;

const MAX_IMAGES = 1500;
const IMAGE_CONCURRENCY = 8;

/** Fetches + downsizes product images to small JPEGs (PDFKit only reads JPEG/PNG). */
async function loadThumbnails(urls: string[]): Promise<Map<string, Buffer>> {
  const out = new Map<string, Buffer>();
  const queue = [...new Set(urls)].slice(0, MAX_IMAGES);

  async function worker() {
    while (queue.length) {
      const url = queue.shift()!;
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
        if (!res.ok) continue;
        const input = Buffer.from(await res.arrayBuffer());
        const jpeg = await sharp(input)
          .resize(80, 80, { fit: 'contain', background: '#ffffff' })
          .flatten({ background: '#ffffff' })
          .jpeg({ quality: 78 })
          .toBuffer();
        out.set(url, jpeg);
      } catch {
        // Missing/broken image → the cell shows a dash instead.
      }
    }
  }

  await Promise.all(Array.from({ length: IMAGE_CONCURRENCY }, worker));
  return out;
}

async function loadLogo(): Promise<Buffer | null> {
  try {
    const raw = await readFile(path.join(process.cwd(), 'public', 'images', 'royalLogo.png'));
    return await sharp(raw).resize(120, 120, { fit: 'inside' }).png().toBuffer();
  } catch {
    return null;
  }
}

// Read once per server instance; null → the PDF falls back to built-in fonts.
let fontsPromise: Promise<PriceListFonts | null> | null = null;
function loadFonts(): Promise<PriceListFonts | null> {
  fontsPromise ??= (async () => {
    const dir = path.join(process.cwd(), 'public', 'fonts', 'pdf');
    try {
      const [body, bodyBold, serif, serifBold] = await Promise.all(
        ['Inter_400Regular', 'Inter_600SemiBold', 'PlayfairDisplay_400Regular', 'PlayfairDisplay_700Bold'].map((f) =>
          readFile(path.join(dir, `${f}.ttf`))
        )
      );
      return { body, bodyBold, serif, serifBold };
    } catch (error) {
      console.error('Price list fonts missing, falling back to built-in PDF fonts:', error);
      return null;
    }
  })();
  return fontsPromise;
}

function fileSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'price-list';
}

export async function GET(request: NextRequest) {
  const user = await requireDashboardUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = Object.fromEntries(
    [...new Set(request.nextUrl.searchParams.keys())].map((k) => {
      const all = request.nextUrl.searchParams.getAll(k);
      return [k, all.length > 1 ? all : all[0]];
    })
  );
  const format = request.nextUrl.searchParams.get('format') === 'xlsx' ? 'xlsx' : 'pdf';
  const config = parsePriceListParams(params);
  const generatedAt = new Date();
  const stamp = generatedAt.toISOString().slice(0, 10);
  const filename = `royal-perfumes-${fileSlug(config.title)}-${stamp}.${format}`;

  try {
    const { groups, rowCount } = await getPriceListGroups(config);

    if (format === 'xlsx') {
      const buffer = buildPriceListWorkbook(config, groups, generatedAt);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const wantsImages = config.columns.includes('image');
    const [fonts, logo, images] = await Promise.all([
      loadFonts(),
      loadLogo(),
      wantsImages
        ? loadThumbnails(groups.flatMap((g) => g.rows.map((r) => r.image).filter((u): u is string => !!u)))
        : Promise.resolve(new Map<string, Buffer>()),
    ]);

    const pdf = await renderPriceListPdf({ fonts, config, groups, rowCount, logo, images, generatedAt });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Price list export failed:', error);
    const back = new URL('/admin/price-list', request.url);
    request.nextUrl.searchParams.forEach((v, k) => k !== 'format' && back.searchParams.append(k, v));
    back.searchParams.set('error', 'export');
    return NextResponse.redirect(back, 303);
  }
}
