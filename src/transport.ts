import protobuf from 'protobufjs';
import { channel } from './channels/buffered_channel';
import { Channel } from './channels/channel_interfaces';
import { forward } from './channels/forward';
import { map } from './channels/map';
import { wlabs } from './gen/proto_gen';
import { protoRoot } from './rpc/proto_registry';
import { ezpbLog, Log } from './utils/log';
import { trimStrLeft } from './utils/string';
import { channelFromWebsocket } from './utils/ws';

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

export interface TransportMessage {
  header: Partial<MsgHeader>;
  payload?: Uint8Array;
}

const msgHeaderType = protoRoot.lookupType('wlabs.ezpb.transport.MsgHeader');

export class Transport {
  public ioChannel: Channel<TransportMessage>;

  private log: Log;

  public constructor(websocket: WebSocket) {
    this.log = ezpbLog.child(`transport[${websocket.url}]`);

    // Wrap the WebSocket in a channel of Uint8Array.
    const [binSender, binReceiver] = channelFromWebsocket(websocket);

    // Use channel mapping and forwarding to handle both encoding and decoding
    // the proto header and payload to/from a Uin8Array.
    const msgReceiver = map(binReceiver, (bin) =>
      this.decodePrefixedEzpbMsg(bin)
    );

    const [msgSender, msgReceiverForBin] = channel<TransportMessage>();
    forward(
      map(msgReceiverForBin, (msg) => this.encodePrefixedEzpbMsg(msg)),
      binSender
    );

    this.ioChannel = [msgSender, msgReceiver];
  }

  /**
   * Decodes a standard MsgHeader prefixed data blob, into a TransportMessage.
   */
  protected decodePrefixedEzpbMsg(data: Uint8Array): TransportMessage {
    const reader = new protobuf.Reader(data);
    const header = msgHeaderType.toObject(
      msgHeaderType.decodeDelimited(reader),
      { defaults: true }
    ) as MsgHeader;
    const msg: TransportMessage = { header };
    if (!header.noPayload) {
      msg.payload = data.subarray(reader.pos, data.length);
    }
    this.traceMessage(msg, false);
    return msg;
  }

  /**
   * Encodes a standard TransportMessage into a byte array.
   */
  protected encodePrefixedEzpbMsg(msg: TransportMessage): Uint8Array {
    this.traceMessage(msg, true);
    let data = msgHeaderType.encodeDelimited(msg.header).finish();
    if (!msg.header.noPayload && msg.payload) {
      const dataWithPayload = new Uint8Array(data.length + msg.payload.length);
      dataWithPayload.set(data, 0);
      dataWithPayload.set(msg.payload, data.length);
      data = dataWithPayload;
    }
    return data;
  }

  private traceMessage(msg: TransportMessage, sending: boolean) {
    const dir = sending ? 'S' : 'R';
    const type = msg.header.exchangeType ? ` T/${msg.header.exchangeType}` : '';
    const len = msg.payload?.length || 0;
    const hasError = msg.header.error && msg.header.error.code;
    const err = hasError
      ? ` E/${msg.header.error!.code}/: ${msg.header.error?.message}`
      : '';
    const full = `-> ${dir} ${len}b ${type}${err}`;
    this.log.trace(full);
  }
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
  err: any,
  header?: Partial<MsgHeader>
): TransportMessage {
  if (!(err instanceof Error)) {
    err = new Error(`<${err}>`);
  }
  return {
    header: {
      ...header,
      error: errorStatus(err),
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
