import { performanceNow, Timer } from './time';
import { getUrlSearchStringParam } from './url';

export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5,
  ALL = 6,
}

/**
 * A simple logging wrapper. Each instance of `Log` represents a 'namespace'
 * like `@wlabs/ezpb`. Calling `child` on that instance will create a
 * nested namespace, like `transport`. All logs go to the same place.
 *
 * There are 5 log levels, ERROR, WARN, INFO, DEBUG and TRACE as well as 2
 * pseudo-levels for convenience, ALL and NONE.
 *
 * The log level can be set by adding the URL parameter log=[log-level] where
 * [log-level] is any of the above levels including the pseudo-levels. On node
 * the level can instead be with with the LOG environment variable.
 *
 * The `Log` class is exposed directly on `window` for browser. Meaning in the
 * Chrome/Firefox console you can use static methods directly, like `Log.dump`
 * and `Log.inspect`.
 */
export class Log {
  public static level: LogLevel = LogLevel.INFO;

  private static timer = Timer.startNew();
  private static sourceCache = {};
  private static logHistory: LogEntry[] = [];
  private static paused = false;

  constructor(public readonly namespace: string) {
    Log.setLogLevelFromUrlOrEnv();
  }

  public child(childNamespaces: string): Log {
    return new Log(this.namespace + ':' + childNamespaces);
  }

  public error(...args: any[]) {
    void this.logAtLevel(LogLevel.ERROR, args);
  }

  public warn(...args: any[]) {
    void this.logAtLevel(LogLevel.WARN, args);
  }

  public info(...args: any[]) {
    void this.logAtLevel(LogLevel.INFO, args);
  }

  public debug(...args: any[]) {
    void this.logAtLevel(LogLevel.DEBUG, args);
  }

  public trace(...args: any[]) {
    void this.logAtLevel(LogLevel.TRACE, args);
  }

  public assert(condition: boolean, ...messageArgs: any[]) {
    if (!condition) {
      this.warn('Assertion failed:', ...messageArgs);
    }
  }

  public static dump(from?: number, to?: number) {
    from ??= 0;
    to ??= Log.logHistory.length;

    console.clear();

    for (let i = from; i < to; i++) {
      Log.prettyPrintLogEntry(Log.logHistory[i], false);
    }
  }

  public static inspect(id: number) {
    if (id < 0 || id >= Log.logHistory.length) {
      console.warn('No log entry with id', id);
    }

    const logEntry = Log.logHistory[id];
    console.log(`%cLog Entry ${logEntry.id} Begins`, 'background: lightgrey');
    console.log(...logEntry.args);
    console.log(`%cEntry Metadata`, 'background: lightblue');
    console.log(`  Severity: ${LogLevel[logEntry.level]}`);
    console.log(`  Namespace: ${logEntry.namespace}`);
    console.log(`  Timestamp: ${logEntry.timestamp.toLocaleString()} local`);
    console.log(`  Delta Time: ${logEntry.dt}ms`);
    console.log(`  Entry follows:`);
    console.log(`%cLog Entry Ends`, 'background: lightgrey');
  }

  /**
   * Pauses logging to console. This is useful if the console is being spammed
   * but you're trying to look through old logs. The logs will still be recoded
   * and can later be dumped by simply calling `dump()` with no arguments.
   */
  public static pause() {
    Log.paused = true;
  }

  /**
   * Resumes logging to the console. This does nothing is `pause` wasn't called
   * beforehand.
   */
  public static resume() {
    Log.paused = false;
  }

  private async logAtLevel(level: LogLevel, args: any[]) {
    const timestamp = new Date();
    const now = performanceNow();

    const logEntry: LogEntry = {
      id: Log.logHistory.length,
      level,
      namespace: this.namespace,
      args,
      dt: Log.timer.getAndReset(),
      timestamp,
    };

    Log.logHistory.push(logEntry);

    if (!Log.paused && level <= Log.level) {
      try {
        Log.prettyPrintLogEntry(logEntry, false);
      } catch (err) {
        // Try our best to log the logging error...
        try {
          console.error('Error in Log.prettyPrintLogEntry:', err);
          console.error('...caused by trying to log:', logEntry);
        } catch (_err) {
          // Don't be part of the problem...
        }
      }
    }
  }

  private static prettyPrintLogEntry(logEntry: LogEntry, verbose: boolean) {
    let log = console.log;
    if (logEntry.level === LogLevel.WARN) {
      log = console.warn;
    } else if (logEntry.level === LogLevel.ERROR) {
      log = console.error;
    }

    log(
      `${logEntry.id} [${logEntry.namespace}]: `,
      ...logEntry.args,
      ` (+${logEntry.dt.toFixed(1)}ms)`
    );
  }

  private static setLogLevelFromUrlOrEnv(): void {
    const useLogLevelStr = (levelStr: string): boolean => {
      const logLevel = (<any>LogLevel)[levelStr.toUpperCase()];
      if (logLevel) {
        Log.level = logLevel;
        return true;
      } else {
        console.warn('Unknown log level:', levelStr);
        return false;
      }
    };

    // Try to get it from the window URL query string
    const queryParam = getUrlSearchStringParam('log');
    if (queryParam && useLogLevelStr(queryParam)) {
      return;
    }

    // Try to get it from the (node js) process env.
    if (
      typeof process !== 'undefined' &&
      process.env?.LOG &&
      useLogLevelStr(process.env?.LOG)
    ) {
      return;
    }
  }
}

if (typeof window !== 'undefined') {
  (window as any).Log = Log;
}

interface LogEntry {
  args: any[];
  dt: number;
  id: number;
  level: LogLevel;
  namespace: string;
  timestamp: Date;
}

export const ezpbLog = new Log('@wlabs/ezpb');

const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};
