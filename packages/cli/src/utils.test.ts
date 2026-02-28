import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toPascalCase, header, success, fail, findRoot } from './utils.js';

describe('toPascalCase', () => {
  it('converts a single word', () => {
    expect(toPascalCase('button')).toBe('Button');
  });

  it('converts a multi-word kebab-case name', () => {
    expect(toPascalCase('date-range-picker')).toBe('DateRangePicker');
  });

  it('converts a two-word kebab-case name', () => {
    expect(toPascalCase('text-input')).toBe('TextInput');
  });

  it('handles already single-char segments', () => {
    expect(toPascalCase('a-b-c')).toBe('ABC');
  });
});

describe('header', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('prints a decorated header with the title', () => {
    header('Test Section');
    expect(logSpy).toHaveBeenCalledTimes(3);
    // First call: separator line
    expect(logSpy.mock.calls[0][0]).toContain('='.repeat(50));
    // Second call: the title
    expect(logSpy.mock.calls[1][0]).toContain('Test Section');
    // Third call: separator line
    expect(logSpy.mock.calls[2][0]).toContain('='.repeat(50));
  });
});

describe('success', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('prints a message with [OK] prefix', () => {
    success('All tests passed');
    expect(logSpy).toHaveBeenCalledWith('  [OK] All tests passed');
  });
});

describe('fail', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('prints a message with [FAIL] prefix to stderr', () => {
    fail('Lint failed');
    expect(errorSpy).toHaveBeenCalledWith('  [FAIL] Lint failed');
  });
});

describe('findRoot', () => {
  const originalCwd = process.cwd;

  afterEach(() => {
    process.cwd = originalCwd;
  });

  it('throws when no pnpm-workspace.yaml is found', () => {
    // Point cwd to a temp directory that definitely has no pnpm-workspace.yaml
    // anywhere in its ancestor chain. /tmp is safe for this.
    process.cwd = () => '/tmp';
    expect(() => findRoot()).toThrow('Could not find CivUI monorepo root');
  });

  it('returns the directory containing pnpm-workspace.yaml', () => {
    // findRoot starts from process.cwd() and walks up.
    // Since we are running in the actual monorepo, it should find the real root.
    const root = findRoot();
    expect(root).toBeTruthy();
    expect(typeof root).toBe('string');
  });
});
