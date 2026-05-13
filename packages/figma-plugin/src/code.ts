/**
 * CivUI Figma plugin — sandbox entry point.
 *
 * Lifecycle:
 *   1. Plugin loads, parses the inlined variant manifest + token subset.
 *   2. Shows UI iframe with the list of available components.
 *   3. On `sync`, iterates selected components and builds a Component Set
 *      per component on the appropriate category page.
 *   4. Reports progress back to UI.
 *
 * The manifest is baked into the bundle at build time. To refresh,
 * run `pnpm --filter @civui/figma-plugin capture && pnpm --filter @civui/figma-plugin build`.
 */

import type {
  VariantManifest,
  UiToPluginMessage,
  PluginToUiMessage,
} from './shared/types';
import { buildComponentSet } from './builders/build-component-set';

declare const __VARIANT_MANIFEST__: VariantManifest;

const MANIFEST: VariantManifest = __VARIANT_MANIFEST__;

function postToUi(msg: PluginToUiMessage): void {
  figma.ui.postMessage(msg);
}

function listComponents(): PluginToUiMessage {
  const components = Object.values(MANIFEST.components).map((c) => ({
    name: c.name,
    displayName: c.displayName,
    variantCount: c.variants.length,
  }));
  return { type: 'components', components };
}

async function sync(componentNames: string[]): Promise<void> {
  let createdSets = 0;
  let createdVariants = 0;
  for (const name of componentNames) {
    const capture = MANIFEST.components[name];
    if (!capture) {
      console.warn(`[civui-figma] no capture for ${name}`);
      continue;
    }
    postToUi({ type: 'progress', component: name, done: 0, total: capture.variants.length });
    try {
      await buildComponentSet(capture);
      createdSets += 1;
      createdVariants += capture.variants.length;
      postToUi({ type: 'progress', component: name, done: capture.variants.length, total: capture.variants.length });
    } catch (err) {
      postToUi({ type: 'error', message: `Failed to build ${name}: ${String(err)}` });
    }
  }
  postToUi({ type: 'done', createdSets, createdVariants });
}

async function main(): Promise<void> {
  if (figma.command === 'settings') {
    figma.notify(`CivUI Sync — manifest built ${MANIFEST.builtAt} · schema v${MANIFEST.schemaVersion}`, {
      timeout: 6000,
    });
    figma.closePlugin();
    return;
  }

  figma.showUI(__html__, { width: 360, height: 480, themeColors: true });

  // Push the initial component list as soon as the UI is ready.
  postToUi(listComponents());

  figma.ui.onmessage = async (msg: UiToPluginMessage) => {
    if (msg.type === 'list-components') {
      postToUi(listComponents());
      return;
    }
    if (msg.type === 'cancel') {
      figma.closePlugin();
      return;
    }
    if (msg.type === 'sync') {
      try {
        await sync(msg.components);
      } catch (err) {
        postToUi({ type: 'error', message: String(err) });
      }
    }
  };
}

main();
