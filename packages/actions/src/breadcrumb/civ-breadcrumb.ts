import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Breadcrumb
 *
 * Trail of links showing the user's path through a hierarchy. Renders
 * a `<nav aria-label="…">` containing an `<ol>` of `<civ-breadcrumb-item>`
 * children. The last item should set `current` (or omit `href`) — that
 * item renders as a non-link `<span aria-current="page">`.
 *
 * @element civ-breadcrumb
 *
 * @prop {string} label - Accessible name for the navigation landmark
 *   (defaults to "Breadcrumb"). Set this when a page renders more than
 *   one breadcrumb trail so each landmark has a distinct name.
 *
 * @slot - `<civ-breadcrumb-item>` children.
 *
 * @example
 * ```html
 * <civ-breadcrumb>
 *   <civ-breadcrumb-item href="/" label="Home"></civ-breadcrumb-item>
 *   <civ-breadcrumb-item href="/benefits" label="Benefits"></civ-breadcrumb-item>
 *   <civ-breadcrumb-item label="Healthcare" current></civ-breadcrumb-item>
 * </civ-breadcrumb>
 * ```
 */
@customElement('civ-breadcrumb')
export class CivBreadcrumb extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) label = 'Breadcrumb';

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-breadcrumb-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    return html`
      <nav class="civ-breadcrumb" aria-label="${ifDefined(this.label || undefined)}">
        <ol class="civ-breadcrumb__list" data-civ-breadcrumb-content></ol>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-breadcrumb': CivBreadcrumb;
  }
}
