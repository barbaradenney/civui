import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ValidationIssue } from './validate-content.js';

// --- Shared mock fns that survive resetModules ---
const mockReaddirSync = vi.fn<(...args: any[]) => any>();
const mockStatSync = vi.fn<(...args: any[]) => any>();
const mockReadFileSync = vi.fn<(...args: any[]) => any>();
const mockValidateFormContent = vi.fn<(...args: any[]) => ValidationIssue[]>();

vi.mock('node:fs', () => {
  // Provide both named exports and a default that mirrors them,
  // so `import { readFileSync } from 'node:fs'` and `import fs from 'node:fs'` both work.
  return {
    default: {
      readdirSync: mockReaddirSync,
      statSync: mockStatSync,
      readFileSync: mockReadFileSync,
    },
    readdirSync: mockReaddirSync,
    statSync: mockStatSync,
    readFileSync: mockReadFileSync,
  };
});

vi.mock('./validate-content.js', () => ({
  validateFormContent: mockValidateFormContent,
}));

describe('cli', () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    mockReaddirSync.mockReset();
    mockStatSync.mockReset();
    mockReadFileSync.mockReset();
    mockValidateFormContent.mockReset();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  /** Dynamic import triggers run() at module level on each fresh import. */
  async function importCli() {
    await import('./cli.js');
  }

  // ---------- walkJson (tested indirectly through run) ----------

  describe('walkJson — directory traversal', () => {
    it('finds .json files in a flat directory', async () => {
      mockReaddirSync.mockReturnValue(['form.json', 'readme.txt']);
      mockStatSync.mockReturnValue({ isDirectory: () => false });
      mockReadFileSync.mockReturnValue('{"fields":{"a":{"label":"A"}}}');
      mockValidateFormContent.mockReturnValue([]);

      await importCli();

      expect(mockReadFileSync).toHaveBeenCalledTimes(1);
      expect(String(mockReadFileSync.mock.calls[0][0])).toContain('form.json');
    });

    it('skips directories prefixed with _', async () => {
      mockReaddirSync.mockImplementation((dir: any) => {
        const d = String(dir);
        if (d.endsWith('_drafts')) return ['draft.json'];
        return ['_drafts', 'live.json'];
      });
      mockStatSync.mockImplementation((p: any) => {
        const s = String(p);
        return { isDirectory: () => s.endsWith('_drafts') } as any;
      });
      mockReadFileSync.mockReturnValue('{"fields":{"a":{"label":"A"}}}');
      mockValidateFormContent.mockReturnValue([]);

      await importCli();

      // Only live.json should be read; _drafts dir and its contents are skipped
      expect(mockReadFileSync).toHaveBeenCalledTimes(1);
      expect(String(mockReadFileSync.mock.calls[0][0])).toContain('live.json');
    });

    it('recursively traverses subdirectories', async () => {
      mockReaddirSync.mockImplementation((dir: any) => {
        const d = String(dir);
        if (d.endsWith('sub')) return ['nested.json'];
        return ['sub', 'top.json'];
      });
      mockStatSync.mockImplementation((p: any) => {
        const s = String(p);
        return { isDirectory: () => s.endsWith('sub') } as any;
      });
      mockReadFileSync.mockReturnValue('{"fields":{"a":{"label":"A"}}}');
      mockValidateFormContent.mockReturnValue([]);

      await importCli();

      expect(mockReadFileSync).toHaveBeenCalledTimes(2);
    });

    it('skips entries prefixed with _ (files and dirs alike)', async () => {
      mockReaddirSync.mockReturnValue(['_schema.json', 'form.json']);
      mockStatSync.mockReturnValue({ isDirectory: () => false });
      mockReadFileSync.mockReturnValue('{"fields":{"a":{"label":"A"}}}');
      mockValidateFormContent.mockReturnValue([]);

      await importCli();

      expect(mockReadFileSync).toHaveBeenCalledTimes(1);
      expect(String(mockReadFileSync.mock.calls[0][0])).toContain('form.json');
    });
  });

  // ---------- run — output and exit behaviour ----------

  describe('run — output and exit behavior', () => {
    it('exits 0 with message when no content files are found', async () => {
      mockReaddirSync.mockReturnValue([]);

      await importCli();

      expect(logSpy).toHaveBeenCalledWith('No content files found in content/');
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it('exits 0 with success message when all files are valid', async () => {
      mockReaddirSync.mockReturnValue(['form.json']);
      mockStatSync.mockReturnValue({ isDirectory: () => false });
      mockReadFileSync.mockReturnValue('{"fields":{"email":{"label":"Email"}}}');
      mockValidateFormContent.mockReturnValue([]);

      await importCli();

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Validated 1 content file(s)'),
      );
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it('exits 1 when files have errors', async () => {
      mockReaddirSync.mockReturnValue(['form.json']);
      mockStatSync.mockReturnValue({ isDirectory: () => false });
      mockReadFileSync.mockReturnValue('{"fields":{"email":{"label":"Email"}}}');
      const issues: ValidationIssue[] = [
        { file: 'form.json', path: 'fields.email.label', severity: 'error', message: 'Bad label.' },
      ];
      mockValidateFormContent.mockReturnValue(issues);

      await importCli();

      expect(errorSpy).toHaveBeenCalledWith('[ERR] form.json > fields.email.label: Bad label.');
      expect(errorSpy).toHaveBeenCalledWith('\n1 error(s), 0 warning(s)');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('exits 0 when files have only warnings', async () => {
      mockReaddirSync.mockReturnValue(['form.json']);
      mockStatSync.mockReturnValue({ isDirectory: () => false });
      mockReadFileSync.mockReturnValue('{"fields":{"email":{"label":"Email"}}}');
      const issues: ValidationIssue[] = [
        { file: 'form.json', path: 'fields.email', severity: 'warning', message: 'Missing hint.' },
      ];
      mockValidateFormContent.mockReturnValue(issues);

      await importCli();

      expect(errorSpy).toHaveBeenCalledWith('[WARN] form.json > fields.email: Missing hint.');
      expect(errorSpy).toHaveBeenCalledWith('\n0 error(s), 1 warning(s)');
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it('reports invalid JSON as an error and exits 1', async () => {
      mockReaddirSync.mockReturnValue(['broken.json']);
      mockStatSync.mockReturnValue({ isDirectory: () => false });
      mockReadFileSync.mockReturnValue('{ not valid json }');

      await importCli();

      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[ERR]'));
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid JSON.'));
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('formats location without " > " when path is empty', async () => {
      mockReaddirSync.mockReturnValue(['broken.json']);
      mockStatSync.mockReturnValue({ isDirectory: () => false });
      mockReadFileSync.mockReturnValue('{ bad }');

      await importCli();

      const errorCalls: string[] = errorSpy.mock.calls.map((c: any[]) => c[0]);
      const issueLine = errorCalls.find((c) => c.includes('Invalid JSON'));
      expect(issueLine).toBeDefined();
      // Empty path produces "[ERR] <file>: <message>" (no " > " separator)
      expect(issueLine).toMatch(/\[ERR\] [^>]+: Invalid JSON\./);
    });

    it('collects issues from multiple files', async () => {
      mockReaddirSync.mockReturnValue(['a.json', 'b.json']);
      mockStatSync.mockReturnValue({ isDirectory: () => false });
      mockReadFileSync.mockReturnValue('{"fields":{"x":{"label":"X"}}}');
      mockValidateFormContent
        .mockReturnValueOnce([
          { file: 'a.json', path: 'fields.x', severity: 'error', message: 'Problem A' },
        ])
        .mockReturnValueOnce([
          { file: 'b.json', path: 'fields.y', severity: 'warning', message: 'Problem B' },
        ]);

      await importCli();

      expect(errorSpy).toHaveBeenCalledWith('[ERR] a.json > fields.x: Problem A');
      expect(errorSpy).toHaveBeenCalledWith('[WARN] b.json > fields.y: Problem B');
      expect(errorSpy).toHaveBeenCalledWith('\n1 error(s), 1 warning(s)');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('skips validation for invalid JSON but continues with remaining files', async () => {
      mockReaddirSync.mockReturnValue(['bad.json', 'good.json']);
      mockStatSync.mockReturnValue({ isDirectory: () => false });
      mockReadFileSync
        .mockReturnValueOnce('not json')
        .mockReturnValueOnce('{"fields":{"a":{"label":"A"}}}');
      mockValidateFormContent.mockReturnValue([]);

      await importCli();

      // validateFormContent only called for the parseable file
      expect(mockValidateFormContent).toHaveBeenCalledTimes(1);
      // Invalid JSON error is still reported
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid JSON.'));
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });
});
