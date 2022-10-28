import { Log, ezpbLog } from '../utils/log';
import { channel } from './buffered_channel';
import { ChannelReceiver } from './channel_interfaces';

/**
 * Trace an ChannelReceiver, printing each message to the console.
 */
export function trace<T>(
  receiver: ChannelReceiver<T>,
  log: Log = ezpbLog
): ChannelReceiver<T> {
  const [sender, newReceiver] = channel<T>();

  void (async () => {
    await receiver.opened();
    log.trace(`Trace: Channel opened.`);
    sender.open();

    for await (const res of receiver) {
      if (res.err) {
        log.trace('Trace: Channel failed:', res.err);
        return;
      }
      log.trace(`Trace:`, res.msg);
      sender.send(res.msg);
    }

    sender.close();
    log.trace(`Trace: Channel closed.`);
  })();

  return newReceiver;
}
