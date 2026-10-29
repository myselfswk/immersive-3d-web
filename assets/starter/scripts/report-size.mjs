// Usage: npm run build && npm run report
// Prints raw + gzip + brotli sizes of everything in dist/ and checks them against budgets.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { gzipSync, brotliCompressSync } from 'node:zlib';

const DIST = process.argv[2] || 'dist';
const BUDGET_JS_GZ_KB = 250;       // total JS, gzip
const BUDGET_FIRST_LOAD_KB = 1500; // all files except models/textures lazily loaded

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const rows = walk(DIST).map((p) => {
  const buf = readFileSync(p);
  const ext = extname(p);
  const compressible = ['.js', '.css', '.html', '.svg', '.json', '.glsl'].includes(ext);
  return {
    file: p.replace(DIST + '/', ''),
    raw: buf.length,
    gz: compressible ? gzipSync(buf, { level: 9 }).length : buf.length,
    br: compressible ? brotliCompressSync(buf).length : buf.length,
    ext,
  };
}).sort((a, b) => b.gz - a.gz);

const kb = (n) => (n / 1024).toFixed(1).padStart(8) + ' KB';
console.log('file'.padEnd(46), 'raw'.padStart(11), 'gzip'.padStart(11), 'brotli'.padStart(11));
rows.forEach((r) => console.log(r.file.slice(0, 45).padEnd(46), kb(r.raw), kb(r.gz), kb(r.br)));

const jsGz = rows.filter((r) => r.ext === '.js').reduce((a, r) => a + r.gz, 0) / 1024;
const heavy = rows.filter((r) => ['.glb', '.ktx2', '.hdr', '.exr', '.wasm'].includes(r.ext));
const firstLoad = rows.filter((r) => !heavy.includes(r)).reduce((a, r) => a + r.gz, 0) / 1024;

console.log('\nJS gzip total:        ', jsGz.toFixed(1), 'KB  (budget', BUDGET_JS_GZ_KB, 'KB)', jsGz <= BUDGET_JS_GZ_KB ? 'PASS' : 'WARN');
console.log('Non-model first load: ', firstLoad.toFixed(1), 'KB  (budget', BUDGET_FIRST_LOAD_KB, 'KB)', firstLoad <= BUDGET_FIRST_LOAD_KB ? 'PASS' : 'WARN');
heavy.forEach((r) => console.log('Heavy asset:', r.file, (r.raw / 1024 / 1024).toFixed(2), 'MB', r.raw > 3 * 1024 * 1024 ? 'WARN >3MB' : 'ok'));
