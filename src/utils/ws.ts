import { biChannel } from '../channels/buffered_channel';

export function wsCodeToString(event: CloseEvent) {
  const codeMessages: { [code: string]: string } = {
    '1000': 'Normal Closure',
    '1001': 'Going Away',
    '1002': 'Protocol Error',
    '1003': 'Unsupported Data',
    '1004': '(For future)',
    '1005': 'No Status Received',
    '1006': 'Abnormal Closure',
    '1007': 'Invalid frame payload data',
    '1008': 'Policy Violation',
    '1009': 'Message too big',
    '1010': 'Missing Extension',
    '1011': 'Internal Error',
    '1012': 'Service Restart',
    '1013': 'Try Again Later',
    '1014': 'Bad Gateway',
    '1015': 'TLS Handshake',
  };

  return codeMessages[event.code] || `Code: ${event.code}`;
}

export function channelFromWebsocket(ws: WebSocket) {
  const [[sender, receiver], right] = biChannel<Uint8Array>();

  ws.onopen = (_ev) => {
    sender.open();
  };

  ws.onmessage = (ev) => {
    const data = ev.data;
    sender.send(data);
  };

  ws.onclose = (event) => {
    if (event.code != 1000) {
      sender.fail(new Error('WebSocket error: ' + wsCodeToString(event)));
    } else {
      // Code: 'Normal closure'
      sender.close();
    }
  };

  ws.onerror = (_ev) => {
    sender.fail(new Error('Websocket failure'));
  };

  (async () => {
    for await (const item of receiver) {
      if (item.err) {
        ws.close(1011);
        return;
      }

      ws.send(item.msg);
    }

    // When the stream ends, close the Websocket as well.
    ws.close();
  })();

  return right;
}
