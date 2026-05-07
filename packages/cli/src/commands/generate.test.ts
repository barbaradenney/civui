import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock node:fs before importing the module under test
vi.mock('node:fs', () => ({
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  existsSync: vi.fn(),
}));

// Mock findRoot and other utils to avoid filesystem traversal
vi.mock('../utils.js', () => ({
  findRoot: vi.fn(() => '/mock/root'),
  toPascalCase: vi.fn((name: string) =>
    name
      .split('-')
      .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(''),
  ),
  success: vi.fn(),
  header: vi.fn(),
}));

import { generate } from './generate.js';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

const mockWriteFileSync = vi.mocked(writeFileSync);
const mockMkdirSync = vi.mocked(mkdirSync);
const mockExistsSync = vi.mocked(existsSync);

describe('generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(false);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws on non-component type', async () => {
    await expect(generate('widget', ['foo'], {})).rejects.toThrow(
      'Unknown generate type: "widget"',
    );
  });

  it('throws when name is missing', async () => {
    await expect(generate('component', [], {})).rejects.toThrow(
      'Component name is required',
    );
  });

  it('throws on invalid name (not kebab-case)', async () => {
    await expect(generate('component', ['MyButton'], {})).rejects.toThrow(
      'Component name must be kebab-case',
    );
  });

  it('throws when name starts with a number', async () => {
    await expect(generate('component', ['3button'], {})).rejects.toThrow(
      'Component name must be kebab-case',
    );
  });

  it('throws when directory already exists', async () => {
    mockExistsSync.mockReturnValue(true);
    await expect(generate('component', ['date-picker'], {})).rejects.toThrow(
      'Component directory already exists',
    );
  });

  it('creates the component directory', async () => {
    await generate('component', ['date-picker'], {});
    expect(mockMkdirSync).toHaveBeenCalledWith(
      '/mock/root/packages/forms/src/date-picker',
      { recursive: true },
    );
  });

  it('scaffolds across all 4 platforms (9 files: web src/test/stories/index, iOS swift, Android kt, Drupal yml/twig/stories)', async () => {
    await generate('component', ['date-picker'], {});
    expect(mockWriteFileSync).toHaveBeenCalledTimes(9);
  });

  it('creates the component source file with correct path', async () => {
    await generate('component', ['date-picker'], {});
    const firstCallPath = mockWriteFileSync.mock.calls[0][0];
    expect(firstCallPath).toBe(
      '/mock/root/packages/forms/src/date-picker/civ-date-picker.ts',
    );
  });

  it('template content includes correct class name', async () => {
    await generate('component', ['date-picker'], {});
    const sourceContent = mockWriteFileSync.mock.calls[0][1] as string;
    expect(sourceContent).toContain('CivDatePicker');
    expect(sourceContent).toContain("@customElement('civ-date-picker')");
  });

  it('template content includes correct tag name in test file', async () => {
    await generate('component', ['date-picker'], {});
    const testContent = mockWriteFileSync.mock.calls[1][1] as string;
    expect(testContent).toContain('civ-date-picker');
    expect(testContent).toContain("describe('civ-date-picker'");
  });

  it('creates stories file with correct title', async () => {
    await generate('component', ['date-picker'], {});
    const storiesContent = mockWriteFileSync.mock.calls[2][1] as string;
    expect(storiesContent).toContain("title: 'Forms/Date Picker'");
  });

  it('creates index barrel file that re-exports the class', async () => {
    await generate('component', ['date-picker'], {});
    const indexContent = mockWriteFileSync.mock.calls[3][1] as string;
    expect(indexContent).toContain("export { CivDatePicker }");
    expect(indexContent).toContain("from './civ-date-picker.js'");
  });

  it('accepts valid single-word kebab-case names', async () => {
    await generate('component', ['button'], {});
    const sourceContent = mockWriteFileSync.mock.calls[0][1] as string;
    expect(sourceContent).toContain('CivButton');
    expect(sourceContent).toContain("@customElement('civ-button')");
  });
});
