import { wsCodeToString } from '../utils/ws';
import {
  BiChannel,
  Channel,
  ChannelReceiver,
  ChannelReceiveResult,
  ChannelSender,
} from './channel_interfaces';
import { ChannelClosedError } from './errors';

/**
 * Creates and returns a BufferedChannel for both the sender and receiver
 * (they are the same underlying object in fact).
 */
export function channel<T>(): Channel<T> {
  const bufferedChannel = new BufferedChannel<T>();
  return [bufferedChannel, bufferedChannel];
}

/** Creates and returns two BufferedChannel in a cross configuration. */
export function biChannel<T1, T2 = T1>(): BiChannel<T1, T2> {
  const left = new BufferedChannel<T1>();
  const right = new BufferedChannel<T2>();
  return [
    [left, right],
    [right, left],
  ];
}

/**
 * Wraps messages in an err/msg union and created a channel from it. Channel
 * failures are sent over the port.
 */
export function channelFromPort<T1, T2 = T1>(
  port: MessagePort
): [ChannelSender<T1>, ChannelReceiver<T2>] {
  const [left, [sender, receiver]] = biChannel<T1, T2>();
  type PortMsg = { err?: any; msg?: any };

  port.onmessage = (ev) => {
    const msg = ev.data as PortMsg;
    if (msg.err) {
      sender.fail(msg.err);
    } else {
      sender.send(msg.msg);
    }
  };

  port.onmessageerror = (ev) => sender.fail(ev.data);

  (async () => {
    for await (const item of receiver) {
      if (item.err) {
        port.postMessage({ err: item.err } as PortMsg);
        port.close();
        break;
      } else {
        port.postMessage({ msg: item.msg } as PortMsg);
      }
    }
  })();

  return left;
}

export class BufferedChannel<T>
  implements ChannelSender<T>, ChannelReceiver<T> {
  public get isDone(): boolean {
    return this.buffer.length === 0 && this.isClosed;
  }

  private isClosed = false;
  private openedResolvers: (() => void)[] | null = null;
  private receiveResolver: (() => void) | null = null;
  private error: Error | null = null;
  private buffer: T[] = [];
  private isOpened = false;

  public opened(): Promise<void> {
    if (this.isOpened) {
      return Promise.resolve();
    }

    // Add ourselves to the opened resolvers.
    this.openedResolvers ??= [];
    return new Promise((res) => this.openedResolvers!.push(res));
  }

  public open(): void {
    if (this.isOpened) {
      return;
    }

    // Set opened first, then notify anyone waiting.
    this.isOpened = true;

    if (this.openedResolvers) {
      for (const waiting of this.openedResolvers) {
        waiting();
      }
      this.openedResolvers = null;
    }
  }

  public send(value: T): void {
    if (this.isClosed) {
      throw new ChannelClosedError(this.error);
    }

    // Make sure the channel was opened first
    this.open();

    // We always add it to the buffer, even if it's an overflow. This allows the
    // back-pressure API to be opt-in.
    this.buffer.push(value);

    // Notify the receiver, if any.
    this.receiveResolver?.();
  }

  public close(): void {
    // Close has no effect if the channel is already closed/failed, regardless
    // of if we are still flushing.
    if (this.isClosed) {
      return;
    }

    // Close the channel first.
    this.isClosed = true;

    // Make sure the channel was opened first
    this.open();

    // Ony then notify the receiver, if any.
    this.receiveResolver?.();
  }

  public sendAndClose(value: T): void {
    if (this.isClosed) {
      throw new ChannelClosedError(this.error);
    }

    // Close the channel first
    this.isClosed = true;

    // Enqueue the buffered item.
    this.buffer.push(value);

    // Logic is very much like send + close, but we combine notifying the
    // resolver into one call.
    this.open();

    // Only then notify the receiver, if any.
    this.receiveResolver?.();
  }

  public fail(error: Error): void {
    // Fail has no effect if the channel is already closed/failed, regardless
    // of if we are still flushing.
    if (this.isClosed) {
      return;
    }

    // Fail, flush, and close
    this.error = error;
    this.buffer.length = 0;
    this.close();
  }

  public tryReceiveNow(): ChannelReceiveResult<T> | null {
    if (this.buffer.length > 0) {
      const item = this.buffer.shift()!;

      return { msg: item };
    } else if (this.error) {
      return { err: this.error };
    }

    return null;
  }

  public async awaitPeekFirst(): Promise<ChannelReceiveResult<T> | null> {
    while (this.buffer.length === 0) {
      // If the channel has an error, throw it. If it's closed, return out.
      if (this.error) {
        return { err: this.error };
      } else if (this.isClosed) {
        return null;
      }

      await this.receiveReady();
    }

    return { msg: this.buffer[0] };
  }

  public async *[Symbol.asyncIterator](): AsyncIterator<
    ChannelReceiveResult<T>
  > {
    while (true) {
      // Check if there is an item to be yielded
      if (this.buffer.length > 0) {
        // Yield it
        yield { msg: this.buffer.shift()! };
      } else {
        // If the channel has an error, throw it. If it's closed, return out.
        if (this.error) {
          yield { err: this.error };
          return;
        } else if (this.isClosed) {
          return;
        }

        // There is no item to be yielded yet and we aren't flushing, so we are
        // just waiting on a producer to enqueue a value or to close/fail the
        // channel.
        await this.receiveReady();
      }
    }
  }

  private async receiveReady(): Promise<void> {
    if (this.receiveResolver) {
      throw new Error('concurrent calls to awaitPeekFirst/consume');
    }
    await new Promise<void>((res) => (this.receiveResolver = res));
    this.receiveResolver = null;
  }
}
