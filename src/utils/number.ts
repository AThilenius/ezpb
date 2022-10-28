import Long from 'long';

export function isZero(number: number | Long): boolean {
  return number instanceof Long ? number.isZero() : number === 0;
}

export function gt(number: number | Long, other: number): boolean {
  return number instanceof Long ? number.gt(other) : number > other;
}

export function lt(number: number | Long, other: number): boolean {
  return number instanceof Long ? number.lt(other) : number < other;
}

export function toNumber(number: number | Long): number {
  return number instanceof Long ? number.toNumber() : number;
}

export function toLong(number: number | Long, unsigned: boolean): Long {
  return number instanceof Long ? number : Long.fromNumber(number, unsigned);
}
