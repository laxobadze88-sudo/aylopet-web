/**
 * One-off patch helper (idempotent). Uses only \\u escapes for Georgian so the file stays valid UTF-8.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagePath = path.join(__dirname, '..', 'app', 'page.tsx');
let s = fs.readFileSync(pagePath, 'utf8');
const enMarker = '\n  EN: {';
const idx = s.indexOf(enMarker);
if (idx === -1) throw new Error('EN block not found');
const head = s.slice(0, idx);
const tail = s.slice(idx);
const needle = "      faq: 'FAQ',\n      ayloperChat:";
const pos = head.indexOf(needle);
if (pos === -1) throw new Error('GE faq/ayloperChat not found');
if (head.includes('projectStatus:')) {
  console.log('GE projectStatus already present');
  process.exit(0);
}
const insert =
  "      faq: 'FAQ',\n      projectStatus: '\u10de\u10e0\u10dd\u10d4\u10e5\u10e2\u10d8\u10e1 \u10e1\u10e2\u10d0\u10e2\u10e3\u10e1\u10d8',\n      ayloperChat:";
const newHead = head.slice(0, pos) + insert + head.slice(pos + needle.length);
fs.writeFileSync(pagePath, newHead + tail, 'utf8');
console.log('Inserted GE projectStatus');

const footPath = path.join(__dirname, '..', 'app', 'components', 'Footer.tsx');
let f = fs.readFileSync(footPath, 'utf8');
if (!f.includes('projectStatus:')) {
  const blogGe = '\u10d1\u10da\u10dd\u10d2\u10d8';
  const projectStatusGe =
    '\u10de\u10e0\u10dd\u10d4\u10e5\u10e2\u10d8\u10e1 \u10e1\u10e2\u10d0\u10e2\u10e3\u10e1\u10d8 / Project status';
  const n1 = `    blog: '${blogGe} / Blog',\n    privacy:`;
  const rep = `    blog: '${blogGe} / Blog',\n    projectStatus: '${projectStatusGe}',\n    privacy:`;
  if (!f.includes(n1)) throw new Error('Footer blog line not found');
  f = f.replace(n1, rep);
  f = f.replace(n1, rep);
  fs.writeFileSync(footPath, f, 'utf8');
  console.log('Inserted Footer projectStatus x2');
} else {
  console.log('Footer projectStatus keys ok');
}
