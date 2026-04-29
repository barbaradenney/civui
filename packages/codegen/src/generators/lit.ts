/**
 * Lit Web Component Generator
 *
 * Generates a Lit 3 web component from a CivUI component schema.
 * Output matches the hand-written CivUI patterns:
 * - Light DOM (createRenderRoot returns this)
 * - ElementInternals for form participation
 * - Tailwind with civ- prefix
 * - renderLabel/renderHint/renderError helpers from @civui/core
 *
 * Supports all 15 component patterns. Simple patterns (text-input, checkbox,
 * toggle, select, form, form-group, fieldset, combobox, memorable-date) use
 * the generic pipeline. Complex patterns (textarea, radio-group, checkbox-group,
 * segmented-control, date-picker, file-upload) dispatch to dedicated generators
 * in lit-patterns.ts that produce complete behavioral code.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ComponentSchema, PropDef, RenderElement } from '@civui/schema/types';
import { toPascalCase, toComponentName } from '../utils/naming.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import {
  generateTextareaLit,
  generateRadioGroupLit,
  generateCheckboxGroupLit,
  generateSegmentedLit,
  generateDatePickerLit,
  generateFileUploadLit,
} from './lit-patterns.js';

function litPropType(prop: PropDef): string {
  switch (prop.type) {
    case 'string':
    case 'enum':
      return 'String';
    case 'boolean':
      return 'Boolean';
    case 'number':
      return 'Number';
    case 'array':
      return 'Array';
    default:
      return 'String';
  }
}

function tsType(prop: PropDef, name: string, componentName: string): string {
  if (prop.type === 'enum' && prop.values) {
    return `${componentName}${toComponentName(`-${name}`)}`;
  }
  if (prop.type === 'array' && prop.items) {
    return `${componentName}Option[]`;
  }
  switch (prop.type) {
    case 'string':
      return 'string';
    case 'boolean':
      return 'boolean';
    case 'number':
      return 'number';
    case 'array':
      return 'unknown[]';
    default:
      return 'string';
  }
}

function defaultValue(prop: PropDef): string {
  if (prop.default === undefined) return '';
  if (Array.isArray(prop.default)) return ' = []';
  if (typeof prop.default === 'string') return ` = '${prop.default}'`;
  if (typeof prop.default === 'boolean') return ` = ${prop.default}`;
  if (typeof prop.default === 'number') return ` = ${prop.default}`;
  return '';
}

function generateInterfaces(schema: ComponentSchema): string {
  const lines: string[] = [];
  const componentName = toComponentName(schema.name);

  for (const [, prop] of Object.entries(schema.props)) {
    if (prop.type === 'array' && prop.items) {
      lines.push(`export interface ${componentName}Option {`);
      for (const [field, fieldDef] of Object.entries(prop.items)) {
        const optional = fieldDef.required ? '' : '?';
        lines.push(`  ${field}${optional}: ${fieldDef.type};`);
      }
      lines.push('}');
      lines.push('');
    }
  }

  return lines.join('\n');
}

function generateEnumTypes(schema: ComponentSchema): string {
  const lines: string[] = [];
  const componentName = toComponentName(schema.name);

  for (const [name, prop] of Object.entries(schema.props)) {
    if (prop.type === 'enum' && prop.values) {
      const typeName = `${componentName}${toComponentName(`-${name}`)}`;
      const union = prop.values.map((v) => `'${v}'`).join(' | ');
      lines.push(`export type ${typeName} = ${union};`);
    }
  }

  return lines.join('\n');
}

function generateWidthMap(schema: ComponentSchema): string {
  if (!schema.widths) return '';
  const componentName = toComponentName(schema.name);
  const typeName = `${componentName}Width`;

  const entries = Object.entries(schema.widths)
    .map(([key, w]) => `  '${key}': '${w.webClass}',`)
    .join('\n');

  return `\nconst WIDTH_CLASSES: Record<${typeName}, string> = {\n${entries}\n};\n`;
}

// ---------------------------------------------------------------------------
// Render element generators
// ---------------------------------------------------------------------------

function renderElement(el: RenderElement, schema: ComponentSchema, indent: string): string {
  const isGroup = schema.isGroup;
  switch (el.type) {
    case 'label':
      if (isGroup) {
        const legendProp = schema.props['legend'] ? 'this.legend' : 'this.label';
        return `${indent}\${renderLegend({ legend: ${legendProp}, required: this.required, textSizeClass: '' })}`;
      }
      return `${indent}\${renderLabel({ label: this.label, inputId: this._inputId, required: this.required })}`;
    case 'hint':
      return `${indent}\${renderHint(this._hintId, this.hint${isGroup ? ', true' : ''})}`;
    case 'error':
      return `${indent}\${renderError(this._errorId, this.error${isGroup ? ', true' : ''})}`;
    case 'input':
      return renderInputElement(schema, indent);
    case 'select':
      return renderSelectElement(schema, indent);
    case 'checkbox':
      return renderCheckboxElement(schema, indent);
    case 'switch':
      return renderSwitchElement(schema, indent);
    case 'container':
      return renderContainer(el, schema, indent);
    case 'slot':
      return `${indent}<div class="${el.bindings?.orientation ? `\${this.orientation === 'horizontal' ? 'civ-group-layout--horizontal' : 'civ-group-layout--vertical'}` : ''}" data-civ-fieldset-content></div>`;
    default:
      return '';
  }
}

function renderInputElement(schema: ComponentSchema, indent: string): string {
  const isTextarea = schema.name === 'civ-textarea';
  const tag = isTextarea ? 'textarea' : 'input';
  const inputBindings = schema.renderOrder.find((e) => e.type === 'input')?.bindings ?? {};

  const lines: string[] = [];

  if (schema.widths) {
    lines.push(`${indent}<${tag}`);
    lines.push(`${indent}  class="\${classes}"`);
  } else {
    const extraClasses = schema.platform?.web?.controlClasses?.join(' ') || 'civ-input focus-visible:civ-focus-ring';
    lines.push(`${indent}<${tag}`);
    lines.push(`${indent}  class="${extraClasses}"`);
  }

  lines.push(`${indent}  id="\${this._inputId}"`);

  for (const [attr, prop] of Object.entries(inputBindings)) {
    const propDef = schema.props[prop];
    if (!propDef) continue;

    if (propDef.type === 'boolean') {
      lines.push(`${indent}  ?${attr}="\${this.${prop}}"`);
    } else if (attr === 'value') {
      lines.push(`${indent}  .value="\${this.value}"`);
    } else if (propDef.type === 'number') {
      lines.push(`${indent}  ${attr}="\${this.${prop} && this.${prop} > 0 ? this.${prop} : nothing}"`);
    } else if (propDef.default === '') {
      lines.push(`${indent}  ${attr}="\${this.${prop} || nothing}"`);
    } else {
      lines.push(`${indent}  ${attr}="\${this.${prop}}"`);
    }
  }

  // Always add .value binding if not already present from schema bindings
  const hasValueBinding = Object.keys(inputBindings).some((k) => k === 'value');
  if (!hasValueBinding) {
    lines.push(`${indent}  name="\${this.name}"`);
    lines.push(`${indent}  .value="\${this.value}"`);
  } else {
    lines.push(`${indent}  name="\${this.name}"`);
  }
  lines.push(`${indent}  ?disabled="\${this.disabled}"`);
  lines.push(`${indent}  ?required="\${this.required}"`);
  lines.push(`${indent}  aria-required="\${this.required || nothing}"`);
  lines.push(`${indent}  aria-describedby="\${this._ariaDescribedBy || nothing}"`);
  lines.push(`${indent}  aria-invalid="\${this.error ? 'true' : nothing}"`);
  lines.push(`${indent}  @input="\${this._handleInput}"`);
  lines.push(`${indent}  @change="\${this._handleChange}"`);

  if (isTextarea) {
    lines.push(`${indent}>\${nothing}</textarea>`);
  } else {
    lines.push(`${indent}/>`);
  }

  return lines.join('\n');
}

function renderSelectElement(schema: ComponentSchema, indent: string): string {
  return [
    `${indent}<select`,
    `${indent}  class="\${classes}"`,
    `${indent}  id="\${this._inputId}"`,
    `${indent}  name="\${this.name}"`,
    `${indent}  .value="\${this.value}"`,
    `${indent}  ?disabled="\${this.disabled}"`,
    `${indent}  ?required="\${this.required}"`,
    `${indent}  aria-required="\${this.required || nothing}"`,
    `${indent}  aria-describedby="\${this._ariaDescribedBy || nothing}"`,
    `${indent}  aria-invalid="\${this.error ? 'true' : nothing}"`,
    `${indent}  @change="\${this._onSelectChange}"`,
    `${indent}>`,
    `${indent}  <option value="">\${this.emptyLabel}</option>`,
    `${indent}  \${this.options.map(`,
    `${indent}    (opt) => html\``,
    `${indent}      <option`,
    `${indent}        value="\${opt.value}"`,
    `${indent}        ?selected="\${opt.value === this.value}"`,
    `${indent}        ?disabled="\${opt.disabled ?? false}"`,
    `${indent}      >`,
    `${indent}        \${opt.label}`,
    `${indent}      </option>`,
    `${indent}    \`,`,
    `${indent}  )}`,
    `${indent}</select>`,
  ].join('\n');
}

function renderCheckboxElement(schema: ComponentSchema, indent: string): string {
  const classes = schema.platform?.web?.controlClasses?.join(' ') || 'civ-check-input focus-visible:civ-focus-ring';

  return [
    `${indent}<input`,
    `${indent}  class="${classes}"`,
    `${indent}  id="\${this._inputId}"`,
    `${indent}  type="checkbox"`,
    `${indent}  name="\${this.name}"`,
    `${indent}  .value="\${this.value}"`,
    `${indent}  .checked="\${this.checked}"`,
    `${indent}  ?disabled="\${this.disabled}"`,
    `${indent}  ?required="\${this.required}"`,
    `${indent}  aria-required="\${this.required || nothing}"`,
    `${indent}  aria-checked="\${this.indeterminate ? 'mixed' : nothing}"`,
    `${indent}  aria-invalid="\${this.error ? 'true' : nothing}"`,
    `${indent}  aria-describedby="\${this._ariaDescribedBy || nothing}"`,
    `${indent}  @change="\${this._onCheckboxChange}"`,
    `${indent}/>`,
  ].join('\n');
}

function renderSwitchElement(schema: ComponentSchema, indent: string): string {
  const classes = schema.platform?.web?.controlClasses?.join(' ') || 'civ-toggle-track focus-visible:civ-focus-ring';

  return [
    `${indent}<button`,
    `${indent}  type="button"`,
    `${indent}  role="switch"`,
    `${indent}  id="\${this._inputId}"`,
    `${indent}  aria-checked="\${this.checked ? 'true' : 'false'}"`,
    `${indent}  aria-required="\${this.required || nothing}"`,
    `${indent}  aria-invalid="\${this.error ? 'true' : nothing}"`,
    `${indent}  aria-describedby="\${this._ariaDescribedBy || nothing}"`,
    `${indent}  ?disabled="\${this.disabled}"`,
    `${indent}  @click="\${this._onToggle}"`,
    `${indent}  class="${classes}"`,
    `${indent}>`,
    `${indent}  <span class="civ-toggle-thumb" style="\${this._thumbStyle}"></span>`,
    `${indent}</button>`,
  ].join('\n');
}

function renderContainer(el: RenderElement, schema: ComponentSchema, indent: string): string {
  const children = el.children || [];
  // Only render non-label children — checkbox/toggle use inline labels, not renderLabel()
  const controlChildren = children.filter((c) => c.type !== 'label');
  const childLines = controlChildren
    .map((child) => renderElement(child, schema, indent + '  '))
    .filter(Boolean);

  // Determine container class based on content
  const hasSwitch = children.some((c) => c.type === 'switch');
  const hasCheckbox = children.some((c) => c.type === 'checkbox');

  if (hasSwitch) {
    return [
      `${indent}<div class="civ-flex civ-items-center civ-gap-3">`,
      ...childLines,
      `${indent}  <div>`,
      `${indent}    <label class="civ-check-label" for="\${this._inputId}">`,
      `${indent}      \${this.label}`,
      `${indent}      \${this.required ? html\`<abbr class="civ-required-mark" title="required">*</abbr>\` : nothing}`,
      `${indent}    </label>`,
      `${indent}    \${this.description ? html\`<span id="\${this._descriptionId}" class="civ-check-description">\${this.description}</span>\` : nothing}`,
      `${indent}  </div>`,
      `${indent}</div>`,
    ].join('\n');
  }

  if (hasCheckbox) {
    return [
      `${indent}<div class="civ-flex civ-items-center">`,
      ...childLines,
      `${indent}  <div>`,
      `${indent}    <label class="civ-check-label" for="\${this._inputId}">`,
      `${indent}      \${this.label}`,
      `${indent}      \${this.required ? html\`<abbr class="civ-required-mark" title="required">*</abbr>\` : nothing}`,
      `${indent}    </label>`,
      `${indent}    \${this.description ? html\`<span id="\${this._descriptionId}" class="civ-check-description">\${this.description}</span>\` : nothing}`,
      `${indent}  </div>`,
      `${indent}</div>`,
    ].join('\n');
  }

  // Fieldset container (radio-group, checkbox-group, fieldset, segmented-control, memorable-date)
  const isFieldset = el.bindings?.tag === 'fieldset';
  if (isFieldset) {
    const role = schema.a11y.role !== 'group' ? ` role="${schema.a11y.role}"` : '';
    const orientation = schema.a11y.ariaAttributes?.['aria-orientation']
      ? ` aria-orientation="${schema.a11y.ariaAttributes['aria-orientation'] === 'horizontal' ? 'horizontal' : `\${this.orientation}`}"`
      : '';
    const allChildLines = children
      .map((child) => renderElement(child, schema, indent + '  '))
      .filter(Boolean);

    return [
      `${indent}<fieldset`,
      `${indent}  class="civ-fieldset"${role}${orientation}`,
      `${indent}  aria-describedby="\${this._ariaDescribedBy || nothing}"`,
      `${indent}  aria-invalid="\${this.error ? 'true' : nothing}"`,
      `${indent}  aria-required="\${this.required || nothing}"`,
      `${indent}  ?disabled="\${this.disabled}"`,
      `${indent}>`,
      ...allChildLines,
      `${indent}</fieldset>`,
    ].join('\n');
  }

  return childLines.join('\n');
}

// ---------------------------------------------------------------------------
// Event handler generation
// ---------------------------------------------------------------------------

function generateEventHandlers(schema: ComponentSchema): string {
  const lines: string[] = [];
  const isBooleanControl = schema.form.valueMode === 'boolean';
  const hasOptions = Object.values(schema.props).some((p) => p.type === 'array' && p.items);
  const isSwitch = schema.renderOrder.some(
    (el) => el.type === 'container' && el.children?.some((c) => c.type === 'switch'),
  );
  const isCheckbox = schema.renderOrder.some(
    (el) => el.type === 'container' && el.children?.some((c) => c.type === 'checkbox'),
  );

  if (isCheckbox) {
    lines.push('');
    lines.push('  private _onCheckboxChange(e: Event): void {');
    lines.push('    const target = e.target as HTMLInputElement;');
    lines.push('    this.checked = target.checked;');
    lines.push('    this.indeterminate = false;');
    lines.push("    dispatch(this, 'civ-input', { checked: this.checked, value: this.value });");
    lines.push("    dispatch(this, 'civ-change', { checked: this.checked, value: this.value });");
    lines.push("    this.sendAnalytics('change', { checked: this.checked });");
    lines.push('  }');
  }

  if (isSwitch) {
    lines.push('');
    lines.push('  private _onToggle(): void {');
    lines.push('    if (this.disabled) return;');
    lines.push('    this.checked = !this.checked;');
    lines.push("    dispatch(this, 'civ-input', { checked: this.checked, value: this.value });");
    lines.push("    dispatch(this, 'civ-change', { checked: this.checked, value: this.value });");
    lines.push("    this.sendAnalytics('change', { checked: this.checked });");
    lines.push('  }');
    lines.push('');
    lines.push('  private get _thumbStyle(): string {');
    lines.push("    return `width: 18px; height: 18px; top: 2px; inset-inline-start: ${this.checked ? '18px' : '2px'};`;");
    lines.push('  }');
  }

  if (hasOptions) {
    lines.push('');
    lines.push('  private _onSelectChange(e: Event): void {');
    lines.push('    const target = e.target as HTMLSelectElement;');
    lines.push('    this.value = target.value;');
    lines.push("    dispatch(this, 'civ-input', { value: this.value });");
    lines.push("    dispatch(this, 'civ-change', { value: this.value });");
    lines.push("    this.sendAnalytics('change');");
    lines.push('  }');
  }

  if (isBooleanControl) {
    lines.push('');
    lines.push('  protected override _syncFormValue(): void {');
    lines.push('    this.updateFormValue(this.checked ? this.value : null);');
    lines.push('  }');
    lines.push('');
    lines.push('  protected override _updateValidity(): void {');
    lines.push("    if (typeof this._internals?.setValidity !== 'function') return;");
    lines.push(`    const anchor = this.querySelector('${isSwitch ? 'button' : 'input'}') as HTMLElement | null;`);
    lines.push('    if (this.required && !this.checked) {');
    lines.push('      this._internals.setValidity(');
    lines.push('        { valueMissing: true },');
    lines.push("        this.error || interpolate(this.requiredMessage, { label: this.label || 'This field' }),");
    lines.push('        anchor ?? undefined,');
    lines.push('      );');
    lines.push('    } else {');
    lines.push('      this._internals.setValidity({});');
    lines.push('    }');
    lines.push('  }');
    lines.push('');
    lines.push('  override formResetCallback(): void {');
    lines.push('    this.checked = this._defaultChecked;');
    if (isCheckbox) {
      lines.push('    this.indeterminate = false;');
    }
    lines.push("    this.error = '';");
    lines.push("    this.updateFormValue(this._defaultChecked ? this.value : null);");
    lines.push("    dispatch(this, 'civ-reset');");
    lines.push('  }');
  }

  // describedBy override if component has description
  if (schema.props['description']) {
    lines.push('');
    lines.push('  protected override get _ariaDescribedBy(): string {');
    lines.push('    const ids: string[] = [];');
    lines.push('    if (this.description) ids.push(this._descriptionId);');
    lines.push('    if (this.hint) ids.push(this._hintId);');
    lines.push('    if (this.error) ids.push(this._errorId);');
    lines.push("    return ids.join(' ') || '';");
    lines.push('  }');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Render body
// ---------------------------------------------------------------------------

function generateRenderBody(schema: ComponentSchema): string {
  const lines: string[] = [];
  const isBooleanControl = schema.form.valueMode === 'boolean';
  const hasTile = schema.props['tile'] !== undefined;
  const wrapperClass = isBooleanControl ? 'civ-mb-2' : 'civ-mb-4';

  // Width class resolution
  if (schema.widths) {
    lines.push(`    const widthClass = WIDTH_CLASSES[this.width] || WIDTH_CLASSES['default'];`);
    lines.push(`    const classes = inputClasses({`);
    lines.push(`      extra: [widthClass, 'civ-max-w-full'],`);
    lines.push(`    });`);
    lines.push('');
  } else if (schema.platform?.web?.controlClasses) {
    // Extract extra classes beyond the defaults provided by inputClasses()
    const extraClasses = schema.platform.web.controlClasses
      .filter((c: string) => c !== 'civ-input' && !c.includes('civ-focus-ring'));
    if (extraClasses.length > 0) {
      lines.push(`    const classes = inputClasses({`);
      lines.push(`      extra: [${extraClasses.map((c: string) => `'${c}'`).join(', ')}],`);
      lines.push(`    });`);
      lines.push('');
    }
  }

  if (hasTile) {
    lines.push(`    const content = html\``);
    // Render elements inside content template
    for (const el of schema.renderOrder) {
      lines.push(renderElement(el, schema, '      '));
    }
    lines.push(`    \`;`);
    lines.push('');
    lines.push(`    return html\``);
    lines.push(`      <div class="${wrapperClass} \${this.tile ? 'civ-check-tile' : ''}" data-civ-tile="\${this.tile || nothing}">`);
    lines.push(`        \${content}`);
    lines.push(`      </div>`);
    lines.push(`    \`;`);
  } else {
    lines.push(`    return html\``);
    lines.push(`      <div class="${wrapperClass}">`);
    for (const el of schema.renderOrder) {
      lines.push(renderElement(el, schema, '        '));
    }
    lines.push(`      </div>`);
    lines.push(`    \`;`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Fieldset generator (requires child-moving logic for Light DOM)
// ---------------------------------------------------------------------------

function generateFieldsetLit(schema: ComponentSchema): string {
  return `// Auto-generated by @civui/codegen — do not edit
// Source: packages/schema/src/components/${schema.name}.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, renderLegend, renderHint, renderError } from '@civui/core';

/**
 * CivUI Fieldset
 *
 * ${schema.description}
 *
 * In Light DOM, <slot> does not project children. This component
 * moves child elements into the rendered <fieldset> in updated()
 * so that native disabled cascade works correctly.
 *
 * @element ${schema.name}
 */
@customElement('${schema.name}')
export class CivFieldset extends CivBaseElement {
  @property({ type: String }) legend = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) error = '';
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');
  private _childrenMoved = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this._childrenMoved = false;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (!this._childrenMoved) {
      this._moveChildrenIntoFieldset();
    }
  }

  private _moveChildrenIntoFieldset(): void {
    const fieldset = this.querySelector('fieldset');
    if (!fieldset) return;

    const contentContainer = fieldset.querySelector('[data-civ-fieldset-content]');
    if (!contentContainer) return;

    const children = Array.from(this.childNodes).filter(
      (node) => node !== fieldset && !(node instanceof Comment),
    );
    for (const child of children) {
      contentContainer.appendChild(child);
    }
    this._childrenMoved = true;
  }

  override render() {
    const describedBy = [
      this.hint ? this._hintId : '',
      this.error ? this._errorId : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html\`
      <fieldset
        class="civ-fieldset"
        aria-describedby="\${describedBy || nothing}"
        ?disabled="\${this.disabled}"
      >
        \${renderLegend({ legend: this.legend, required: this.required, textSizeClass: '' })}
        \${renderHint(this._hintId, this.hint, true)}
        \${renderError(this._errorId, this.error, true)}
        <div data-civ-fieldset-content></div>
      </fieldset>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    '${schema.name}': CivFieldset;
  }
}
`;
}

// ---------------------------------------------------------------------------
// Form Group generator (requires ARIA wiring to child inputs)
// ---------------------------------------------------------------------------

function generateFormGroupLit(schema: ComponentSchema): string {
  return `// Auto-generated by @civui/codegen — do not edit
// Source: packages/schema/src/components/${schema.name}.schema.ts

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, renderLabel, renderHint, renderError } from '@civui/core';

const FORM_INPUT_SELECTOR = 'input, select, textarea';

/**
 * CivUI FormGroup
 *
 * ${schema.description}
 *
 * @element ${schema.name}
 */
@customElement('${schema.name}')
export class CivFormGroup extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) error = '';
  @property({ type: String, attribute: 'input-id' }) inputId = '';
  @property({ type: Boolean, reflect: true }) required = false;

  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('hint') || changed.has('error') || changed.has('required')) {
      this._wireAriaDescribedBy();
    }
    if (changed.has('error') && this.error) {
      this.announce(this.error, 'assertive');
    }
  }

  private _wireAriaDescribedBy(): void {
    const ids = [
      this.hint ? this._hintId : '',
      this.error ? this._errorId : '',
    ]
      .filter(Boolean)
      .join(' ');

    const input = this.querySelector(FORM_INPUT_SELECTOR) as HTMLElement | null;
    if (!input) return;

    if (ids) {
      input.setAttribute('aria-describedby', ids);
    } else {
      input.removeAttribute('aria-describedby');
    }

    if (this.error) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }

    if (this.required) {
      input.setAttribute('aria-required', 'true');
    } else {
      input.removeAttribute('aria-required');
    }
  }

  override render() {
    return html\`
      <div class="civ-mb-4">
        \${renderLabel({ label: this.label, inputId: this.inputId, required: this.required })}
        \${renderHint(this._hintId, this.hint)}
        \${renderError(this._errorId, this.error)}
      </div>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    '${schema.name}': CivFormGroup;
  }
}
`;
}

// ---------------------------------------------------------------------------
// Form generator (complex validation/summary logic — reads reference impl)
// ---------------------------------------------------------------------------

function generateFormLit(schema: ComponentSchema): string {
  // The form component has deeply nested template literals (html`` inside html``)
  // that cannot be cleanly generated via string interpolation. Instead, we read
  // the reference implementation from the forms package.
  const refPath = resolve(__dirname, '../../..', 'forms/src/form/civ-form.ts');
  try {
    return readFileSync(refPath, 'utf-8');
  } catch {
    // Fallback: return a minimal scaffold
    return [
      '// Auto-generated by @civui/codegen — do not edit',
      `// Source: packages/schema/src/components/${schema.name}.schema.ts`,
      '// Note: form component requires manual implementation (complex validation logic)',
      '',
      "import { html, nothing } from 'lit';",
      "import { customElement, property } from 'lit/decorators.js';",
      "import { CivBaseElement } from '@civui/core';",
      '',
      `@customElement('${schema.name}')`,
      'export class CivForm extends CivBaseElement {',
      "  @property({ type: String }) action = '';",
      "  @property({ type: String }) method: 'get' | 'post' = 'post';",
      "  @property({ type: String, attribute: 'form-label' }) formLabel = '';",
      '',
      '  override render() { return nothing; }',
      '}',
      '',
      'declare global {',
      '  interface HTMLElementTagNameMap {',
      `    '${schema.name}': CivForm;`,
      '  }',
      '}',
      '',
    ].join('\n');
  }
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export function generateLit(schema: ComponentSchema): string {
  // Dispatch complex patterns to dedicated generators
  switch (schema.name) {
    case 'civ-textarea': return generateTextareaLit(schema);
    case 'civ-radio-group': return generateRadioGroupLit(schema);
    case 'civ-checkbox-group': return generateCheckboxGroupLit(schema);
    case 'civ-segmented-control': return generateSegmentedLit(schema);
    case 'civ-date-picker': return generateDatePickerLit(schema);
    case 'civ-file-upload': return generateFileUploadLit(schema);
    case 'civ-fieldset': return generateFieldsetLit(schema);
    case 'civ-form-group': return generateFormGroupLit(schema);
    case 'civ-form': return generateFormLit(schema);
  }

  // Simple patterns use the generic pipeline
  const className = toPascalCase(schema.name);
  const componentName = toComponentName(schema.name);
  const baseClass = schema.extends;
  const isBooleanControl = schema.form.valueMode === 'boolean';
  const hasOptions = Object.values(schema.props).some((p) => p.type === 'array' && p.items);
  const hasDescription = schema.props['description'] !== undefined;

  const enumTypes = generateEnumTypes(schema);
  const interfaces = generateInterfaces(schema);
  const widthMap = generateWidthMap(schema);

  // Build imports
  const coreImports = [baseClass];
  if (schema.isGroup) {
    coreImports.push('renderLegend');
  } else {
    coreImports.push('renderLabel');
  }
  coreImports.push('renderHint', 'renderError');
  if (schema.widths || schema.platform?.web?.controlClasses) {
    coreImports.push('inputClasses');
  }

  if (isBooleanControl || hasOptions) {
    coreImports.push('dispatch');
  }
  if (isBooleanControl) {
    coreImports.push('interpolate');
  }

  const imports = [
    `import { html, nothing } from 'lit';`,
    `import { customElement, property } from 'lit/decorators.js';`,
    `import { ${coreImports.join(', ')} } from '@civui/core';`,
  ];

  // Build property declarations
  const propDeclarations = Object.entries(schema.props)
    .map(([name, prop]) => {
      const type = tsType(prop, name, componentName);
      const litType = litPropType(prop);
      const def = defaultValue(prop);
      const optional = prop.default === undefined ? '?' : '';
      const reflectOpt = prop.reflect ? ', reflect: true' : '';
      const attrOpt = prop.attribute ? `, attribute: '${prop.attribute}'` : '';
      return `  @property({ type: ${litType}${reflectOpt}${attrOpt} }) ${name}${optional}: ${type}${def};`;
    })
    .join('\n');

  // Private fields
  const privateFields: string[] = [];
  if (isBooleanControl) {
    privateFields.push('  private _defaultChecked = false;');
  }
  if (hasDescription) {
    privateFields.push("  private _descriptionId = this.generateId('desc');");
  }

  // connectedCallback override
  const connectedCallback = isBooleanControl
    ? [
        '',
        '  override connectedCallback(): void {',
        '    super.connectedCallback();',
        "    if (!this.value) this.value = 'on';",
        '    this._defaultChecked = this.checked;',
        '  }',
      ].join('\n')
    : '';

  // updated override for select
  const updatedOverride = hasOptions
    ? [
        '',
        '  override updated(changed: Map<string, unknown>): void {',
        '    super.updated(changed);',
        "    if (changed.has('options') && this.value) {",
        "      const select = this.querySelector('select') as HTMLSelectElement | null;",
        '      if (select && select.value !== this.value) {',
        '        select.value = this.value;',
        '      }',
        '    }',
        '  }',
      ].join('\n')
    : '';

  const renderBody = generateRenderBody(schema);
  const eventHandlers = generateEventHandlers(schema);

  const lines = [
    `// Auto-generated by @civui/codegen — do not edit`,
    `// Source: packages/schema/src/components/${schema.name}.schema.ts`,
    '',
    ...imports,
    '',
    interfaces,
    enumTypes,
    widthMap,
    `/**`,
    ` * CivUI ${componentName}`,
    ` *`,
    ` * ${schema.description}`,
    ` *`,
    ` * @element ${schema.name}`,
    ` */`,
    `@customElement('${schema.name}')`,
    `export class ${className} extends ${baseClass} {`,
    propDeclarations,
    '',
    ...(privateFields.length > 0 ? [...privateFields, ''] : []),
    connectedCallback,
    `  override render() {`,
    renderBody,
    `  }`,
    updatedOverride,
    eventHandlers,
    `}`,
    '',
    `declare global {`,
    `  interface HTMLElementTagNameMap {`,
    `    '${schema.name}': ${className};`,
    `  }`,
    `}`,
  ];

  return lines.filter((l) => l !== undefined).join('\n') + '\n';
}
