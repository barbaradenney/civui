/**
 * Build a Figma Component Set for a single CivUI component.
 *
 * For each variant in `capture.variants`:
 *   1. Create a Component node named per Figma variant-property syntax
 *      ("Variant=Primary, State=Default").
 *   2. Build a tokens-native container frame.
 *   3. Insert the captured body (PNG or SVG).
 *   4. Append to a parent frame, which is later combined into a single
 *      Component Set via `figma.combineAsVariants`.
 *
 * Component Sets land on a dedicated Figma page named "CivUI · <category>"
 * so designers can navigate by category (form-control, feedback, etc.).
 */

import type { ComponentCapture } from '../shared/types';
import { variantName } from '../shared/variant-axes';
import { buildContainer } from './build-container';
import { insertBody } from './insert-body';

const CATEGORY_PAGE_PREFIX = 'CivUI ·';
const COLUMN_GAP = 24;
const ROW_HEIGHT = 0; // auto

/** Resolve or create the page for this component's category. */
function pageFor(category: string): PageNode {
  const wanted = `${CATEGORY_PAGE_PREFIX} ${humanizeCategory(category)}`;
  const existing = figma.root.children.find((p) => p.name === wanted);
  if (existing) return existing as PageNode;
  const page = figma.createPage();
  page.name = wanted;
  return page;
}

function humanizeCategory(category: string): string {
  return category
    .split('-')
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(' ');
}

export async function buildComponentSet(capture: ComponentCapture): Promise<ComponentSetNode> {
  const page = pageFor(capture.category);
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }).catch(() => {});

  const components: ComponentNode[] = [];
  let x = 0;
  for (const variant of capture.variants) {
    const comp = figma.createComponent();
    comp.name = variantName(variant.key, capture.hasStates);
    comp.layoutMode = 'VERTICAL';
    comp.primaryAxisSizingMode = 'AUTO';
    comp.counterAxisSizingMode = 'AUTO';
    comp.fills = [];
    const container = buildContainer({
      bodyWidth: variant.body.width,
      bodyHeight: variant.body.height,
      paddingToken: '2',
      backgroundToken: 'white',
      borderToken: 'base-lighter',
      radiusToken: 'radius-md',
    });
    comp.appendChild(container);
    await insertBody(container, variant.body);
    comp.x = x;
    comp.y = 0;
    x += variant.body.width + COLUMN_GAP + 48; // body + gap + container padding budget
    components.push(comp);
    page.appendChild(comp);
  }

  const set = figma.combineAsVariants(components, page);
  set.name = capture.displayName;
  set.layoutMode = 'HORIZONTAL';
  set.primaryAxisSizingMode = 'AUTO';
  set.counterAxisSizingMode = 'AUTO';
  set.itemSpacing = COLUMN_GAP;
  // Sets get an attribute fill to visually separate from the canvas.
  set.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.98 }, opacity: 0.6 }];
  set.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.88 } }];
  set.dashPattern = [4, 4];
  set.cornerRadius = 8;
  set.paddingTop = 16;
  set.paddingBottom = 16;
  set.paddingLeft = 16;
  set.paddingRight = 16;
  void ROW_HEIGHT;
  return set;
}
