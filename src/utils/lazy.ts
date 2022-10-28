export class Lazy<T> {
  constructor(private builder: () => T | Promise<T>) {}

  private promise?: Promise<T>;

  public get(): Promise<T> {
    if (!this.promise) {
      try {
        const result = this.builder();
        this.promise =
          result instanceof Promise ? result : Promise.resolve(result);
      } catch (err) {
        this.promise = Promise.reject(err);
      }
    }
    return this.promise!;
  }
}
