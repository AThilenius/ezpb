import { __asyncValues } from 'tslib';
import { none, Optional, some } from './optional';

export class AsyncValue<T> {
  public value: Optional<T> = none();

  private promise: Promise<void>;
  private resolver: (() => void) | null = null;

  constructor() {
    this.promise = new Promise((res) => (this.resolver = res));
  }

  public static resolve<T>(value: T): AsyncValue<T> {
    const asv = new AsyncValue<T>();
    asv.set(some(value));
    return asv;
  }

  public async get(): Promise<T> {
    await this.promise;
    return this.value.unwrap('AsyncValue promise resolved without a value');
  }

  public set(value: Optional<T>) {
    if (value.type === 'some') {
      this.value = value;
      this.resolver?.();
      this.resolver = null;
    } else if (this.value.type === 'some') {
      this.promise = new Promise((res) => (this.resolver = res));
      this.value = none();
    }
  }
}
