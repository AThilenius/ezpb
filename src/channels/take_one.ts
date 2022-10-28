import { ChannelReceiver } from './channel_interfaces';

/**
 * Consumes an ChannelReceiver and returns the first item in the channel as a
 * promise.
 */
export async function takeOne<T>(receiver: ChannelReceiver<T>): Promise<T> {
  for await (const { msg, err } of receiver) {
    if (err) {
      throw err;
    }
    return msg!;
  }
  throw new Error('Failed to take one from channel');
}
