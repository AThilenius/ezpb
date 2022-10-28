// eslint-disable-next-line @typescript-eslint/no-var-requires
const TextEncoder = globalThis.TextEncoder ?? require('util').TextEncoder;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TextDecoder = globalThis.TextDecoder ?? require('util').TextDecoder;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function trimStr(
  str: string,
  strToRemove: string,
  repeated = false
): string {
  return trimStrLeft(
    trimStrRight(str, strToRemove, repeated),
    strToRemove,
    repeated
  );
}

export function trimStrLeft(
  str: string,
  strToRemove: string,
  repeated = false
): string {
  let trimmed = str;
  while (trimmed.startsWith(strToRemove)) {
    trimmed = trimmed.slice(strToRemove.length);
    if (!repeated) {
      break;
    }
  }
  return trimmed;
}

export function trimStrRight(
  str: string,
  strToRemove: string,
  repeated = false
): string {
  let trimmed = str;
  while (trimmed.endsWith(strToRemove)) {
    trimmed = trimmed.slice(0, trimmed.length - strToRemove.length);
    if (!repeated) {
      break;
    }
  }
  return trimmed;
}

export function toCamelCase(str: string) {
  // Replace the character after - or _ with uppercase version.
  str = str.replace(/([-_]\w)/g, (g) => g[1].toUpperCase());

  // Replace the first character with a lowercase.
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function toUpperCamelCase(str: string) {
  // Replace the character after - or _ with uppercase version.
  str = str.replace(/([-_]\w)/g, (g) => g[1].toUpperCase());

  // Replace the first character with a uppercase.
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function sanitizeProtoFullName(protoFullName: string): string {
  // Replace the leading `.`
  return protoFullName.replace(/^\.+/, '');
}

export function stringToBytes(str: string): Uint8Array {
  return encoder.encode(str);
}

export function bytesToString(arr: Uint8Array): string {
  return decoder.decode(arr);
}

export function ensureBytes(data: string | Uint8Array): Uint8Array {
  if (typeof data === 'string') {
    data = stringToBytes(data);
  }
  return data;
}

export function randomString(
  len = 8,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let name = '';

  for (let i = 0; i < len; i++) {
    name += characters[Math.floor(Math.random() * characters.length)];
  }

  return name;
}

export function toHex(data: Uint8Array): string {
  return [...data].map((x) => x.toString(16).padStart(2, '0')).join('');
}
