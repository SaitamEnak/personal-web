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

export async function fetchProjects(signal?: AbortSignal): Promise<ProjectsResponse> {
  const url = import.meta.env.VITE_CMS_API_URL as string;
  const key = import.meta.env.VITE_CMS_API_KEY as string;

  const res = await fetch(url, {
    signal,
    headers: key ? { Authorization: `Bearer ${key}` } : {},
  });
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
}
