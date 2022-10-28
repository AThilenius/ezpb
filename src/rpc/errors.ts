import { TransportMessage } from '../transport';
import { wlabs } from '../gen/proto_gen';
import { trimStrLeft } from '../utils/string';

type MsgHeader = wlabs.ezpb.transport.MsgHeader;
type Status = wlabs.ezpb.transport.Status;

// From google.rpc.code.Code
export enum Code {
  Ok = 0,
  Cancelled = 1,
  Unknown = 2,
  InvalidArgument = 3,
  DeadlineExceeded = 4,
  NotFound = 5,
  AlreadyExists = 6,
  PermissionDenied = 7,
  ResourceExhausted = 8,
  FailedPrecondition = 9,
  Aborted = 10,
  OutOfRange = 11,
  Unimplemented = 12,
  Internal = 13,
  Unavailable = 14,
  DataLoss = 15,
  Unauthenticated = 16,
}

export class StatusError extends Error {
  constructor(public readonly code: Code, message?: string) {
    super(message);
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, StatusError.prototype);
  }

  public toString(): string {
    let str = Code[this.code] || this.code.toString();
    if (this.message) {
      str = `[${str}]: ${this.message}`;
    }
    return `StatusError: ${str}`;
  }

  public static fromStatus(status?: Status): StatusError | undefined {
    if (!status?.code) {
      return undefined;
    }
    return new StatusError(status.code, status.message);
  }

  public static fromMessage(msg: TransportMessage): StatusError | undefined {
    return this.fromStatus(msg.header.error);
  }
}

export function isErrorMessage(
  msg: TransportMessage
): msg is { header: { error: Status } } {
  return !!msg.header.error?.code;
}

/**
 * Construct an error TransportMessage from the given Error and optional
 * details.
 */
export function errorMessage(
  error: Error,
  header?: Partial<MsgHeader>
): TransportMessage {
  return {
    header: {
      ...header,
      error: errorStatus(error),
      noPayload: true,
    } as MsgHeader,
  };
}

/**
 * Construct an error Status from the given Error and Code.
 */
export function errorStatus(error: Error): Status {
  if (error instanceof StatusError) {
    return { code: error.code, message: error.message };
  }
  return {
    code: Code.Internal,
    message: trimStrLeft(error.toString(), 'Error: '),
  };
}
