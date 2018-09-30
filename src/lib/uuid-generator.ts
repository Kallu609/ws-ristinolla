import * as crypto from 'crypto';

export function generateUUID(): string {
  return ((1e7).toString() + -1e3 + -4e3 + -8e3 + -1e11)
    .replace(/[018]/g, c => {
      const n = parseInt(c);
      return (n ^ (crypto.randomBytes(1)[0] & (15 >> (n / 4)))).toString(16);
    })
    .slice(4, 18);
}
