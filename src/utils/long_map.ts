import Long from 'long';

const KEY_RADIX = 36;

export class LongMap<V> {
  private readonly map = new Map<string, [Long, V]>();

  public [Symbol.iterator](): IterableIterator<[Long, V]> {
    return this.map.values();
  }

  public get(key: Long | number): V | undefined {
    const item = this.map.get(key.toString(KEY_RADIX));
    if (item) {
      return item[1];
    }
    return undefined;
  }

  public set(key: Long | number, value: V) {
    if (!(key instanceof Long)) {
      key = Long.fromNumber(key);
    }
    this.map.set(key.toString(KEY_RADIX), [key, value]);
  }

  public delete(key: Long | number): boolean {
    return this.map.delete(key.toString(KEY_RADIX));
  }

  public clear() {
    this.map.clear();
  }
}
