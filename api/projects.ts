// Vercel Serverless Function: proxies the user's CMS so the API key stays server-side.
// Configure CMS_API_URL and CMS_API_KEY in Vercel env (Production + Preview).

export const config = { runtime: 'edge' };

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
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
    });

    if (!upstream.ok) {
      return Response.json(
        { error: `Upstream CMS responded ${upstream.status}` },
        { status: 502 },
      );
    }

    const body = await upstream.text();

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error('CMS proxy error:', err);
    return Response.json({ error: 'Failed to reach upstream CMS.' }, { status: 502 });
  }
}
