import { NextRequest, NextResponse } from 'next/server';

// Replaces the old /images/:path* -> Supabase rewrite (see next.config.ts
// for why). Fetches the object server-side and re-serves it with an
// explicit, long-lived Cache-Control — uploaded product/blog images are
// either SHA-256 content-hashed or unique-per-upload (upload always uses
// upsert: false), so a given path's bytes never change after creation.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  let host: string;
  try {
    host = new URL(supabaseUrl).host;
  } catch {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const { path } = await params;
  const upstreamUrl = `https://${host}/storage/v1/object/public/${path.map(encodeURIComponent).join('/')}`;

  let upstream: Response;
  try {
    // Cache the upstream fetch itself in Next's server-side Data Cache — the
    // object's bytes never change (see comment above), so without this every
    // visitor's first load of a given image re-fetches it from Supabase from
    // scratch. This is what actually made galleries feel slow to load.
    upstream = await fetch(upstreamUrl, { next: { revalidate: 2592000 } });
  } catch (error) {
    console.error('Error fetching Supabase object:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: 'Not found' }, { status: upstream.status });
  }

  const buffer = await upstream.arrayBuffer();
  const contentType = upstream.headers.get('content-type') || 'application/octet-stream';

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
