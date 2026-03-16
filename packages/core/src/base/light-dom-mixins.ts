import type { LitElement } from 'lit';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Mixin for Light DOM container components that need to preserve
 * authored children. Captures children before Lit's first render
 * and provides a method to relocate them into a rendered container.
 */
export function LightDomContainerMixin<T extends Constructor<LitElement>>(superClass: T) {
  class LightDomContainer extends superClass {
    private _userChildren: Node[] = [];

    override connectedCallback(): void {
      this._userChildren = Array.from(this.childNodes);
      super.connectedCallback();
    }

    /** Call in firstUpdated() with the CSS selector for the content container */
    protected _relocateChildren(containerSelector: string): void {
      const container = this.querySelector(containerSelector);
      if (container) {
        for (const child of this._userChildren) {
          container.appendChild(child);
        }
      }
    }
  }
  return LightDomContainer as unknown as Constructor<{ _relocateChildren(selector: string): void }> & T;
}

/**
 * Mixin for Light DOM leaf components that use child text content
 * as a label fallback. Captures textContent before Lit renders
 * and clears children to prevent duplication.
 */
export function LightDomTextMixin<T extends Constructor<LitElement>>(superClass: T) {
  class LightDomText extends superClass {
    protected _initialText = '';

    override connectedCallback(): void {
      if (!this._initialText) {
        this._initialText = this.textContent?.trim() || '';
      }
      this.textContent = '';
      super.connectedCallback();
    }
  }
  return LightDomText as unknown as Constructor<{ _initialText: string }> & T;
}
