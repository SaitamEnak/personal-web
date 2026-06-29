import type { ProjectsResponse } from './types';

interface HecosItem {
  id: string;
  Title: string;
  Cover: string;
  _status: string;
}

interface HecosResponse {
  data: HecosItem[];
}

const RETRY_DELAYS = [1500, 3000, 6000];

export async function fetchProjects(signal?: AbortSignal): Promise<ProjectsResponse> {
  const url = import.meta.env.VITE_CMS_API_URL as string;
  const key = import.meta.env.VITE_CMS_API_KEY as string;
  const headers: HeadersInit = key ? { Authorization: `Bearer ${key}` } : {};

  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    try {
      const res = await fetch(url, { signal, headers });
      if (!res.ok) throw new Error(`Failed to load projects (${res.status})`);

      const json: HecosResponse = await res.json();
      return {
        projects: json.data
          .filter((item) => item._status === 'published')
          .map((item) => ({
            id: item.id,
            title: item.Title,
            thumbnailUrl: item.Cover,
          })),
      };
    } catch (err) {
      if (signal?.aborted) throw err;
      lastError = err;

      const delay = RETRY_DELAYS[attempt];
      if (delay === undefined) break;

      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, delay);
        signal?.addEventListener('abort', () => { clearTimeout(t); reject(err); }, { once: true });
      });
    }
  }

  throw lastError;
}
