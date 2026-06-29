export type Project = {
  id: string;
  title: string;
  thumbnailUrl: string;
  url?: string;
  description?: string;
};

export type ProjectsResponse = {
  projects: Project[];
};
