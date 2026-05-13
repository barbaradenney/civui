/**
 * Shared types between the capture pipeline, plugin code (sandbox),
 * and plugin UI. Both halves of the plugin bundle import from here.
 */

import type { InteractionState } from '../../pilot.config.js';

/** Resolved per-variant prop combination. */
export interface VariantKey {
  /** Schema-prop axis values (e.g., { variant: 'primary', danger: 'true' }) */
  axes: Record<string, string>;
  /** Interaction state, mirrors pilot.config InteractionState. */
  state: InteractionState;
}

/** Single captured variant — what the Playwright pipeline produces per Figma variant. */
export interface CapturedVariant {
  /** Variant identity (e.g., { axes: { variant: 'primary' }, state: 'focus' }) */
  key: VariantKey;
  /**
   * Rendered body. Either an inline SVG string (preferred, vector-perfect)
   * or a base64 PNG data URL (fallback for browsers/components where SVG
   * capture is unreliable).
   */
  body:
    | { kind: 'svg'; svg: string; width: number; height: number }
    | { kind: 'png'; dataUrl: string; width: number; height: number };
}

/** Per-component output of the capture pipeline. */
export interface ComponentCapture {
  /** Schema name */
  name: string;
  /** Display label for the Figma component (e.g., 'Button') */
  displayName: string;
  /** Schema category for Figma page organization (e.g., 'form-control') */
  category: string;
  /** Ordered list of axis names that map to Figma variant properties */
  axes: string[];
  /** Whether interaction states are exploded (adds a 'State' axis) */
  hasStates: boolean;
  variants: CapturedVariant[];
}

/** Top-level manifest inlined into the plugin bundle at build time. */
export interface VariantManifest {
  /** Generator-info; useful for debugging stale bundles. */
  builtAt: string;
  /** Schema package version this capture was produced against. */
  schemaVersion: string;
  /** Components keyed by name. */
  components: Record<string, ComponentCapture>;
}

/** Subset of design tokens needed by the plugin. */
export interface TokenSubset {
  colors: Record<string, { r: number; g: number; b: number; a: number }>;
  spacing: Record<string, number>;
  radii: Record<string, number>;
  typography: {
    fontFamily: string;
    sizes: Record<string, number>;
  };
}

/** UI → plugin message envelope. */
export type UiToPluginMessage =
  | { type: 'sync'; components: string[] }
  | { type: 'cancel' }
  | { type: 'list-components' };

/** Plugin → UI message envelope. */
export type PluginToUiMessage =
  | { type: 'components'; components: { name: string; displayName: string; variantCount: number }[] }
  | { type: 'progress'; component: string; done: number; total: number }
  | { type: 'done'; createdSets: number; createdVariants: number }
  | { type: 'error'; message: string };
