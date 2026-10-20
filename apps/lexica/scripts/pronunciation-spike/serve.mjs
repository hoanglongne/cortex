// Serves bench.html, onnx/ and node_modules/ with the headers multi-threaded WASM needs.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = process.argv[2];
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/bench.html';
  const f = path.join(root, p);
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  const type = f.endsWith('.html') ? 'text/html' : f.endsWith('.js') || f.endsWith('.mjs') ? 'text/javascript' : f.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream';
  res.writeHead(200, { 'content-type': type, 'cross-origin-opener-policy': 'same-origin', 'cross-origin-embedder-policy': 'require-corp' });
  fs.createReadStream(f).pipe(res);
}).listen(3200);
