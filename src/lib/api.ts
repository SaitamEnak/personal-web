import type { ProjectsResponse } from './types';

export async function fetchProjects(signal?: AbortSignal): Promise<ProjectsResponse> {
  const res = await fetch('/api/projects', { signal });
  if (!res.ok) throw new Error(`Failed to load projects (${res.status})`);
  return (await res.json()) as ProjectsResponse;
}
