import { channel } from './buffered_channel';
import { ChannelReceiver } from './channel_interfaces';
import { forward } from './forward';

// Turns a Promise<ChannelReceiver> into a ChannelReceiver.
export function promisedReceiver<T>(
  promise: Promise<ChannelReceiver<T>>
): ChannelReceiver<T> {
  const [sender, receiver] = channel<T>();
  void promise.then(
    (promised) => {
      forward(promised, sender);
    },
    (err) => {
      sender.fail(err);
    }
  );
  return receiver;
}
