/// <reference types="vite/client" />
import type { Meta, StoryObj } from '@storybook/web-components';
import { LitElement, html, nothing } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { getIconNames, registerIcon } from './icon-library.js';
// Vite ?raw import — fetched as a string at build time.
import iconCss from '../styles/components.css?raw';
import './civ-icon.js';

const SCOPE_CLASS = 'civ-icon-editor-preview';

const SNIPPETS: { label: string; css: string }[] = [
  {
    label: 'Centered bar (horizontal)',
    css: `content: '';
position: absolute;
width: 0.72em;
height: 2px;
background: currentColor;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);`,
  },
  {
    label: 'Centered bar (vertical)',
    css: `content: '';
position: absolute;
width: 2px;
height: 0.72em;
background: currentColor;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);`,
  },
  {
    label: 'Border-corner chevron',
    css: `content: '';
width: 0.35em;
height: 0.35em;
border-right: 2px solid currentColor;
border-bottom: 2px solid currentColor;
transform: rotate(-45deg);`,
  },
  {
    label: 'Circle outline',
    css: `content: '';
position: absolute;
width: 0.8em;
height: 0.8em;
border: 2px solid currentColor;
border-radius: 50%;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);`,
  },
  {
    label: 'Filled circle',
    css: `content: '';
position: absolute;
width: 0.4em;
height: 0.4em;
background: currentColor;
border-radius: 50%;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);`,
  },
  {
    label: 'Triangle (border trick)',
    css: `content: '';
position: absolute;
width: 0;
height: 0;
border-left: 0.4em solid transparent;
border-right: 0.4em solid transparent;
border-bottom: 0.6em solid currentColor;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);`,
  },
  {
    label: 'Square outline',
    css: `content: '';
position: absolute;
width: 0.7em;
height: 0.7em;
border: 2px solid currentColor;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);`,
  },
  {
    label: 'Rotated square (diamond)',
    css: `content: '';
position: absolute;
width: 0.5em;
height: 0.5em;
border: 2px solid currentColor;
top: 50%;
left: 50%;
transform: translate(-50%, -50%) rotate(45deg);`,
  },
];

/**
 * Walk a CSS source string and return every rule block whose selector
 * mentions `.civ-icon--{name}` (with proper word boundary). Handles
 * nested braces (e.g. the outer `@layer components { ... }` wrapper).
 */
function extractIconRules(source: string, iconName: string): string {
  const rules: string[] = [];
  const needle = `.civ-icon--${iconName}`;
  let i = 0;
  let selectorStart = 0;

  while (i < source.length) {
    const ch = source[i];
    if (ch === '{') {
      const selector = source.slice(selectorStart, i).trim();
      // Find matching `}` accounting for nested braces.
      let depth = 1;
      let j = i + 1;
      while (j < source.length && depth > 0) {
        if (source[j] === '{') depth++;
        else if (source[j] === '}') depth--;
        if (depth === 0) break;
        j++;
      }
      const body = source.slice(i + 1, j);

      // Skip @-rules (e.g. `@layer components`) by recursing.
      if (selector.startsWith('@')) {
        rules.push(extractIconRules(body, iconName));
      } else {
        // Word-boundary check: char after needle must be `:`, `,`,
        // whitespace, or `{`.
        const idx = selector.indexOf(needle);
        if (idx >= 0) {
          const after = selector[idx + needle.length] ?? '';
          if (after === '' || ':,{ \t\n\r'.includes(after)) {
            rules.push(`${selector} {${body}}`);
          }
        }
      }
      i = j + 1;
      selectorStart = i;
    } else if (ch === '}') {
      // Stray closing brace — reset.
      i++;
      selectorStart = i;
    } else {
      i++;
    }
  }

  return rules.filter(Boolean).join('\n\n');
}

/**
 * Rewrite selectors so they only match inside the preview scope. Naive
 * comma-split is fine for the icon vocabulary used in components.css.
 */
function scopeRules(rulesCss: string, scopeSelector: string): string {
  return rulesCss.replace(/([^{}]+)\{([^{}]*)\}/g, (_match, selectorList: string, body: string) => {
    const scoped = selectorList
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => `${scopeSelector} ${s}`)
      .join(',\n');
    return `${scoped} {${body}}`;
  });
}

/** Try to parse the scoped CSS; return error message or null. */
function validateCss(scopedCss: string): string | null {
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(scopedCss);
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

const ALL_RULES: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const name of getIconNames()) {
    map.set(name, extractIconRules(iconCss, name));
  }
  return map;
})();

@customElement('civ-icon-editor')
class CivIconEditor extends LitElement {
  // Light DOM, like the rest of the design system.
  override createRenderRoot() {
    return this;
  }

  @state() private _selectedIcon = 'check';
  @state() private _editorValue = '';
  @state() private _newIconName = '';
  @state() private _mode: 'edit' | 'create' = 'edit';
  @state() private _previewBg: 'light' | 'dark' = 'light';
  @state() private _showGrid = true;
  @state() private _cssError: string | null = null;
  @state() private _copied = false;
  @state() private _filter = '';

  @query('#civ-icon-editor-style') private _styleEl!: HTMLStyleElement;

  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this._loadIcon(this._selectedIcon);
  }

  private _loadIcon(name: string) {
    this._mode = 'edit';
    this._selectedIcon = name;
    this._editorValue = ALL_RULES.get(name) ?? '';
    this._copied = false;
    this._scheduleUpdate();
  }

  private _startNewIcon() {
    this._mode = 'create';
    this._newIconName = 'my-icon';
    this._selectedIcon = 'my-icon';
    registerIcon('my-icon', { label: 'Custom icon' });
    this._editorValue = `.civ-icon--my-icon::before {\n  content: '';\n  position: absolute;\n  width: 0.6em;\n  height: 0.6em;\n  border: 2px solid currentColor;\n  border-radius: 50%;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}`;
    this._copied = false;
    this._scheduleUpdate();
  }

  private _onEditorInput = (e: Event) => {
    this._editorValue = (e.target as HTMLTextAreaElement).value;
    this._copied = false;
    this._scheduleUpdate();
  };

  private _onNewNameInput = (e: Event) => {
    const next = (e.target as HTMLInputElement).value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-+|-+$/g, '');
    // Re-target rules to the new name so the preview keeps working.
    // Negative lookahead prevents partial matches: `--my` shouldn't match `--my-icon`.
    if (this._newIconName && next) {
      const oldNeedle = new RegExp(
        `\\.civ-icon--${this._newIconName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![-\\w])`,
        'g',
      );
      this._editorValue = this._editorValue.replace(oldNeedle, `.civ-icon--${next}`);
    }
    this._newIconName = next;
    this._selectedIcon = next || 'my-icon';
    if (next) registerIcon(next, { label: 'Custom icon' });
    this._scheduleUpdate();
  };

  private _scheduleUpdate() {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this._applyPreview(), 50);
  }

  private _applyPreview() {
    if (!this._styleEl) return;
    const scoped = scopeRules(this._editorValue, `.${SCOPE_CLASS}`);
    this._cssError = validateCss(scoped);
    this._styleEl.textContent = scoped;
  }

  private _onReset = () => {
    if (this._mode === 'edit') {
      this._editorValue = ALL_RULES.get(this._selectedIcon) ?? '';
      this._scheduleUpdate();
    }
  };

  private _onCopy = async () => {
    try {
      await navigator.clipboard.writeText(this._editorValue);
      this._copied = true;
      setTimeout(() => {
        this._copied = false;
      }, 1500);
    } catch {
      // Fallback: select the textarea content.
      const ta = this.querySelector('textarea');
      ta?.select();
    }
  };

  private _insertSnippet = (snippet: { label: string; css: string }) => {
    const ta = this.querySelector<HTMLTextAreaElement>('textarea.civ-icon-editor__textarea');
    if (!ta) return;
    const start = ta.selectionStart ?? this._editorValue.length;
    const end = ta.selectionEnd ?? this._editorValue.length;
    const before = this._editorValue.slice(0, start);
    const after = this._editorValue.slice(end);
    this._editorValue = `${before}${snippet.css}${after}`;
    this._scheduleUpdate();
    // Restore focus + caret.
    queueMicrotask(() => {
      ta.focus();
      const pos = start + snippet.css.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  override updated() {
    this._applyPreview();
  }

  private _renderPicker() {
    const names = getIconNames().filter((n) =>
      this._filter ? n.toLowerCase().includes(this._filter.toLowerCase()) : true,
    );
    return html`
      <aside class="civ-icon-editor__picker">
        <div class="civ-icon-editor__picker-controls">
          <input
            type="search"
            placeholder="Filter icons…"
            .value=${this._filter}
            @input=${(e: Event) => {
              this._filter = (e.target as HTMLInputElement).value;
            }}
            class="civ-icon-editor__filter"
          />
          <button
            type="button"
            class="civ-icon-editor__new-btn"
            @click=${this._startNewIcon}
          >
            + New icon
          </button>
        </div>
        <ul class="civ-icon-editor__list" role="listbox" aria-label="Icons">
          ${names.map(
            (name) => html`
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected=${this._mode === 'edit' && this._selectedIcon === name}
                  class="civ-icon-editor__list-item ${this._mode === 'edit' &&
                  this._selectedIcon === name
                    ? 'is-active'
                    : ''}"
                  @click=${() => this._loadIcon(name)}
                >
                  <civ-icon name=${name}></civ-icon>
                  <span>${name}</span>
                </button>
              </li>
            `,
          )}
        </ul>
      </aside>
    `;
  }

  private _renderEditor() {
    return html`
      <section class="civ-icon-editor__editor">
        <header class="civ-icon-editor__editor-header">
          ${this._mode === 'create'
            ? html`
                <label class="civ-icon-editor__name-row">
                  <span>Name</span>
                  <input
                    type="text"
                    .value=${this._newIconName}
                    @input=${this._onNewNameInput}
                    placeholder="my-icon"
                  />
                </label>
              `
            : html`<h3 class="civ-icon-editor__icon-title">${this._selectedIcon}</h3>`}
          <div class="civ-icon-editor__actions">
            ${this._mode === 'edit'
              ? html`<button type="button" @click=${this._onReset}>Reset</button>`
              : nothing}
            <button type="button" @click=${this._onCopy}>
              ${this._copied ? 'Copied!' : 'Copy CSS'}
            </button>
          </div>
        </header>
        <textarea
          class="civ-icon-editor__textarea"
          spellcheck="false"
          .value=${this._editorValue}
          @input=${this._onEditorInput}
        ></textarea>
        <div class="civ-icon-editor__status" data-error=${this._cssError ? 'true' : 'false'}>
          ${this._cssError ? `⚠ ${this._cssError}` : '✓ CSS parsed'}
        </div>
        <details class="civ-icon-editor__snippets">
          <summary>Snippets &amp; cheatsheet</summary>
          <div class="civ-icon-editor__snippet-grid">
            ${SNIPPETS.map(
              (s) => html`
                <button
                  type="button"
                  class="civ-icon-editor__snippet"
                  @click=${() => this._insertSnippet(s)}
                  title="Click to insert at cursor"
                >
                  ${s.label}
                </button>
              `,
            )}
          </div>
          <p class="civ-icon-editor__hint">
            Selectors: <code>.civ-icon--${this._selectedIcon}::before</code>,
            <code>::after</code>. The container is <code>1em × 1em</code> with
            <code>position: relative</code>; pseudo-elements are positioned absolutely.
            Use <code>currentColor</code> so icons inherit text color.
          </p>
        </details>
      </section>
    `;
  }

  private _renderPreview() {
    const sizes: { px: number; label: string }[] = [
      { px: 16, label: '16px' },
      { px: 24, label: '24px' },
      { px: 32, label: '32px' },
      { px: 64, label: '64px' },
    ];
    const isDark = this._previewBg === 'dark';
    return html`
      <section
        class="civ-icon-editor__preview ${SCOPE_CLASS} ${isDark
          ? 'civ-icon-editor__preview--dark'
          : ''}"
      >
        <style id="civ-icon-editor-style"></style>
        <header class="civ-icon-editor__preview-header">
          <h3>Preview</h3>
          <label class="civ-icon-editor__toggle">
            <input
              type="checkbox"
              .checked=${this._showGrid}
              @change=${(e: Event) => {
                this._showGrid = (e.target as HTMLInputElement).checked;
              }}
            />
            Grid
          </label>
          <label class="civ-icon-editor__toggle">
            <input
              type="checkbox"
              .checked=${isDark}
              @change=${(e: Event) => {
                this._previewBg = (e.target as HTMLInputElement).checked ? 'dark' : 'light';
              }}
            />
            Dark
          </label>
        </header>

        <div class="civ-icon-editor__hero ${this._showGrid ? 'has-grid' : ''}">
          <civ-icon name=${this._selectedIcon}></civ-icon>
        </div>

        <div class="civ-icon-editor__sizes">
          ${sizes.map(
            (s) => html`
              <div class="civ-icon-editor__size-cell">
                <civ-icon
                  name=${this._selectedIcon}
                  style="font-size:${s.px}px"
                ></civ-icon>
                <span>${s.label}</span>
              </div>
            `,
          )}
        </div>

        <div class="civ-icon-editor__color-row">
          <span style="color: var(--civ-color-primary-DEFAULT, #0050d8)">
            <civ-icon name=${this._selectedIcon} style="font-size:24px"></civ-icon>
          </span>
          <span style="color: var(--civ-color-error-DEFAULT, #d63384)">
            <civ-icon name=${this._selectedIcon} style="font-size:24px"></civ-icon>
          </span>
          <span style="color: var(--civ-color-success-DEFAULT, #2e8540)">
            <civ-icon name=${this._selectedIcon} style="font-size:24px"></civ-icon>
          </span>
          <span style="color: var(--civ-color-warning-DEFAULT, #b8860b)">
            <civ-icon name=${this._selectedIcon} style="font-size:24px"></civ-icon>
          </span>
        </div>

      </section>
    `;
  }

  override render() {
    return html`
      <style>
        .civ-icon-editor {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr) minmax(0, 1fr);
          gap: 1rem;
          font-family: system-ui, sans-serif;
          height: calc(100vh - 4rem);
          min-height: 600px;
        }
        @media (max-width: 900px) {
          .civ-icon-editor {
            grid-template-columns: 1fr;
            height: auto;
          }
        }

        .civ-icon-editor__picker,
        .civ-icon-editor__editor,
        .civ-icon-editor__preview {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 0.75rem;
          overflow: auto;
          display: flex;
          flex-direction: column;
          background: #fff;
        }

        .civ-icon-editor__picker-controls {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .civ-icon-editor__filter {
          flex: 1;
          padding: 0.35rem 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font: inherit;
        }
        .civ-icon-editor__new-btn {
          padding: 0.35rem 0.5rem;
          border: 1px solid #0050d8;
          background: #0050d8;
          color: #fff;
          border-radius: 6px;
          cursor: pointer;
          font: inherit;
        }
        .civ-icon-editor__list {
          list-style: none;
          margin: 0;
          padding: 0;
          overflow-y: auto;
          flex: 1;
        }
        .civ-icon-editor__list-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.35rem 0.5rem;
          border: 1px solid transparent;
          border-radius: 4px;
          background: transparent;
          cursor: pointer;
          font: inherit;
          text-align: left;
          color: inherit;
          font-size: 0.85rem;
        }
        .civ-icon-editor__list-item:hover {
          background: #f3f4f6;
        }
        .civ-icon-editor__list-item.is-active {
          background: #e0ecff;
          border-color: #0050d8;
        }
        .civ-icon-editor__list-item civ-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        .civ-icon-editor__editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .civ-icon-editor__icon-title {
          margin: 0;
          font-family: ui-monospace, monospace;
          font-size: 0.95rem;
        }
        .civ-icon-editor__name-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }
        .civ-icon-editor__name-row input {
          font: inherit;
          font-family: ui-monospace, monospace;
          padding: 0.25rem 0.4rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }
        .civ-icon-editor__actions {
          display: flex;
          gap: 0.4rem;
        }
        .civ-icon-editor__actions button {
          padding: 0.3rem 0.6rem;
          border: 1px solid #d1d5db;
          background: #fff;
          border-radius: 4px;
          cursor: pointer;
          font: inherit;
          font-size: 0.8rem;
        }
        .civ-icon-editor__actions button:hover {
          background: #f3f4f6;
        }
        .civ-icon-editor__textarea {
          flex: 1;
          width: 100%;
          font-family: ui-monospace, 'SF Mono', Menlo, monospace;
          font-size: 12px;
          line-height: 1.5;
          tab-size: 2;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          resize: vertical;
          min-height: 220px;
          background: #fafafa;
          color: #111;
        }
        .civ-icon-editor__textarea:focus-visible {
          outline: 2px solid #0050d8;
          outline-offset: 2px;
        }
        .civ-icon-editor__status {
          font-family: ui-monospace, monospace;
          font-size: 11px;
          margin-top: 0.4rem;
          color: #2e8540;
        }
        .civ-icon-editor__status[data-error='true'] {
          color: #d63384;
        }
        .civ-icon-editor__snippets {
          margin-top: 0.5rem;
          font-size: 0.8rem;
        }
        .civ-icon-editor__snippet-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.4rem;
          margin: 0.5rem 0;
        }
        .civ-icon-editor__snippet {
          padding: 0.3rem 0.5rem;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          border-radius: 4px;
          cursor: pointer;
          font: inherit;
          font-size: 0.75rem;
          text-align: left;
        }
        .civ-icon-editor__snippet:hover {
          background: #e0ecff;
          border-color: #0050d8;
        }
        .civ-icon-editor__hint {
          margin: 0.5rem 0 0;
          color: #4b5563;
          line-height: 1.5;
        }
        .civ-icon-editor__hint code {
          background: #f3f4f6;
          padding: 0 0.25em;
          border-radius: 3px;
          font-size: 0.85em;
        }

        .civ-icon-editor__preview {
          background: #fff;
          color: #111;
          transition: background 0.2s, color 0.2s;
        }
        .civ-icon-editor__preview--dark {
          background: #1b1b1b;
          color: #f0f0f0;
          border-color: #444;
        }
        .civ-icon-editor__preview-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .civ-icon-editor__preview-header h3 {
          margin: 0;
          font-size: 0.95rem;
          flex: 1;
        }
        .civ-icon-editor__toggle {
          font-size: 0.8rem;
          display: flex;
          gap: 0.3rem;
          align-items: center;
          cursor: pointer;
        }

        .civ-icon-editor__hero {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          font-size: 128px;
          line-height: 1;
          margin-bottom: 1rem;
          border-radius: 6px;
          position: relative;
        }
        .civ-icon-editor__hero.has-grid {
          background-image:
            linear-gradient(to right, rgba(0, 80, 216, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 80, 216, 0.12) 1px, transparent 1px);
          background-size: 8px 8px;
          background-position: center center;
        }
        .civ-icon-editor__preview--dark .civ-icon-editor__hero.has-grid {
          background-image:
            linear-gradient(to right, rgba(120, 170, 255, 0.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(120, 170, 255, 0.18) 1px, transparent 1px);
        }
        .civ-icon-editor__hero civ-icon {
          font-size: inherit;
        }

        .civ-icon-editor__sizes {
          display: flex;
          gap: 1.25rem;
          align-items: flex-end;
          padding: 0.5rem 0;
          border-top: 1px solid currentColor;
          border-bottom: 1px solid currentColor;
          opacity: 0.95;
        }
        .civ-icon-editor__size-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          opacity: 0.8;
        }

        .civ-icon-editor__color-row {
          display: flex;
          gap: 1rem;
          padding: 0.75rem 0;
        }

      </style>

      <div class="civ-icon-editor">
        ${this._renderPicker()} ${this._renderEditor()} ${this._renderPreview()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-icon-editor': CivIconEditor;
  }
}

const meta: Meta = {
  title: 'Core/Icon/Editor',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Live CSS editor for the icon library. Pick an icon, edit its `::before`/`::after` rules, and watch the preview update. Use **+ New icon** to author a fresh one and copy the CSS into `components.css`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Editor: Story = {
  render: () => html`<civ-icon-editor></civ-icon-editor>`,
};
