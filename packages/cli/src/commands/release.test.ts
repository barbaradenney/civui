import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock node:fs
vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

// Mock utils to avoid real filesystem/exec calls
vi.mock('../utils.js', () => ({
  findRoot: vi.fn(() => '/mock/root'),
  run: vi.fn(),
  header: vi.fn(),
  success: vi.fn(),
}));

import { release } from './release.js';
import { readFileSync, writeFileSync } from 'node:fs';
import { run } from '../utils.js';

const mockReadFileSync = vi.mocked(readFileSync);
const mockWriteFileSync = vi.mocked(writeFileSync);
const mockRun = vi.mocked(run);

describe('release', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Default: root package.json returns version 1.2.3
    mockReadFileSync.mockReturnValue(JSON.stringify({ version: '1.2.3' }));
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('throws on invalid bump type', async () => {
    await expect(release('hotfix', {})).rejects.toThrow(
      'Release type must be: patch, minor, or major',
    );
  });

  it('throws on empty bump type', async () => {
    await expect(release('', {})).rejects.toThrow(
      'Release type must be: patch, minor, or major',
    );
  });

  it('computes patch bump correctly in dry run', async () => {
    await release('patch', { 'dry-run': true });
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('1.2.4');
  });

  it('computes minor bump correctly in dry run', async () => {
    await release('minor', { 'dry-run': true });
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('1.3.0');
  });

  it('computes major bump correctly in dry run', async () => {
    await release('major', { 'dry-run': true });
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('2.0.0');
  });

  it('dry run does not write files or run commands', async () => {
    await release('patch', { 'dry-run': true });
    expect(mockWriteFileSync).not.toHaveBeenCalled();
    expect(mockRun).not.toHaveBeenCalled();
  });

  it('dry run prints the steps that would be taken', async () => {
    await release('patch', { 'dry-run': true });
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[DRY RUN]');
    expect(output).toContain('Bump all packages to 1.2.4');
  });

  it('non-dry-run calls run() for validation, build, and git', async () => {
    await release('patch', {});
    // Should have called run for: tsc, vitest, turbo build, git add, git commit, git tag
    expect(mockRun).toHaveBeenCalled();
    const commands = mockRun.mock.calls.map((c) => c[0]);
    expect(commands.some((cmd) => cmd.includes('vitest'))).toBe(true);
    expect(commands.some((cmd) => cmd.includes('turbo build'))).toBe(true);
    expect(commands.some((cmd) => cmd.includes('git commit'))).toBe(true);
    expect(commands.some((cmd) => cmd.includes('git tag'))).toBe(true);
  });

  it('non-dry-run writes updated versions to package files', async () => {
    await release('patch', {});
    // Should write root + 5 workspace packages = 6 writes
    expect(mockWriteFileSync).toHaveBeenCalled();
    const writtenContents = mockWriteFileSync.mock.calls.map((c) =>
      JSON.parse(c[1] as string),
    );
    // All written packages should have the new version
    for (const pkg of writtenContents) {
      expect(pkg.version).toBe('1.2.4');
    }
  });
});
