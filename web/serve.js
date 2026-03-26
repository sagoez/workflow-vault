const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3000;
const webDir = __dirname;
const rootDir = path.join(__dirname, '..');
let clients = [];

// Initial build
rebuild();

// HTTP server
const server = http.createServer((req, res) => {
  // SSE endpoint for live reload
  if (req.url === '/__reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write('data: connected\n\n');
    clients.push(res);
    req.on('close', () => {
      clients = clients.filter(c => c !== res);
    });
    return;
  }

  // Serve static files from site/
  let filePath = path.join(webDir, 'site', req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
  };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    // Inject reload script into HTML
    let content = data;
    if (ext === '.html') {
      const reloadScript = `<script>
new EventSource('/__reload').onmessage = (e) => {
  if (e.data === 'reload') location.reload();
};
</script>`;
      content = data.toString().replace('</body>', reloadScript + '</body>');
    }

    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`\n  Workflow Vault dev server\n`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Watching *.yaml and web/build.js for changes...\n`);
});

// Watch YAML files in root dir
let debounce = null;
function onFileChange(filename) {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    console.log(`  Changed: ${filename} — rebuilding...`);
    if (rebuild()) {
      clients.forEach(c => c.write('data: reload\n\n'));
      console.log(`  Reloaded ${clients.length} client(s)`);
    }
  }, 100);
}

const yamlWatcher = fs.watch(rootDir, { recursive: false }, (event, filename) => {
  if (!filename) return;
  if (filename.endsWith('.yaml')) onFileChange(filename);
});

// Watch build.js itself
const buildWatcher = fs.watch(path.join(webDir, 'build.js'), () => {
  onFileChange('build.js');
});

function rebuild() {
  try {
    execSync('node build.js', { cwd: webDir, stdio: 'pipe' });
    return true;
  } catch (e) {
    console.error(`  Build error: ${e.stderr?.toString() || e.message}`);
    return false;
  }
}

process.on('SIGINT', () => {
  yamlWatcher.close();
  buildWatcher.close();
  server.close();
  process.exit();
});
