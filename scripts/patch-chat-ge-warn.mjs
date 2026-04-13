import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, '..', 'app', 'aylopetai-chat', 'page.tsx');
let s = fs.readFileSync(p, 'utf8');
const needle = `    weightPlaceholder: '\u10d9\u10d2',\n  },\n  EN: {`;
const geWarn =
  `    weightPlaceholder: '\u10d9\u10d2',\n    supabaseWarn:\n      '\u10e8\u10d4\u10ec\u10d8\u10d2\u10d4\u10d1\u10d0: Supabase \u10d0\u10e0 \u10d0\u10e0\u10d8\u10e1 \u10d9\u10dd\u10dc\u10e4\u10d8\u10d2\u10e3\u10e0\u10d8\u10e0\u10dd\u10d1\u10e3\u10da\u10d8. \u10e8\u10d4\u10d0\u10db\u10dd\u10ec\u10db\u10dd\u10d7 .env.local (NEXT_PUBLIC_SUPABASE_URL \u10d3\u10d0 NEXT_PUBLIC_SUPABASE_ANON_KEY).',\n  },\n  EN: {`;
if (!s.includes(needle)) {
  console.error('needle not found');
  process.exit(1);
}
s = s.replace(needle, geWarn);
fs.writeFileSync(p, s, 'utf8');
console.log('patched GE supabaseWarn');
