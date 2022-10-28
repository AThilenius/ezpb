import yargs from 'yargs';
import { CommandModule } from '../../utils/cmd_helpers';
import jsGenCmd from './jsgen';
import tsGenCmd from './tsgen';

const cmd: CommandModule<typeof builder> = {
  command: 'gen',
  describe: 'Generate code from proto definitions',
  builder,
  handler,
};

export default cmd;

function builder(args: yargs.Argv) {
  return args.command(jsGenCmd).command(tsGenCmd).demandCommand();
}

type Args = ReturnType<typeof builder>['argv'];

async function handler(_args: Args) {}
