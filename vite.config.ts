import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function devMockApiPlugin(): Plugin {
  return {
    name: 'dev-mock-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/projects', (_req, res) => {
        const placeholder = '/src/assets/placeholderthumbnail.png';
        const projects = Array.from({ length: 16 }).map((_, i) => ({
          id: String(i + 1),
          title: `Project ${i + 1}`,
          thumbnailUrl: placeholder,
        }));
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ projects }));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devMockApiPlugin()],
});
