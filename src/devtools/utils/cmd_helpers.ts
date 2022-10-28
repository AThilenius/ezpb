import yargs from 'yargs';

// Helper to infer argument types from builder function
export type CommandModule<TBuilder> = TBuilder extends yargs.CommandBuilder<
  infer T,
  infer U
>
  ? yargs.CommandModule<T, U>
  : never;
