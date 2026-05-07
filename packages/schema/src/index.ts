/**
 * @civui/schema — platform-neutral component contracts.
 *
 * This barrel re-exports the public surface so consumers can write
 * `import { validateSchema, ComponentSchema } from '@civui/schema'`
 * without knowing the internal file layout.
 *
 * For tree-shaking, prefer the per-export sub-paths:
 *   import { validateSchema } from '@civui/schema/validate';
 *   import type { ComponentSchema } from '@civui/schema/types';
 *
 * The 53 individual component schemas live at
 * `@civui/schema/components/civ-<name>.schema.js` (TypeScript / ESM)
 * or `@civui/schema/contracts/civ-<name>.json` (plain JSON, generated).
 */

export * from './schema.types.js';
export * from './validate.js';
export * from './naming-maps.js';
