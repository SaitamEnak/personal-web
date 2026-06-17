import type { ProjectsResponse } from './types';

export async function fetchProjects(signal?: AbortSignal): Promise<ProjectsResponse> {
  const url = `${import.meta.env.BASE_URL}api/projects.json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Failed to load projects (${res.status})`);
  return (await res.json()) as ProjectsResponse;
}
