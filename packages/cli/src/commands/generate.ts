import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { findRoot, toPascalCase, success, header } from '../utils.js';

/**
 * civds generate component <name>
 *
 * Scaffolds a new web component with:
 * - Component source (.ts)
 * - Unit test (.test.ts)
 * - Storybook story (.stories.ts)
 * - Index barrel file
 */
export async function generate(
  type: string,
  args: string[],
  _flags: Record<string, boolean | string>,
): Promise<void> {
  if (type !== 'component') {
    throw new Error(`Unknown generate type: "${type}". Supported: component`);
  }

  const name = args[0];
  if (!name) {
    throw new Error('Component name is required. Usage: civds generate component <name>');
  }

  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    throw new Error('Component name must be kebab-case (e.g., date-range-picker)');
  }

  header(`Generating component: civds-${name}`);

  const root = findRoot();
  const className = `Civds${toPascalCase(name)}`;
  const tagName = `civds-${name}`;
  const dir = resolve(root, 'packages/forms/src', name);

  if (existsSync(dir)) {
    throw new Error(`Component directory already exists: ${dir}`);
  }

  mkdirSync(dir, { recursive: true });

  // Component source
  writeFileSync(
    resolve(dir, `${tagName}.ts`),
    componentTemplate(className, tagName),
  );
  success(`Created ${tagName}.ts`);

  // Test file
  writeFileSync(
    resolve(dir, `${tagName}.test.ts`),
    testTemplate(className, tagName),
  );
  success(`Created ${tagName}.test.ts`);

  // Stories file
  writeFileSync(
    resolve(dir, `${tagName}.stories.ts`),
    storiesTemplate(tagName, name),
  );
  success(`Created ${tagName}.stories.ts`);

  // Index file
  writeFileSync(
    resolve(dir, 'index.ts'),
    `export { ${className} } from './${tagName}.js';\n`,
  );
  success(`Created index.ts`);

  console.log(`\nComponent scaffolded at: packages/forms/src/${name}/`);
  console.log(`\nNext steps:`);
  console.log(`  1. Implement the component in ${tagName}.ts`);
  console.log(`  2. Add exports to packages/forms/src/index.ts`);
  console.log(`  3. Write tests and stories`);
  console.log(`  4. Run: civds build forms && civds test --unit`);
}

function componentTemplate(className: string, tagName: string): string {
  return `import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivdsFormElement } from '@civds/core';

/**
 * CivDS ${className.replace('Civds', '')}
 *
 * @element ${tagName}
 *
 * @prop {string} label - Label text
 * @prop {string} name - Form field name
 * @prop {string} value - Current value
 * @prop {string} hint - Hint text
 * @prop {string} error - Error message
 * @prop {boolean} required - Whether the field is required
 * @prop {boolean} disabled - Whether the field is disabled
 *
 * @fires civds-change - When the value changes
 */
@customElement('${tagName}')
export class ${className} extends CivdsFormElement {
  override render() {
    return html\`
      <div class="civds-mb-4">
        \${this.label
          ? html\`
              <label
                class="civds-block civds-mb-1 civds-text-base-darkest civds-font-bold civds-text-base"
                for="\${this._inputId}"
              >
                \${this.label}
                \${this.required
                  ? html\`<abbr class="civds-text-error civds-no-underline" title="required">*</abbr>\`
                  : nothing}
              </label>
            \`
          : nothing}
        \${this.hint
          ? html\`<span class="civds-block civds-mb-1 civds-text-sm civds-text-base" id="\${this._hintId}">\${this.hint}</span>\`
          : nothing}
        \${this.error
          ? html\`<span class="civds-block civds-mb-1 civds-text-sm civds-text-error civds-font-bold" id="\${this._errorId}" role="alert">\${this.error}</span>\`
          : nothing}

        <input
          id="\${this._inputId}"
          type="text"
          class="civds-block civds-w-full civds-border civds-border-base-light civds-rounded civds-px-2 civds-py-1.5 civds-text-base"
          .value="\${this.value}"
          ?disabled="\${this.disabled}"
          ?required="\${this.required}"
          aria-describedby="\${this._ariaDescribedBy || nothing}"
          aria-invalid="\${this.error ? 'true' : 'false'}"
          @input="\${this._handleInput}"
          @change="\${this._handleChange}"
        />
      </div>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    '${tagName}': ${className};
  }
}
`;
}

function testTemplate(_className: string, tagName: string): string {
  return `import { describe, it, expect, afterEach } from 'vitest';
import './${tagName}.js';

function createFixture(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as HTMLElement;
}

function cleanup(): void {
  document.body.innerHTML = '';
}

async function waitForUpdate(el: HTMLElement): Promise<void> {
  if ('updateComplete' in el) await (el as any).updateComplete;
}

afterEach(cleanup);

describe('${tagName}', () => {
  it('renders with a label', async () => {
    const el = createFixture('<${tagName} label="Test"></${tagName}>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Test');
  });

  it('renders an input element', async () => {
    const el = createFixture('<${tagName} label="Test" name="test"></${tagName}>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = createFixture('<${tagName} label="Test"></${tagName}>');
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('${tagName}') as any;
    expect(Ctor.formAssociated).toBe(true);
  });
});
`;
}

function storiesTemplate(tagName: string, name: string): string {
  const title = name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

  return `import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './${tagName}.js';

const meta: Meta = {
  title: 'Forms/${title}',
  component: '${tagName}',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html\`
    <${tagName} label="${title}" name="${name}"></${tagName}>
  \`,
};

export const WithHint: Story = {
  render: () => html\`
    <${tagName} label="${title}" name="${name}" hint="Helpful hint text"></${tagName}>
  \`,
};

export const WithError: Story = {
  render: () => html\`
    <${tagName} label="${title}" name="${name}" error="This field has an error" required></${tagName}>
  \`,
};

export const Disabled: Story = {
  render: () => html\`
    <${tagName} label="${title}" name="${name}" disabled></${tagName}>
  \`,
};
`;
}
