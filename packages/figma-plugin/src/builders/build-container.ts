/**
 * Build the tokens-native container frame for a single Figma variant.
 *
 * The container is the outer auto-layout box: padding, background,
 * border, corner radius — all driven by @civui/tokens so changes to
 * the design tokens flow into Figma the next time the plugin syncs.
 *
 * The captured body (PNG/SVG) is inserted into this container by
 * `insert-body.ts`.
 */

import { color, radius, spacing } from './tokens';

export interface ContainerOptions {
  /** Width of the inner body, in px. */
  bodyWidth: number;
  /** Height of the inner body, in px. */
  bodyHeight: number;
  /** Outer padding token path (e.g., `2`, `3`, `4`). */
  paddingToken?: string;
  /** Background color token path. Defaults to white. */
  backgroundToken?: string;
  /** Optional border color token path. */
  borderToken?: string;
  /** Corner radius token path. */
  radiusToken?: string;
}

export function buildContainer(opts: ContainerOptions): FrameNode {
  const frame = figma.createFrame();
  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'AUTO';
  const padding = opts.paddingToken ? spacing(opts.paddingToken, 16) : 16;
  frame.paddingTop = padding;
  frame.paddingBottom = padding;
  frame.paddingLeft = padding;
  frame.paddingRight = padding;
  frame.cornerRadius = opts.radiusToken ? radius(opts.radiusToken, 4) : 4;
  frame.fills = [{ type: 'SOLID', color: color(opts.backgroundToken ?? 'white') }];
  if (opts.borderToken) {
    frame.strokes = [{ type: 'SOLID', color: color(opts.borderToken) }];
    frame.strokeWeight = 1;
  } else {
    frame.strokes = [];
  }
  frame.itemSpacing = 0;
  return frame;
}
