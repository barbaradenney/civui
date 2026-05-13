/**
 * Tests for tools/lint-dead-properties.ts.
 */

import { describe, it, expect } from 'vitest';
import {
  findDeclaredProps,
  isPropReadInClass,
  runLint,
} from '../lint-dead-properties.js';

describe('findDeclaredProps', () => {
  it('finds a single decorated property', () => {
    const src = `
      export class CivFoo extends HTMLElement {
        @property({ type: String }) name = '';
      }
    `;
    const props = findDeclaredProps(src);
    expect(props).toEqual([{ className: 'CivFoo', propName: 'name', attribute: undefined, reflects: false }]);
  });

  it('captures the attribute name from the decorator args', () => {
    const src = `
      export class CivFoo extends HTMLElement {
        @property({ type: String, attribute: 'item-label' }) itemLabel = '';
      }
    `;
    const props = findDeclaredProps(src);
    expect(props[0].attribute).toBe('item-label');
  });

  it('balances nested parens (arrow-function converter inside the decorator)', () => {
    // Regression: a naïve regex would stop at the first `)` inside
    // `(val: string | null)` and capture `return` as the prop name.
    const src = `
      export class CivFoo extends HTMLElement {
        @property({
          attribute: 'support-resources',
          converter: {
            fromAttribute: (val: string | null): unknown[] => {
              return [];
            },
          },
        })
        supportResources: unknown[] = [];
      }
    `;
    const props = findDeclaredProps(src);
    expect(props.map((p) => p.propName)).toEqual(['supportResources']);
  });

  it('detects reflect: true', () => {
    const src = `
      export class CivFoo extends HTMLElement {
        @property({ type: Boolean, reflect: true, attribute: 'tight-hint' }) tightHint = false;
      }
    `;
    const props = findDeclaredProps(src);
    expect(props[0].reflects).toBe(true);
  });

  it('captures multiple properties on the same class', () => {
    const src = `
      export class CivFoo extends HTMLElement {
        @property({ type: String }) a = '';
        @property({ type: Number }) b = 0;
        @property({ type: Boolean }) c = false;
      }
    `;
    const props = findDeclaredProps(src);
    expect(props.map((p) => p.propName)).toEqual(['a', 'b', 'c']);
  });
});

describe('isPropReadInClass', () => {
  it('returns true when the prop is read via this.prop', () => {
    const src = `class X { foo = ''; render() { return this.foo; } }`;
    expect(isPropReadInClass(src, 'foo')).toBe(true);
  });

  it('returns true when the prop is read inside a template literal', () => {
    const src = 'class X { foo = ""; render() { return html`${this.foo}`; } }';
    expect(isPropReadInClass(src, 'foo')).toBe(true);
  });

  it('returns false when the prop is only declared', () => {
    const src = `class X { @property() foo = ''; }`;
    expect(isPropReadInClass(src, 'foo')).toBe(false);
  });

  it('does not match partial-prefix names', () => {
    const src = `class X { fooBar = ''; render() { return this.fooBarBaz; } }`;
    expect(isPropReadInClass(src, 'fooBar')).toBe(false);
  });
});

describe('runLint (regression)', () => {
  it('every @property is read inside its class (or allowlisted)', () => {
    const result = runLint();
    if (result.dead.length > 0) {
      const names = result.dead.map((d) => `${d.className}.${d.propName}`).join('\n  ');
      throw new Error(
        `${result.dead.length} declared-but-unused @property fields:\n  ${names}`,
      );
    }
    expect(result.dead).toEqual([]);
    expect(result.propsScanned).toBeGreaterThan(100);
  });
});
