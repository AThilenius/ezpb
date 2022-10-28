import { sleep } from './time';

export class TimeoutError extends Error {
  constructor(message?: string) {
    super(message);
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Simply rejects a promise after `ms` milliseconds.
 */
export async function timeout(ms: number, timeoutReason?: any): Promise<never> {
  await sleep(ms);
  throw timeoutReason ?? new TimeoutError();
}

export async function timeoutRace<T>(
  promise: Promise<T>,
  ms: number,
  timeoutReason?: any
): Promise<T> {
  return Promise.race([promise, timeout(ms, timeoutReason)]);
}
