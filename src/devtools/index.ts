import yargs from 'yargs';
// import shellCmd from './commands/shell';
import genCmd from './commands/gen';

export async function main(argv: string[]) {
  yargs(argv.slice(2))
    .usage('Usage: $0 <command> [options]')
    // .command(shellCmd)
    .command(genCmd)
    .demandCommand()
    .help('h')
    .alias('h', 'help').argv;
}
