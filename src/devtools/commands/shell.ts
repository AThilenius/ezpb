// import * as os from 'os';
// import * as path from 'path';
// import * as repl from 'repl';
// import vm from 'vm';
// import yargs from 'yargs';
// import { ezpb, wlabs } from '../..';
// import { ezpbConfig } from '../../ezpb_config';
// import { Log, LogLevel } from '../../utils/log';
// import { CommandModule } from '../utils/cmd_helpers';
// import { globPaths } from '../utils/glob';
// import { RpcUtils } from '../utils/rpc_utils';

// const cmd: CommandModule<typeof builder> = {
//   command: 'shell',
//   describe: 'Start a ezpb shell',
//   builder,
//   handler,
// };

// export default cmd;

// function builder(args: yargs.Argv) {
//   return args
//     .example('$0 shell', 'starts a shell with the default protos loaded')
//     .example(
//       '$0 shell --include path/to/protos/*',
//       'Starts a shell and loads all proto files in path/to/protos/*'
//     )
//     .option('i', {
//       alias: 'include',
//       type: 'array',
//       desc: 'Input file path to a .proto (supports globs)',
//     })
//     .option('e', {
//       alias: 'eval',
//       type: 'string',
//       desc: 'A JS snippet to eval then terminate.',
//     });
// }

// type Args = ReturnType<typeof builder>['argv'];

// async function handler(args: Args) {
//   Log.level = LogLevel.WARN;

//   // TODO: make this configurable
//   const config: ezpbConfig = {
//     relay: {
//       url: 'ws://localhost:3035',
//     },
//     wrtc: {
//       iceServers: [
//         {
//           urls: 'stun:stun3.l.google.com',
//         },
//       ],
//     },
//   };

//   console.info('Booting...');
//   const ezpb = new ezpb(config);
//   const selfRef = await ezpb.nodes.self();

//   const nodeId = selfRef.nodeId;
//   console.info('Initialized as node ID ', nodeId);

//   // Trigger relay connection startup
//   console.info('Connecting to relay in background...');
//   const timeout = 5000;
//   void ezpb.reachable.whenEqual(true, timeout).then((success) => {
//     if (!success) {
//       console.warn(
//         `No response from relay for ${timeout}ms! We'll keep trying...`
//       );
//     }
//   });

//   // Setup RPC Utils
//   const rpcUtils = new RpcUtils(ezpb);
//   if (args.i) {
//     await rpcUtils.addProtoFiles(globPaths(args.i as string[]));
//   }

//   // Setup context object
//   const context = {
//     ezpb,
//     m: ezpb,
//     nodeId,
//     node: (nodeId: string) => ezpb.nodes.get(nodeId),
//     wlabs,
//     Log,
//     rpcUtils: new RpcUtils(ezpb),
//   };

//   if (args.e) {
//     const script = new vm.Script(args.e);
//     console.log(await script.runInContext(vm.createContext(context)));
//     process.exit();
//   } else {
//     console.info('Starting shell, pre-populated with:');
//     console.info(' `ezpb`: ezpb object (aliased as `m`)');
//     console.info(' `node(nodeId: string)`: ezpb.getNode');
//     console.info(' `wlabs`: wlabs code-gen namespace');
//     console.info(' `Log`: the wlabs logger');
//     console.info(' `rpcUtils`: An instance of RpcUtils');
//     const replServer = repl.start({
//       prompt: `(${nodeId})> `,
//       breakEvalOnSigint: true,
//     });
//     replServer.setupHistory(
//       path.join(os.homedir(), '.ezpb_shell_history'),
//       () => {}
//     );
//     Object.assign(replServer.context, context);
//   }
// }
