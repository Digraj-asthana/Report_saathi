import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        intelligence: path.resolve(__dirname, 'intelligence.html'),
        tracker: path.resolve(__dirname, 'tracker.html'),
        telehealth: path.resolve(__dirname, 'telehealth.html'),
        assistant: path.resolve(__dirname, 'assistant.html'),
        upload: path.resolve(__dirname, 'upload.html'),
        login: path.resolve(__dirname, 'login.html'),
        profile: path.resolve(__dirname, 'profile.html'),
      }
    }
  },
  plugins: [
    {
      name: 'serve-frames-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/frames/')) {
            const fileName = req.url.replace('/frames/', '').split('?')[0];
            const filePath = path.resolve(__dirname, 'public', 'frames', fileName);
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'image/jpeg');
              res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
              return fs.createReadStream(filePath).pipe(res);
            }
          }
          next();
        });
      }
    }
  ]
});
