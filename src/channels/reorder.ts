import Long from 'long';
import { channel } from './buffered_channel';
import { ChannelReceiver } from './channel_interfaces';

/**
 * Takes in an unordered stream of data and returns an ordered stream of data,
 * buffering out-of-order packets until the next monotonically increasing packet
 * number is received. Note that keys MUST start at 0, and must increase one at
 * a time. The finalPacketSelector is used to denote the final packet in the
 * unordered input channel (but not necessarily the final packet sent over that
 * channel, because it's unordered). The output stream will be closed once all
 * packets up to and including the final packet are dispatched.
 */
export function reorder<T>(
  receiver: ChannelReceiver<T>,
  keySelector: (packet: T) => Long,
  finalPacketSelector: (packet: T) => boolean
): ChannelReceiver<T> {
  const [sender, outReceiver] = channel<T>();
  const buffer = new Map<string, T>();
  let nextKey = new Long(0);
  let finalKey: string | undefined;

  void (async () => {
    for await (const res of receiver) {
      if (res.err) {
        sender.fail(res.err);
        return;
      }

      const key = keySelector(res.msg);
      if (!finalKey && finalPacketSelector(res.msg)) {
        finalKey = nextKey.toString();
      }

      // Buffer the value.
      buffer.set(key.toString(), res.msg);

      // Then try to dispatch as many in-order items as we can.
      let nextKeyStr = nextKey.toString();
      let nextPacket = buffer.get(nextKeyStr);
      while (nextPacket !== undefined) {
        sender.send(nextPacket);

        // If this was the final packet, then we have caught up and can close
        // the output channel.
        if (finalKey === nextKey.toString()) {
          sender.close();
          return;
        }

        // Increment
        nextKey = nextKey.add(1);
        nextKeyStr = nextKey.toString();
        nextPacket = buffer.get(nextKeyStr);
      }
    }
  })();

  return outReceiver;
}
