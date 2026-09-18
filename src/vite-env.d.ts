/// <reference types="vite/client" />

/** Project list baked into the bundle at build time — see `projectsSnapshot` in vite.config.ts. */
declare module 'virtual:projects-snapshot' {
  import type { Project } from './lib/types';
  export const projects: Project[];
}
