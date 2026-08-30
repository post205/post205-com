// Build an encrypted payload for the /w/lib/ workshop library.
//
//   node tools/build-lib.mjs <cohort> "<passphrase>" [srcDir] [outDir]
//   node tools/build-lib.mjs oct26 "asul na bangka"
//     -> w/lib/lib.oct26.enc.json
//
// srcDir/outDir default to tools/lib-src and w/lib. They exist so the test
// harness can build against a throwaway directory without touching real pages.
//
// Reads tools/lib-src/_manifest.json for page order, concatenates each page with
// its slug marker, and encrypts the whole thing under a cohort-specific key.
//
// One passphrase per cohort: the same content is encrypted again for each run of
// the workshop, so a leaked passphrase burns one cohort rather than the library.
//
// The passphrase is NEVER committed. Only the ciphertext is.
//
// Deliberately separate from tools/encrypt-deck.mjs: that one is shared with
// /in/mapping, whose page does not normalise, so adding normalisation there
// would silently break it the next time that deck is rebuilt.
import { webcrypto as crypto } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// CONTRACT with w/lib/index.html and tools/test-lib-roundtrip.mjs.
const DELIM = '\n<!--PAGE-->\n';

// CONTRACT with w/lib/index.html: the page normalises the typed passphrase the
// same way, so capitalisation and spacing never keep a paying attendee out.
const normalise = (s) => s.toLowerCase().replace(/\s+/g, '');

const [, , cohort, passphrase, srcArg, outArg] = process.argv;
const SRC = srcArg ? join(ROOT, srcArg) : join(ROOT, 'tools', 'lib-src');
const OUT = outArg ? join(ROOT, outArg) : join(ROOT, 'w', 'lib');
if (!cohort || !passphrase) {
  console.error('usage: node tools/build-lib.mjs <cohort> "<passphrase>"');
  console.error('   eg: node tools/build-lib.mjs oct26 "asul na bangka"');
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(cohort)) {
  console.error(`cohort must be lowercase letters, digits and hyphens; got "${cohort}"`);
  process.exit(1);
}

const manifestPath = join(SRC, '_manifest.json');
if (!existsSync(manifestPath)) {
  console.error(`missing ${manifestPath}`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (!Array.isArray(manifest.pages) || !manifest.pages.length) {
  console.error('_manifest.json must have a non-empty "pages" array of slugs');
  process.exit(1);
}

const chunks = [];
for (const slug of manifest.pages) {
  const f = join(SRC, `${slug}.html`);
  if (!existsSync(f)) {
    console.error(`missing page source: ${f}`);
    process.exit(1);
  }
  const html = readFileSync(f, 'utf8').trim();
  if (html.includes(DELIM.trim())) {
    console.error(`${slug}.html contains the page delimiter; it would split wrongly`);
    process.exit(1);
  }
  chunks.push(`<!--SLUG:${slug}-->\n${html}`);
}

const plaintext = new TextEncoder().encode(chunks.join(DELIM));
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));

const base = await crypto.subtle.importKey(
  'raw', new TextEncoder().encode(normalise(passphrase)), 'PBKDF2', false, ['deriveKey']
);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' },
  base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
);
const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

const b64 = (u8) => Buffer.from(u8).toString('base64');
const out = join(OUT, `lib.${cohort}.enc.json`);
writeFileSync(out, JSON.stringify({
  v: 1, cohort, salt: b64(salt), iv: b64(iv), ct: b64(new Uint8Array(ct)),
}));

console.log(`built ${manifest.pages.length} pages -> w/lib/lib.${cohort}.enc.json`);
console.log(`open with: /w/lib/?c=${cohort}`);
