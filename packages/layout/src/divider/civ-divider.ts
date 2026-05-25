import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, devWarn } from '@civui/core';

/**
 * CivUI Divider
 *
 * A horizontal rule for visually separating content sections.
 * Renders as an `<hr>` with consistent styling from design tokens.
 *
 * @element civ-divider
 *
 * @prop {string} rhythm - Vertical margin (top + bottom): 'default' (16px) or 'sm' (8px)
 * @prop {string} spacing - **Deprecated** — use `rhythm` instead. Same values, same effect. Removed in a future release.
 * @prop {'default' | 'primary'} emphasis - Visual style: 'default' (1px, light) or 'primary' (2px, darker)
 *
 * @example
 * ```html
 * <civ-divider></civ-divider>
 * <civ-divider rhythm="sm"></civ-divider>
 * <civ-divider emphasis="primary"></civ-divider>
 * ```
 */
@customElement('civ-divider')
export class CivDivider extends CivBaseElement {
  /**
   * Vertical margin (top + bottom) around the divider line.
   * `default` (16px, `civ-my-4`) or `sm` (8px, `civ-my-2`). The
   * divider has no internal padding — this is a vertical-rhythm
   * control between the divider and the sibling content on either
   * side.
   *
   * Named `rhythm` (not `spacing`) to avoid the density-convention
   * trap where `spacing` everywhere else means "internal padding."
   * See `.claude/rules/density-convention.md` "Three things
   * `spacing='sm'` MUST NOT mean."
   */
  @property({ type: String }) rhythm: 'default' | 'sm' = 'default';

  /**
   * @deprecated Use `rhythm` instead. Same allowed values, same
   * effect — both produce the `civ-divider--sm` modifier class
   * when set to `'sm'`. The `spacing` prop will be removed in a
   * future release; setting it to a non-default value emits a
   * one-time dev-mode console warning.
   */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  /** Visual style: 'default' (1px, light) or 'primary' (2px, darker). */
  @property({ type: String }) emphasis: 'default' | 'primary' = 'default';

  override render() {
    if (this.spacing !== 'default') {
      devWarn(
        'civ-divider',
        '`spacing` is deprecated and will be removed in a future release. Use `rhythm` instead — same allowed values, same effect. The rename clarifies that this prop controls margin around the divider, not internal padding.',
        'civ-divider:spacing-deprecated',
      );
    }
    const isSm = this.rhythm === 'sm' || this.spacing === 'sm';
    const classes = [
      'civ-divider',
      isSm ? 'civ-divider--sm' : '',
      this.emphasis === 'primary' ? 'civ-divider--primary' : '',
    ].filter(Boolean).join(' ');

    return html`<hr class="${classes}" />`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-divider': CivDivider;
  }
}
