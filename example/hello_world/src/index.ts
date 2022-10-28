import { Host, HostContext } from '@wlabs/ezpb';
import express from 'express';
import { hello_world } from './proto_gen';
import http from 'http';

interface Context extends HostContext {
  userId?: number;
}

async function main(args: string[]) {
  const app = express();
  const server = http.createServer(app);

  const host = Host.create<Context>({
    server,
    path: '/ezpb',
    middleware: [
      // Authz middleware
      async (callCtx) => {
        const jwt = callCtx.headers['authorization'];
        const roles = callCtx.methodInfo.reflectionObject.getOption('roles');
        const jwtRolesInRolesArray = false;
        if (!jwtRolesInRolesArray) {
          // Fail just this call...
          callCtx.channel[0].sendAndClose({
            header: { error: { code: 401, message: 'Unauthorized' } },
          });

          // Or maybe more drastically...
          callCtx.websocket.close(401, 'Unauthorized');

          // Don't continue.
          return false;
        }

        return true;
      },
    ],
  });

  hello_world.HelloService.registerHandler(host, {
    hello: (req, ctx) => ({ body: `Hello, ${req.body}` }),
  });

  // console.info('Connecting to relay...');
  // if (!(await maglev.reachable.whenEqual(true, 5000))) {
  //   console.error('Connection timed out!');
  //   return;
  // }

  // if (args[0]) {
  //   await runClient(maglev.nodes.get(args[0]));
  // } else {
  //   await runServer(maglev);
  // }
}

async function runClient(serverNodeRef: NodeRef) {
  console.info('Connecting to server...');
  if (!(await serverNodeRef.connect(5000))) {
    console.error('Connection timed out!');
    return;
  }
  const client = hello_world.HelloService.createClient(serverNodeRef);
  console.info('Sending Hello...');
  const res = await client.hello({ body: 'Hello server!' });
  console.info('Got response:', res.body);
}

async function runServer(maglev: Maglev) {
  hello_world.HelloService.registerHandler(maglev, {
    hello: (req) => {
      console.info('Got request:', req.body);
      return { body: 'Hello client!' };
    },
  });
  console.info('Server running!');
  await new Promise(() => {}); // Wait forever
}

main(process.argv.slice(2)).then(() => process.exit());
