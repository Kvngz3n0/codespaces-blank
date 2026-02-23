const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  console.log('Testing /api/scrape with engine=python');
  const r1 = await post('/api/scrape', { url: 'https://example.com', engine: 'python' });
  console.log(JSON.stringify(r1, null, 2));

  console.log('\nTesting /api/crawl with engine=python');
  const r2 = await post('/api/crawl', { url: 'https://example.com', maxDepth:1, maxPages:2, engine: 'python' });
  console.log(JSON.stringify(r2, null, 2));
})();
