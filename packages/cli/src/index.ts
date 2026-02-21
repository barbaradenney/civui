#!/usr/bin/env node

import { parseArgs } from './args.js';
import { generate } from './commands/generate.js';
import { build } from './commands/build.js';
import { test } from './commands/test.js';
import { validate } from './commands/validate.js';
import { release } from './commands/release.js';
import { health } from './commands/health.js';

const HELP = `
civds — CivDS Developer CLI

Usage:
  civds <command> [options]

Commands:
  generate component <name>    Scaffold a new component
  build [tokens|forms|all]     Build packages
  test [--unit|--integration]  Run tests
  validate [--a11y]            Lint + typecheck + test
  release patch|minor|major    Release workflow
  health                       Health dashboard

Options:
  --help, -h     Show help
  --version, -v  Show version

Examples:
  civds generate component date-range-picker
  civds build forms
  civds test --unit
  civds validate --a11y
  civds release patch
  civds health
`;

async function main(): Promise<void> {
  const { command, subcommand, args, flags } = parseArgs(process.argv.slice(2));

  if (flags.version) {
    console.log('0.1.0');
    return;
  }

  if (flags.help || !command) {
    console.log(HELP);
    return;
  }

  try {
    switch (command) {
      case 'generate':
        await generate(subcommand, args, flags);
        break;
      case 'build':
        await build(subcommand, flags);
        break;
      case 'test':
        await test(flags);
        break;
      case 'validate':
        await validate(flags);
        break;
      case 'release':
        await release(subcommand, flags);
        break;
      case 'health':
        await health();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.log(HELP);
        process.exit(1);
    }
  } catch (err) {
    console.error(`\nError: ${(err as Error).message}`);
    process.exit(1);
  }
}

main();
