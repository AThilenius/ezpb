import { channel } from './buffered_channel';
import { ChannelReceiver } from './channel_interfaces';

/**
 * Maps each values in a channel to another value, returning a new channel
 * receiver with those values.
 */
export function map<TIn, TOut>(
  receiver: ChannelReceiver<TIn>,
  selector: (data: TIn) => TOut
): ChannelReceiver<TOut> {
  const [sender, outReceiver] = channel<TOut>();

  void (async () => {
    await receiver.opened();
    sender.open();

    for await (const res of receiver) {
      if (res.err) {
        return sender.fail(res.err);
      }

      try {
        sender.send(selector(res.msg));
      } catch (e: any) {
        sender.fail(new Error(e.toString()));
      }
    }

    sender.close();
  })();

  return outReceiver;
}
