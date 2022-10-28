import { channel } from './buffered_channel';
import { ChannelReceiver } from './channel_interfaces';

/**
 * Consumes a channel, running the predicate function against each message and
 * forwarding only those that get a truthy value from the predicate for.
 */
export function filter<T>(
  receiver: ChannelReceiver<T>,
  predicate: (data: T) => boolean
): ChannelReceiver<T> {
  const [sender, outReceiver] = channel<T>();

  void (async () => {
    await receiver.opened();
    sender.open();

    for await (const res of receiver) {
      if (res.err) {
        return sender.fail(res.err);
      }

      if (predicate(res.msg)) {
        sender.send(res.msg);
      }
    }

    sender.close();
  })();

  return outReceiver;
}
