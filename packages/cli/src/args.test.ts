import { describe, it, expect } from 'vitest';
import { parseArgs } from './args.js';

describe('parseArgs', () => {
  it('returns empty command for empty argv', () => {
    const result = parseArgs([]);
    expect(result.command).toBe('');
    expect(result.subcommand).toBe('');
    expect(result.args).toEqual([]);
    expect(result.flags).toEqual({});
  });

  it('parses a single command', () => {
    const result = parseArgs(['build']);
    expect(result.command).toBe('build');
    expect(result.subcommand).toBe('');
    expect(result.args).toEqual([]);
  });

  it('parses command with subcommand', () => {
    const result = parseArgs(['generate', 'component']);
    expect(result.command).toBe('generate');
    expect(result.subcommand).toBe('component');
    expect(result.args).toEqual([]);
  });

  it('parses command with subcommand and positional args', () => {
    const result = parseArgs(['generate', 'component', 'date-picker']);
    expect(result.command).toBe('generate');
    expect(result.subcommand).toBe('component');
    expect(result.args).toEqual(['date-picker']);
  });

  it('parses multiple positional args after subcommand', () => {
    const result = parseArgs(['generate', 'component', 'date-picker', 'extra']);
    expect(result.args).toEqual(['date-picker', 'extra']);
  });

  it('parses long flag --help as boolean true', () => {
    const result = parseArgs(['--help']);
    expect(result.flags.help).toBe(true);
  });

  it('parses long flag --version as boolean true', () => {
    const result = parseArgs(['--version']);
    expect(result.flags.version).toBe(true);
  });

  it('parses short flag -h as help', () => {
    const result = parseArgs(['-h']);
    expect(result.flags.help).toBe(true);
  });

  it('parses short flag -v as version', () => {
    const result = parseArgs(['-v']);
    expect(result.flags.version).toBe(true);
  });

  it('parses an unknown short flag as boolean true', () => {
    const result = parseArgs(['-x']);
    expect(result.flags.x).toBe(true);
  });

  it('parses long flag with value (--output foo)', () => {
    const result = parseArgs(['--output', 'foo']);
    expect(result.flags.output).toBe('foo');
  });

  it('treats flag value starting with dash as separate boolean flag', () => {
    const result = parseArgs(['--force', '--verbose']);
    expect(result.flags.force).toBe(true);
    expect(result.flags.verbose).toBe(true);
  });

  it('handles combined positional args and flags', () => {
    const result = parseArgs(['build', 'forms', '--force', '--output', 'dist']);
    expect(result.command).toBe('build');
    expect(result.subcommand).toBe('forms');
    expect(result.flags.force).toBe(true);
    expect(result.flags.output).toBe('dist');
  });

  it('treats value after long flag as the flag value, not a positional', () => {
    // --verbose followed by 'test' means verbose='test' (not a boolean flag)
    // because 'test' does not start with '-'
    const result = parseArgs(['--verbose', 'test', '--unit']);
    expect(result.flags.verbose).toBe('test');
    expect(result.command).toBe('');
    expect(result.flags.unit).toBe(true);
  });

  it('parses --dry-run flag correctly', () => {
    const result = parseArgs(['release', 'patch', '--dry-run']);
    expect(result.command).toBe('release');
    expect(result.subcommand).toBe('patch');
    expect(result.flags['dry-run']).toBe(true);
  });
});
