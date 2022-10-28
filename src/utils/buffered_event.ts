import { AsyncValue } from './async_value';
import { some } from './optional';

export class BufferedEvent<T> {
  private buffer: T[] = [];
  private handlers: ((e: T) => void)[] = [];

  public addHandler(handler: (e: T) => void) {
    if (this.handlers.length === 0) {
      // If we are the first handler, add the handler and dispatch all events
      // now.
      this.handlers.push(handler);
      for (const e of this.buffer) {
        handler(e);
      }
      this.buffer = [];
      return;
    }

    // Otherwise just add the handler.
    this.handlers.push(handler);
  }

  public removeHandler(handler: (e: T) => void) {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  public dispatchEvent(e: T): void {
    if (this.handlers.length > 0) {
      for (const handler of this.handlers) {
        handler(e);
      }
    } else {
      this.buffer.push(e);
    }
  }

  public async awaitEvent(predicate?: (e: T) => boolean): Promise<T> {
    const value = new AsyncValue<T>();
    const handler = (e: T) => {
      if (!predicate || predicate(e)) {
        this.removeHandler(handler);
        value.set(some(e));
      }
    };

    this.addHandler(handler);
    return value.get();
  }
}
