// Vercel Edge Function: proxies the CMS so the API key stays server-side.
// Configure CMS_API_URL and CMS_API_KEY in Vercel env (Production + Preview).

export const config = { runtime: 'edge' };

interface HecosItem {
  id: string;
  Title: string;
  Cover: string;
  _status: string;
}

interface HecosResponse {
  data: HecosItem[];
}

export default async function handler(): Promise<Response> {
  const url = process.env.CMS_API_URL;
  const key = process.env.CMS_API_KEY;

  if (!url || !key) {
    return Response.json(
      { error: 'CMS_API_URL or CMS_API_KEY is not configured.' },
      { status: 500 },
    );
  }

  try {
    const upstream = await fetch(url, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
    });

    if (!upstream.ok) {
      return Response.json(
        { error: `Upstream CMS responded ${upstream.status}` },
        { status: 502, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const json = (await upstream.json()) as HecosResponse;
    const projects = json.data
      .filter((item) => item._status === 'published')
      .map((item) => ({
        id: item.id,
        title: item.Title,
        thumbnailUrl: item.Cover,
      }));

    return Response.json(
      { projects },
      {
        headers: {
          // The CMS takes 2-4s to answer, so the edge keeps a copy and always
          // serves it instantly. s-maxage=1 means that copy is considered stale
          // almost immediately and stale-while-revalidate refreshes it in the
          // background instead of making the visitor wait. A CMS edit is
          // therefore at most one reload behind -- never the ~6 min window an
          // s-maxage of minutes used to produce.
          'Cache-Control': 'public, max-age=0, s-maxage=1, stale-while-revalidate=86400',
          // The browser must not hold its own copy: only the edge caches here.
          'CDN-Cache-Control': 'public, s-maxage=1, stale-while-revalidate=86400',
        },
      },
    );
  } catch (err) {
    console.error('CMS proxy error:', err);
    return Response.json(
      { error: 'Failed to reach upstream CMS.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
