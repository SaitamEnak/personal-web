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

const SNAPSHOT_ID = 'virtual:projects-snapshot';
const RESOLVED_SNAPSHOT_ID = '\0' + SNAPSHOT_ID;

// The edge cache only ever helps the *second* visitor: stale-while-revalidate has
// nothing to serve until someone has already paid for a miss, and on a low-traffic
// site almost every visitor is the first one. So the project list is also baked
// into the bundle at build time, where it rides the same immutable-asset cache as
// the JS and always hits. The client renders that copy on the first frame and swaps
// in fresh data from /api/projects when it lands.
function projectsSnapshot(isBuild: boolean): Plugin {
  let projects = '[]';

  return {
    name: 'projects-snapshot',
    async buildStart() {
      // Dev keeps an empty snapshot on purpose: it is the only way to exercise the
      // skeleton path, and it keeps `pnpm dev` from waiting on the CMS to boot.
      if (!isBuild) return;

      try {
        const response = await handler();
        if (!response.ok) throw new Error(`handler responded ${response.status}`);

        const body = (await response.json()) as { projects?: unknown[] };
        projects = JSON.stringify(body.projects ?? []);
        console.log(`[projects-snapshot] baked ${body.projects?.length ?? 0} projects`);
      } catch (err) {
        // A CMS outage must never break a deploy. Ship an empty snapshot and let
        // the client fall back to fetching, exactly as it did before.
        this.warn(`could not bake a projects snapshot, shipping empty: ${String(err)}`);
        projects = '[]';
      }
    },
    resolveId(id) {
      return id === SNAPSHOT_ID ? RESOLVED_SNAPSHOT_ID : null;
    },
    load(id) {
      return id === RESOLVED_SNAPSHOT_ID ? `export const projects = ${projects};` : null;
    },
  };
}

export default defineConfig(({ mode, command }) => {
  // '' prefix so non-VITE_ vars (CMS_API_URL / CMS_API_KEY) load too. They stay
  // server-side: only the middleware and the build-time snapshot read them, and
  // the snapshot only ever emits the public project list, never the key.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [react(), apiProjects(), projectsSnapshot(command === 'build')],
  };
});
