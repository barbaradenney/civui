/**
 * Capture-page runtime. Imported as a module by `render-page.html`.
 *
 * Exposes `window.civuiRender({ tag, props, slot, state }) -> Promise<{ rect, svgString }>`
 * which the Playwright capture script calls per variant. The function:
 *
 *   1. Clears the stage.
 *   2. Creates the component element, sets attributes/properties from `props`.
 *   3. Optionally injects slot HTML.
 *   4. Sets data-state on the stage so CSS can simulate interaction.
 *   5. Awaits updateComplete + a layout frame.
 *   6. Returns the bounding rect and an SVG serialization of the rendered DOM.
 *
 * Side-effect imports register every pilot component. Add new pilot
 * components here too.
 */

import '@civui/actions/button';
import '@civui/inputs/text-input';
import '@civui/controls/checkbox';
import '@civui/feedback/alert';

interface RenderRequest {
  tag: string;
  props: Record<string, string | number | boolean>;
  slot?: string;
  state: string;
}

interface RenderResult {
  rect: { width: number; height: number };
  svgString: string;
}

declare global {
  interface Window {
    civuiRender(req: RenderRequest): Promise<RenderResult>;
  }
}

async function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function applyProps(el: Element, props: Record<string, string | number | boolean>): void {
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'boolean') {
      if (value) el.setAttribute(propToAttr(key), '');
      else el.removeAttribute(propToAttr(key));
    } else {
      el.setAttribute(propToAttr(key), String(value));
    }
  }
}

function propToAttr(prop: string): string {
  // Match Lit's default camelCase → kebab-case attribute mapping. Specific
  // schemas declare `attribute: 'custom-name'` overrides; the capture
  // script will translate those before calling render.
  return prop.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Serialize the stage's first child as a standalone SVG using
 * `<foreignObject>` to embed the rendered DOM. Figma's SVG importer
 * does not parse foreignObject reliably, so the SVG is mainly used as
 * a layout-fidelity reference; PNG is captured in parallel for actual
 * Figma fills. (When dom-to-svg-style true vectorization is added,
 * this is the seam to swap.)
 */
function serializeAsSvg(target: HTMLElement): string {
  const rect = target.getBoundingClientRect();
  const w = Math.ceil(rect.width);
  const h = Math.ceil(rect.height);
  const clone = target.cloneNode(true) as HTMLElement;
  // Inline computed styles for portability — minimal pass over rendered children.
  inlineComputedStyles(target, clone);
  const xml = new XMLSerializer().serializeToString(clone);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `<foreignObject width="100%" height="100%">`,
    `<div xmlns="http://www.w3.org/1999/xhtml">${xml}</div>`,
    `</foreignObject>`,
    `</svg>`,
  ].join('');
}

function inlineComputedStyles(source: Element, target: Element): void {
  const sStyle = getComputedStyle(source);
  const props = [
    'color', 'background-color', 'border', 'border-radius', 'padding',
    'margin', 'font-family', 'font-size', 'font-weight', 'line-height',
    'display', 'flex-direction', 'align-items', 'justify-content', 'gap',
    'width', 'height', 'min-height',
  ];
  const inline = props.map((p) => `${p}: ${sStyle.getPropertyValue(p)}`).join('; ');
  (target as HTMLElement).setAttribute('style', inline);
  const sChildren = source.children;
  const tChildren = target.children;
  for (let i = 0; i < sChildren.length && i < tChildren.length; i++) {
    inlineComputedStyles(sChildren[i]!, tChildren[i]!);
  }
}

window.civuiRender = async (req) => {
  const stage = document.getElementById('stage');
  if (!stage) throw new Error('Stage missing');
  stage.innerHTML = '';
  stage.setAttribute('data-state', req.state);
  const el = document.createElement(req.tag);
  applyProps(el, req.props);
  if (req.slot) {
    el.innerHTML = req.slot;
  }
  stage.appendChild(el);
  // Wait for Lit reactive update if available
  const litEl = el as unknown as { updateComplete?: Promise<void> };
  if (litEl.updateComplete) await litEl.updateComplete;
  await nextFrame();
  await nextFrame();
  const rect = stage.getBoundingClientRect();
  const svgString = serializeAsSvg(stage);
  return { rect: { width: Math.ceil(rect.width), height: Math.ceil(rect.height) }, svgString };
};
