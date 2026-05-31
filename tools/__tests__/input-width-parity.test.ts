/**
 * Regression guard for the input-width ladder web/native px parity.
 *
 * The `InputWidth` ladder (form-templates.ts `INPUT_WIDTH_CLASSES`) maps
 * each variant to a Tailwind width class (`civ-w-12`, `civ-w-16`, …). The
 * civ-text-input schema declares the matching native sizes
 * (`iosPoints` / `androidDp`). These MUST agree, or the same `width="xs"`
 * renders a different size on web than on iOS/Android.
 *
 * The historical bug: Tailwind's `width` utilities inherit the `spacing`
 * scale, which CivUI overrides to 5px-base — so `civ-w-12` resolved to
 * 60px and `civ-w-16` to 80px while the schema declared 48/64. The fix is
 * a dedicated `theme.extend.width` block in the root tailwind config that
 * re-asserts these keys at their intended 4px-based px. This test pins
 * that agreement so a future spacing-scale change (or a dropped width
 * key) can't silently re-introduce the drift.
 */
import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('input-width ladder web/native parity', () => {
  it('every fixed-width variant renders the same px on web as its native points', async () => {
    const config = (await import(join(repoRoot, 'tailwind.config.ts'))).default as {
      theme: { extend: { width: Record<string, string> } };
    };
    const schema = (await import(
      join(repoRoot, 'packages/schema/src/components/civ-text-input.schema.ts')
    )).default as {
      widths: Record<string, { webClass: string; iosPoints: number | null; androidDp: number | null }>;
    };

    const widthScale = config.theme.extend.width;
    expect(widthScale).toBeTruthy();

    for (const [variant, def] of Object.entries(schema.widths)) {
      if (def.iosPoints === null) continue; // `default` = civ-w-full, no fixed px

      // webClass is `civ-w-<key>`; the `civ-` prefix is Tailwind's prefix,
      // so the scale key is the part after `civ-w-`.
      const key = def.webClass.replace(/^civ-w-/, '');
      const declared = widthScale[key];
      expect(declared, `width scale missing key "${key}" for variant "${variant}"`).toBeTruthy();

      const webPx = Number.parseInt(declared, 10);
      expect(
        webPx,
        `${variant} (${def.webClass}): web ${webPx}px must equal iosPoints ${def.iosPoints}`,
      ).toBe(def.iosPoints);
      expect(
        webPx,
        `${variant} (${def.webClass}): web ${webPx}px must equal androidDp ${def.androidDp}`,
      ).toBe(def.androidDp);
    }
  });

  it('the width scale is decoupled from the 5px spacing scale (w-16 = 64px, not 80px)', async () => {
    const config = (await import(join(repoRoot, 'tailwind.config.ts'))).default as {
      theme: { extend: { width: Record<string, string>; spacing: Record<string, string> } };
    };
    // The collision cases: these two keys exist in BOTH scales. Width must
    // be the literal 4px-based px; spacing stays the 5px-based var.
    expect(config.theme.extend.width['12']).toBe('48px');
    expect(config.theme.extend.width['16']).toBe('64px');
    expect(config.theme.extend.spacing['12']).toMatch(/var\(--civ-spacing-12\)/);
    expect(config.theme.extend.spacing['16']).toMatch(/var\(--civ-spacing-16\)/);
  });
});
