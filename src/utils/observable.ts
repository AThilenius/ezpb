import { OptionalFinalizationRegistry } from './finalization';
import { TimeoutError, timeoutRace } from './timeout';

type Handler<T> = (value: T) => void;

type Pred<T> = (value: T) => boolean;

type Unsubscribe = () => void;

/// An Observable provides an interface to a changing value.
export class Observable<T> {
  private value?: T;

  private started = false;
  private inited = false;

  private handlers = new Map<unknown, Handler<T>>();

  constructor(private executor: (update: Handler<T>) => T, lazy = false) {
    if (!lazy) {
      this.ensureStarted();
    }
  }

  get isObserved() {
    return this.handlers.size !== 0;
  }

  protected update = (value: T) => {
    if (value === this.value) {
      return;
    }
    this.value = value;
    this.inited = true;

    for (const handler of this.handlers.values()) {
      handler(value);
    }
  };

  private ensureStarted() {
    if (!this.started) {
      this.started = true;
      const initialValue = this.executor(this.update);
      // If `start` called `update`, don't override that value.
      if (!this.inited) {
        this.value = initialValue;
      }
    }
  }

  /// Return the current observed value.
  public get(): T {
    this.ensureStarted();
    return this.value!;
  }

  /// Subscribe to value updates. The given handler will be called for every
  /// observed value update. A function is returned which can be called to
  /// cancel the subscription.
  public subscribe(handler: Handler<T>): Unsubscribe {
    this.ensureStarted();
    const key = {};
    this.handlers.set(key, handler);
    return () => this.handlers.delete(key);
  }

  /// Subscribe to value updates just like `subscribe`, but also call the
  /// handler immediately with the current observed value.
  public observe(handler: Handler<T>): Unsubscribe {
    const cancel = this.subscribe(handler);
    handler(this.get());
    return cancel;
  }

  /// Returns a promise that will resolve when the observed value meets the
  /// given condition, with the value that met the condition. If timeoutMs is
  /// given and elapses before the condition is met, the promise is rejected
  /// with a TimeoutError.
  public async when(cond: Pred<T>, timeoutMs?: number): Promise<T> {
    const value = this.get();
    if (cond(value)) {
      return value;
    }
    const whenPromise = new Promise<T>((resolve, reject) => {
      const cancel = this.subscribe((value: T) => {
        try {
          if (cond(value)) {
            cancel();
            resolve(value);
          }
        } catch (e) {
          cancel();
          reject(e);
        }
      });
    });
    if (timeoutMs) {
      return timeoutRace(whenPromise, timeoutMs);
    } else {
      return whenPromise;
    }
  }

  public async whenEqual(value: T, timeoutMs?: number): Promise<boolean> {
    try {
      await this.when((v) => v === value, timeoutMs);
      return true;
    } catch (err) {
      if (err instanceof TimeoutError) {
        return false;
      } else {
        throw err;
      }
    }
  }
}

export class ObservableValue<T> extends Observable<T> {
  constructor(initialValue: T) {
    super(() => initialValue);
  }

  /// Sets the observed value.
  public set(value: T) {
    this.update(value);
  }
}

const subscriptionFinalizer = new OptionalFinalizationRegistry(
  (cancel: Unsubscribe) => cancel()
);

/// Returns an Observable that will wait to be observed, then call the given
/// async function to build an Observable which will be proxied to the returned
/// Observable. Observable.
export function lazyObservable<T>(
  initialValue: () => T,
  builder: (initialValue: T) => Promise<Observable<T>>
): Observable<T> {
  const outer = new Observable<T>((update) => {
    const value = initialValue();
    void (async () => {
      const inner = await builder(value);
      const cancel = inner.observe(update);
      subscriptionFinalizer.register(outer, cancel);
    })();
    return value;
  }, true);
  return outer;
}

type MapToObservables<T> = { [K in keyof T]: Observable<T[K]> };

/// Takes an array of Observables and a function to reduce an array of their
/// values to a single value. Returns an Observable of that reduced type.
export function reduceObservables<T extends unknown[], U>(
  observables: MapToObservables<T>,
  reduce: (values: T) => U
): Observable<U> {
  const outer = new Observable<U>((update) => {
    // Get initial values
    const values = observables.map((o) => o.get()) as T;
    // Set up subscriptions
    const cancels = observables.map((observable, idx) =>
      observable.subscribe((value) => {
        values[idx] = value;
        update(reduce(values));
      })
    );
    subscriptionFinalizer.register(outer, () => {
      cancels.forEach((cancel) => cancel());
    });
    // Calculate initial reduced value
    return reduce(values);
  }, true);
  return outer;
}

/// Takes one or more Observable(s) and a function to transform their value(s) to
/// another type. Returns an Observable of that other type which will be updated
/// whenever any of the input Observables are updated.
export function mapObservable<T extends unknown[], U>(
  ...args: [...MapToObservables<T>, (...values: T) => U]
): Observable<U> {
  const observables = args.slice(0, -1) as MapToObservables<T>;
  const reduce = args[args.length - 1] as (...values: T) => U;
  return reduceObservables(observables, (values: T) => reduce(...values));
}
