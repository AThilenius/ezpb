export class None<T> {
  public type: 'none' = 'none';

  public unwrap(errorMsg?: string): T {
    throw new Error(errorMsg || 'unwrap was called on a None value');
  }

  public valueOrNull(): T | null {
    return null;
  }
}

export class Some<T> {
  public type: 'some' = 'some';

  constructor(public readonly value: T) {}

  public unwrap(): T {
    return this.value;
  }

  public valueOrNull(): T | null {
    return this.value;
  }
}

export type Optional<T> = None<T> | Some<T>;

export function some<T>(val: T): Optional<T> {
  return new Some(val);
}

export function none<T>(): Optional<T> {
  return new None<T>();
}
