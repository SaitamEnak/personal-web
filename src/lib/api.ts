import type { ProjectsResponse } from './types';

const RETRY_DELAYS = [1500, 3000, 6000];

declare global {
  interface Window {
    __projectsPromise?: Promise<ProjectsResponse> | null;
  }
}

export async function fetchProjects(signal?: AbortSignal): Promise<ProjectsResponse> {
  const preloaded = window.__projectsPromise;
  if (preloaded) {
    window.__projectsPromise = null;
    try {
      return await preloaded;
    } catch {
      // fall through to retry logic below
    }
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    try {
      const res = await fetch('/api/projects', { signal });
      if (!res.ok) throw new Error(`Failed to load projects (${res.status})`);
      return (await res.json()) as ProjectsResponse;
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
