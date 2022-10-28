export async function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export class Timer {
  private constructor(private startTime: number) {}

  public static startNew(): Timer {
    return new Timer(performanceNow());
  }

  public get(): number {
    return performanceNow() - this.startTime;
  }

  public getAndReset(): number {
    const now = performanceNow();
    const delta = now - this.startTime;
    this.startTime = now;
    return delta;
  }

  public reset(): void {
    this.startTime = performanceNow();
  }

  public clone(): Timer {
    return new Timer(this.startTime);
  }
}

export function performanceNow(): number {
  if (typeof window !== 'undefined' && window.performance) {
    return performance.now();
  } else if (typeof process !== 'undefined' && process.hrtime) {
    const [seconds, nanos] = process.hrtime();
    return seconds * 1000 + nanos / 1_000_000;
  } else {
    return new Date().getTime();
  }
}
