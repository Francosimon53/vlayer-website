import { createHash } from 'node:crypto';

/** Fingerprints a CI token; this is not password storage. */
// vlayer-ignore CRED-001 -- SHA-256 is required for a one-way token fingerprint, never used for passwords.
export function tokenHash(token: string): string {
  // vlayer-ignore CRED-001 -- SHA-256 is required for a one-way token fingerprint, never used for passwords.
  return createHash('sha256').update(token, 'utf8').digest('hex');
}
