export interface ParsedArgs {
  command: string;
  subcommand: string;
  args: string[];
  flags: Record<string, boolean | string>;
}

/**
 * Parse CLI arguments into structured command, subcommand, args, and flags.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, boolean | string> = {};
  const positional: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      if (key === 'h') flags.help = true;
      else if (key === 'v') flags.version = true;
      else flags[key] = true;
    } else {
      positional.push(arg);
    }
  }

  return {
    command: positional[0] ?? '',
    subcommand: positional[1] ?? '',
    args: positional.slice(2),
    flags,
  };
}
