export type Project = {
  id: string;
  title: string;
  thumbnailUrl: string;
  url?: string;
};

export type ProjectsResponse = {
  projects: Project[];
};
