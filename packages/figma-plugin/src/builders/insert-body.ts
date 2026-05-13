/**
 * Insert a captured variant body into a parent frame.
 *
 * PNG bodies become a rectangle with an image fill (Figma's standard
 * way to embed raster content). SVG bodies use `figma.createNodeFromSvg`
 * which parses the SVG into native vector layers — designers can pick
 * apart strokes/fills directly. SVG mode is preferred when the captured
 * SVG is valid (capture-variants.ts may fall back to PNG for components
 * where DOM-to-SVG fidelity is poor).
 */

import type { CapturedVariant } from '../shared/types';

// atob is provided by the Figma plugin sandbox but not in the @figma/plugin-typings defs.
declare const atob: (encoded: string) => string;

export async function insertBody(parent: FrameNode, body: CapturedVariant['body']): Promise<void> {
  if (body.kind === 'svg') {
    const svgNode = figma.createNodeFromSvg(body.svg);
    svgNode.resize(body.width, body.height);
    parent.appendChild(svgNode);
    return;
  }
  // PNG fill on a fixed-size rect
  const rect = figma.createRectangle();
  rect.resize(body.width, body.height);
  const imageHash = figma.createImage(dataUrlToUint8(body.dataUrl)).hash;
  rect.fills = [{ type: 'IMAGE', scaleMode: 'FIT', imageHash }];
  parent.appendChild(rect);
}

function dataUrlToUint8(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] ?? '';
  // atob is available in the Figma plugin sandbox.
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
