export class ChannelClosedError extends Error {
  constructor(public readonly error: Error | null) {
    super(error ? `channel failed: ${error}` : 'channel closed');
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ChannelClosedError.prototype);
  }
}
