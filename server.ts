import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const defaultPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Serve static assets from dist
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Health check endpoint for Cloud Run
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

// SPA catch-all route
app.get('*', (_req, res) => {
  const indexPath = path.resolve(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application build not found. Please run npm run build.');
  }
});

const startServer = (port: number) => {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE' && port !== 3000) {
      console.warn(`Port ${port} in use, falling back to port 3000...`);
      startServer(3000);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

startServer(defaultPort);
