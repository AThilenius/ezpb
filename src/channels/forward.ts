import { ChannelReceiver, ChannelSender } from './channel_interfaces';

// Forwards a receiver onto a sender.
export function forward<TData>(
  receiver: ChannelReceiver<TData>,
  sender: ChannelSender<TData>
): void {
  void (async () => {
    await receiver.opened();
    for await (const res of receiver) {
      if (res.err) {
        return sender.fail(res.err);
      }

      sender.send(res.msg);
    }
    sender.close();
  })();
}
