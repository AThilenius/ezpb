import WebSocket from 'ws';
import { Server } from 'http';

export default async (httpServer: Server) => {
  const websocketServer = new WebSocket.Server({
    noServer: true,
    path: '/ws-pb',
  });

  httpServer.on('upgrade', (request, socket, head) => {
    websocketServer.handleUpgrade(request, socket, head, (ws) => {
      // websocketServer.emit('connection', websocket, request);

      const url = new URL(request?.url);
      console.log(url);

      ws.on('message', (message) => {
        console.log(message);

        ws.send(
          JSON.stringify({ message: 'There be gold in them thar hills.' })
        );
      });
    });
  });

  return websocketServer;
};
