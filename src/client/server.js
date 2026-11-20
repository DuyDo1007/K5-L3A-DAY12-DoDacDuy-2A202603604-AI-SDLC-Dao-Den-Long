#!/usr/bin/env node

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLeaderboard, addScore } from '../core/leaderboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  // API LEADERBOARD (Ticket-04 Phase 4)
  if (reqPath === '/api/leaderboard') {
    if (req.method === 'GET') {
      const data = getLeaderboard();
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(data));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const result = addScore(payload);
          res.writeHead(result.success ? 200 : 400, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify(result));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, reason: 'Invalid JSON payload' }));
        }
      });
      return;
    }
  }

  if (reqPath === '/' || reqPath === '') {
    reqPath = '/src/client/index.html';
  }

  const filePath = path.join(rootDir, reqPath);

  // Security: prevent path traversal
  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found: ' + reqPath);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  ĐẢO ĐÈN LỒNG - 3D GAME SERVER CHẠY TẠI:`);
  console.log(`  👉 http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
