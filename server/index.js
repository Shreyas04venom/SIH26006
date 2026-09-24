// Native Node.js .env loader
try {
  if (process.loadEnvFile) {
    process.loadEnvFile();
  }
} catch (e) {}

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT || '8080', 10);

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Serve static frontend build if it exists
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`\n🚀 ASTRA Maritime Intelligence Server running on http://localhost:${port}\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is currently in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(DEFAULT_PORT);
