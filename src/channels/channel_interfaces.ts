export type ChannelReceiveResult<T> =
  | { msg: T; err?: undefined }
  | { msg?: undefined; err: Error };

export interface ChannelSender<T> {
  /**
   * Opens the channel. This is implicitly called at the start of `send`,
   * `close` and `fail` as well, but can be called explicitly without having to
   * write the channel.
   */
  open(): void;

  /**
   * Sends data over the channel (buffering if the reader is busy).
   */
  send(value: T): void;

  /**
   * Flushes the channel before notifying the consumer that the channel is
   * closed (notification comes in the form of the async iterator returning).
   * Further calls to e.g. `send` will throw a ChannelClosedError.
   */
  close(): void;

  /**
   * A combination of `send` and `close`, but in one atomic operations. This is
   * useful for queuing a message and immediately closing it, so that the events
   * can be combined on the receiving end by checking `isDone` while consuming
   * messages.
   */
  sendAndClose(value: T): void;

  /**
   * Behaves exactly like close, except throws an error in the consumer once the
   * channel is flushed.
   */
  fail(error: Error): void;
}

export interface ChannelReceiver<T> {
  /**
   * Set to true just before the last value is returned from the channel, if the
   * channel was closed. This is useful for determining if the value yielded
   * while iterating a channel is the last value the channel will ever send.
   */
  isDone: boolean;

  /** Returns a promise that resolves once the channel has been opened. */
  opened(): Promise<void>;

  /**
   * Attempts to receive a single item from the channel immediately, returning
   * None if there is no waiting data in the buffer. Important note: this will
   * remove a pending value from the buffer immediately, meaning if the receiver
   * has already been `consume`d, but is still busy processing a previous value,
   * this call can 'steal' a value from the consume. It's unlikely you want to
   * mix `consume` and `tryReceiveNow` together.
   */
  tryReceiveNow(): ChannelReceiveResult<T> | null;

  /**
   * Awaits the first message in the stream and returns it without removing it
   * from the stream. This is useful for peaking at the first message to switch
   * on exchange type or something similar. None is returns if the stream was
   * closed before anything was sent over it.
   */
  awaitPeekFirst(): Promise<ChannelReceiveResult<T> | null>;

  /**
   * Consumes the channel receiver (the other read methods can't be used any
   * more) and provides an async iterator over the channel. This iterator
   * returns once the channel is closed without error (it throws if the channel
   * is failed).
   *
   * ```typescript
   * try {
   *   // Iterate through each value one at a time, asynchronously
   *   for await (const value of receiver) {
   *     // Do something with `value` here.
   *   }

   *   // Once execution gets to here, the channel has been closed.
   * } catch (e) {
   *   // You can wrap consuming of the channel in a try-catch to handle `fail`
   *   // being called on the channel.
   * }
   * ```
   * */
  [Symbol.asyncIterator](): AsyncIterator<ChannelReceiveResult<T>>;

  /** See ChannelSender.fail. */
  fail: ChannelSender<T>['fail'];
}

export type Channel<T> = [ChannelSender<T>, ChannelReceiver<T>];
export type BiChannel<T1, T2 = T1> = [
  [ChannelSender<T1>, ChannelReceiver<T2>],
  [ChannelSender<T2>, ChannelReceiver<T1>]
];
