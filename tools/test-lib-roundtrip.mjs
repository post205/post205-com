// Round-trip test for the /w/lib/ concept-library payload.
//
//   node tools/test-lib-roundtrip.mjs
//
// Encrypts a multi-page payload with tools/encrypt-deck.mjs, then decrypts it the
// way the browser will (same PBKDF2 params, same AES-GCM) and asserts that every
// page survives, that the delimiter split is clean, that unicode is intact, and
// that a wrong passphrase THROWS rather than returning garbage.
//
// The wrong-key assertion is the important one: the gate's whole security model is
// that AES-GCM authenticates, so a bad passphrase cannot silently yield plausible
// plaintext.
import { webcrypto as crypto } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert';

const DELIM = '\n<!--PAGE-->\n';
const PASS = 'test-passphrase-not-the-real-one';

// The delimiter and slug marker are a CONTRACT between this builder and the
// inline router in w/lib/index.html, which cannot import from here. A test that
// writes and splits with the same constant is self-consistent and proves nothing,
// so pin both to literals and cross-check the page below (assertion 8).
assert.strictEqual(DELIM, '\n<!--PAGE-->\n', 'DELIM is a contract with w/lib/index.html');
assert.strictEqual(
  String(/^<!--SLUG:([a-z0-9-]+)-->\n?/),
  '/^<!--SLUG:([a-z0-9-]+)-->\\n?/',
  'slug marker format is a contract with w/lib/index.html'
);

const pages = [
  { slug: 'alpha', html: '<h1>Alpha</h1><p>Cash &amp; inventory — em dash, ampersand.</p>' },
  { slug: 'beta', html: '<h1>Beta</h1><p>Unicode: ₱1,241,476 · 66.58% · “curly quotes”</p>' },
  { slug: 'the-seam', html: '<h1>The seam</h1><p class="c-ours">Two constraints, not one.</p>' },
];

const dir = mkdtempSync(join(tmpdir(), 'libtest-'));
const src = join(dir, 'payload.html');
writeFileSync(src, pages.map((p) => `<!--SLUG:${p.slug}-->\n${p.html}`).join(DELIM), 'utf8');

const out = execFileSync('node', ['tools/encrypt-deck.mjs', PASS, src], { encoding: 'utf8' });
const { v, salt, iv, ct } = JSON.parse(out);
assert.strictEqual(v, 1, 'payload version must be 1');

const b = (s) => Uint8Array.from(Buffer.from(s, 'base64'));

async function deriveKey(pass) {
  const base = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b(salt), iterations: 250000, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
}

const plain = new TextDecoder().decode(
  await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b(iv) }, await deriveKey(PASS), b(ct))
);

// 1. The payload splits into exactly the pages we put in.
const parts = plain.split(DELIM);
assert.strictEqual(parts.length, pages.length, `payload must split into ${pages.length} pages`);

// 2. Every slug marker survives and parses with the router's regex.
const SLUG_RE = /^<!--SLUG:([a-z0-9-]+)-->\n?/;
const slugs = parts.map((chunk) => {
  const m = chunk.match(SLUG_RE);
  assert.ok(m, `every chunk must carry a slug marker; got: ${chunk.slice(0, 40)}`);
  return m[1];
});
assert.deepStrictEqual(slugs, pages.map((p) => p.slug), 'slugs must round-trip in order');

// 3. A hyphenated slug parses (the router regex must allow '-').
assert.ok(slugs.includes('the-seam'), 'hyphenated slugs must parse');

// 4. Unicode and entities survive.
assert.ok(parts[1].includes('₱1,241,476 · 66.58%'), 'unicode must survive the round trip');
assert.ok(parts[1].includes('“curly quotes”'), 'curly quotes must survive');
assert.ok(parts[0].includes('&amp;'), 'html entities must not be mangled');

// 5. Stripping the marker leaves exactly the original page html.
assert.strictEqual(
  parts[2].replace(SLUG_RE, ''), pages[2].html,
  'page html must be byte-identical after marker strip'
);

// 6. A wrong passphrase must THROW, not return garbage.
await assert.rejects(
  crypto.subtle.decrypt({ name: 'AES-GCM', iv: b(iv) }, await deriveKey('wrong'), b(ct)),
  'wrong passphrase must throw'
);

// 7. The ciphertext must not leak plaintext.
assert.ok(!ct.includes('Alpha'), 'ciphertext must not contain plaintext');

// 8. The page's inline router must use the SAME delimiter and slug marker.
// This is the assertion that mutation-testing showed was missing: without it,
// the builder and the browser can drift apart and every test still passes.
const PAGE = 'w/lib/index.html';
if (existsSync(PAGE)) {
  const page = readFileSync(PAGE, 'utf8');
  assert.ok(
    page.includes("'\\n<!--PAGE-->\\n'") || page.includes('"\\n<!--PAGE-->\\n"'),
    `${PAGE} must use the same DELIM literal as this builder`
  );
  assert.ok(
    page.includes('<!--SLUG:'), `${PAGE} must parse the same slug marker`
  );
  // The normalise() implementations MUST match character for character. If the
  // builder and the page disagree, every payload becomes unopenable and the only
  // symptom is "wrong passphrase" for a passphrase that is correct.
  const NORM = 's.toLowerCase().replace(/\\s+/g, \'\')';
  const builder = readFileSync('tools/build-lib.mjs', 'utf8');
  assert.ok(builder.includes(NORM), 'tools/build-lib.mjs must normalise as ' + NORM);
  assert.ok(page.includes(NORM), `${PAGE} must normalise identically to the builder`);
  console.log(`  cross-checked DELIM, slug marker and normalise() against ${PAGE}`);
} else {
  console.log(`  NOTE: ${PAGE} does not exist yet — contract cross-check SKIPPED`);
}

console.log('OK: round-trip, delimiter split, slug parse, unicode, byte-identity, wrong-key rejection');
