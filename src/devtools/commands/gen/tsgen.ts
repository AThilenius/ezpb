import yargs from 'yargs';
import { makeDirRecursiveAndWriteFileSync } from '../../utils/file';
import { globPaths } from '../../utils/glob';
import { CommandModule } from '../../utils/cmd_helpers';
import { generateTypescript } from '../../compiler/typescript_generator';
import { format } from 'prettier';

const cmd: CommandModule<typeof builder> = {
  command: 'ts',
  describe: 'Generate TypeScript code',
  builder,
  handler,
};

export default cmd;

function builder(args: yargs.Argv) {
  return args
    .example(
      '$0 gen ts -o gen/proto_gen.ts -i protos/*',
      'compile protos/ to a typescript file'
    )
    .option('o', {
      alias: 'output',
      type: 'string',
      desc: 'Output file path to a single TS file.',
      requiresArg: true,
    })
    .option('i', {
      alias: 'input',
      type: 'array',
      desc: 'Input file path to a .proto (supports globs)',
      requiresArg: true,
    })
    .option('runtimeModule', {
      type: 'string',
      desc: 'The module used at runtime for resolve the generated types',
      default: '@wlabs/ezpb',
    })
    .option('any-type', {
      type: 'boolean',
      hidden: true,
    })
    .option('bootstrap', {
      type: 'boolean',
      hidden: true,
    });
}

type Args = ReturnType<typeof builder>['argv'];

async function handler(args: Args) {
  // Resolve glob expressions
  const files = globPaths(args.i as string[]);

  for (const file of files) {
    console.log(`Loading`, file);
  }

  const tsOut = await generateTypescript(
    files,
    args.runtimeModule,
    args.bootstrap || false,
    args['any-type'] || false
  );

  // Format the output with prettier
  const code = format(tsOut, {
    parser: 'typescript',
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
  });

  makeDirRecursiveAndWriteFileSync(args.o as string, code);
}
