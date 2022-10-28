import yargs from 'yargs';
import { makeDirRecursiveAndWriteFileSync } from '../../utils/file';
import { globPaths } from '../../utils/glob';
import { CommandModule } from '../../utils/cmd_helpers';
import { generateTypescript } from '../../compiler/typescript_generator';
import ts from 'typescript';
import { format } from 'prettier';

const cmd: CommandModule<typeof builder> = {
  command: 'js',
  describe: 'Generate JavaScript code',
  builder,
  handler,
};

export default cmd;

function builder(args: yargs.Argv) {
  return args
    .example(
      '$0 gen js -o gen/proto_gen.js -i protos/*',
      'compile protos/ to a javascript file'
    )
    .example(
      '$0 gen js -m commonjs -o gen/proto_gen.js -i protos/*',
      'same as the above, but using a CommonJS module'
    )
    .option('o', {
      alias: 'output',
      type: 'string',
      desc: 'Output file path to a single JS file.',
      requiresArg: true,
    })
    .option('i', {
      alias: 'input',
      type: 'array',
      desc: 'Input file path to a .proto (supports globs)',
      requiresArg: true,
    })
    .option('m', {
      alias: 'module',
      choices: [
        'commonjs',
        'amd',
        'umd',
        'system',
        'es2015',
        'es2020',
        'esnext',
      ],
      default: 'esnext',
      desc: 'The module output type for the TSC-compiled JS',
    })
    .option('runtimeModule', {
      type: 'string',
      desc: 'The module used at runtime for resolve the generated types',
      default: '@wlabs/ezpb',
    });
}

type Args = ReturnType<typeof builder>['argv'];

async function handler(args: Args) {
  // Resolve glob expressions
  const files = globPaths(args.i as string[]);

  for (const file of files) {
    console.log(`Loading`, file);
  }

  // Start by generating unformatted Typescript.
  const tsOut = await generateTypescript(
    files,
    args.runtimeModule,
    false,
    false
  );

  const tscResults = ts.transpileModule(tsOut, {
    compilerOptions: { module: getModuleType(args) },
  });

  // Format the output with prettier
  const code = format(tscResults.outputText, {
    parser: 'babel',
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
  });

  makeDirRecursiveAndWriteFileSync(args.o as string, code);
}

function getModuleType(args: Args): ts.ModuleKind {
  switch (args.m) {
    case 'commonjs':
      return ts.ModuleKind.CommonJS;
    case 'amd':
      return ts.ModuleKind.AMD;
    case 'umd':
      return ts.ModuleKind.UMD;
    case 'system':
      return ts.ModuleKind.System;
    case 'es2015':
      return ts.ModuleKind.ES2015;
    case 'es2020':
      return ts.ModuleKind.ES2020;
    case 'esnext':
      return ts.ModuleKind.ESNext;
    default:
      return ts.ModuleKind.ESNext;
  }
}
