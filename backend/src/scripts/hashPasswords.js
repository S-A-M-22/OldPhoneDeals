// File: backend/src/scripts/hashPasswords.js

import 'dotenv/config';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath }           from 'url';
import { dirname, join }           from 'path';
import { hash }                    from 'bcrypt';

// Shim __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

(async function() {
  const inPath       = join(__dirname, '../../data/userlist.json');
  const outPath      = join(__dirname, '../../data/userlist-hashed.json');
  const defaultPwd   = 'OldPhoneDeals123!';
  const saltRounds   = 10;

  console.log('🔒  Hashing all passwords…');
  const hashed       = await hash(defaultPwd, saltRounds);

  const users        = JSON.parse(readFileSync(inPath, 'utf-8'));
  users.forEach(u => { u.password = hashed; });

  writeFileSync(outPath, JSON.stringify(users, null, 2));
  console.log(`✅  Wrote hashed users to ${outPath}`);
})().catch(err => {
  console.error('❌  Hashing failed:', err);
  process.exit(1);
});
