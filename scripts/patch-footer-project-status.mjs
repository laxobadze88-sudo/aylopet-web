import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, '..', 'app', 'components', 'Footer.tsx');
let s = fs.readFileSync(p, 'utf8');
if (s.includes('projectStatus:')) {
  console.log('Footer already has projectStatus');
  process.exit(0);
}
const faqLine =
  "    faq: 'FAQ / \u10ee\u10e8\u10d8\u10e0\u10d0\u10d3 \u10d3\u10d0\u10e1\u10db\u10e3\u10da\u10d8 \u10d9\u10d8\u10d7\u10ee\u10d5\u10d4\u10d1\u10d8',\n    myProfile:";
const insert = `    faq: 'FAQ / \u10ee\u10e8\u10d8\u10e0\u10d0\u10d3 \u10d3\u10d0\u10e1\u10db\u10e3\u10da\u10d8 \u10d9\u10d8\u10d7\u10ee\u10d5\u10d4\u10d1\u10d8',
    projectStatus: '\u10de\u10e0\u10dd\u10d4\u10e5\u10e2\u10d8\u10e1 \u10e1\u10e2\u10d0\u10e2\u10e3\u10e1\u10d8 / Project status',
    myProfile:`;
if (!s.includes(faqLine)) {
  console.error('Expected faq/myProfile block not found');
  process.exit(1);
}
s = s.split(faqLine).join(insert);
fs.writeFileSync(p, s, 'utf8');
console.log('Footer patched');
