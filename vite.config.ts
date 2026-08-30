import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import handler from './api/projects';

// In dev there is no Vercel runtime, and Vite would otherwise serve api/projects.ts
// as a transpiled JS module (200 text/javascript), which the client cannot parse as
// JSON. This middleware runs the real Edge handler so dev and prod share one code path.
function apiProjects(): Plugin {
  return {
    name: 'dev-api-projects',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || req.url.split('?')[0] !== '/api/projects') return next();

        handler()
          .then(async (response) => {
            res.statusCode = response.status;
            response.headers.forEach((value, key) => res.setHeader(key, value));
            res.end(await response.text());
          })
          .catch(next);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // '' prefix so non-VITE_ vars (CMS_API_URL / CMS_API_KEY) load too. They stay
  // server-side: only the middleware above reads them, never the client bundle.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return { plugins: [react(), apiProjects()] };
});
