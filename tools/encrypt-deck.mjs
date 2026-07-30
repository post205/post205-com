// Encrypt an internal deck's slide markup for the /in/ passphrase gate.
//
//   node tools/encrypt-deck.mjs "the passphrase" tools/mapping-slides.html > in/mapping/deck.enc.json
//
// The passphrase is never committed: it lives in the team chat / 1Password.
// Only the ciphertext JSON this prints is committed. The page derives the
// AES-GCM key from the passphrase at runtime (same PBKDF2 parameters).
import { webcrypto as crypto } from 'node:crypto';
import { readFileSync } from 'node:fs';

const [, , passphrase, file] = process.argv;
if (!passphrase || !file) {
  console.error('usage: node tools/encrypt-deck.mjs "<passphrase>" <slides.html>');
  process.exit(1);
}

const plaintext = new TextEncoder().encode(readFileSync(file, 'utf8'));
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv   = crypto.getRandomValues(new Uint8Array(12));

const base = await crypto.subtle.importKey(
  'raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']
);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' },
  base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
);
const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

const b64 = (u8) => Buffer.from(u8).toString('base64');
console.log(JSON.stringify({
  v: 1,
  salt: b64(salt),
  iv: b64(iv),
  ct: b64(new Uint8Array(ct))
}));
