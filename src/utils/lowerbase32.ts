// RFC 4648, no padding, lowercased
const CHARS = 'abcdefghijklmnopqrstuvwxyz234567';

export function bytesToLowerBase32(bytes: Uint8Array): string {
  const len = bytes.length;
  if (len === 0) {
    return '';
  }

  let ch = 0;
  let out = '';
  for (let i = 0; i < len; i++) {
    ch = (bytes[i] >> 3) & 0b11111;
    out += CHARS[ch];

    ch = (bytes[i] << 2) & 0b11100;
    ch |= bytes[i + 1] >> 6;
    out += CHARS[ch];

    i++;
    if (i >= len) break;

    ch = (bytes[i] >> 1) & 0b11111;
    out += CHARS[ch];

    ch = (bytes[i] << 4) & 0b10000;
    ch |= bytes[i + 1] >> 4;
    out += CHARS[ch];

    i++;
    if (i >= len) break;

    ch = (bytes[i] << 1) & 0b11110;
    ch |= bytes[i + 1] >> 7;
    out += CHARS[ch];

    i++;
    if (i >= len) break;

    ch = (bytes[i] >> 2) & 0b11111;
    out += CHARS[ch];

    ch = (bytes[i] << 3) & 0b11000;
    ch |= bytes[i + 1] >> 5;
    out += CHARS[ch];

    i++;
    if (i >= len) break;

    ch = bytes[i] & 0b11111;
    out += CHARS[ch];
  }
  return out;
}
