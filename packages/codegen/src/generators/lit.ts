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
 * Supports component patterns:
 * - text-input / textarea (standard label → hint → error → control)
 * - checkbox (hint → error → inline control+label, boolean form value)
 * - toggle (inline control+label → hint → error, switch role, boolean form value)
 * - select (label → hint → error → native select with options)
 */

import type { ComponentSchema, PropDef, RenderElement } from '@civui/schema/types';
import { toPascalCase, toComponentName } from '../utils/naming.js';

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
  switch (el.type) {
    case 'label':
      return `${indent}\${renderLabel({ label: this.label, inputId: this._inputId, required: this.required })}`;
    case 'hint':
      return `${indent}\${renderHint(this._hintId, this.hint)}`;
    case 'error':
      return `${indent}\${renderError(this._errorId, this.error)}`;
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

  lines.push(`${indent}  name="\${this.name}"`);
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
  const classes = schema.platform?.web?.controlClasses?.join(' ') || 'civ-input focus-visible:civ-focus-ring';

  return [
    `${indent}<select`,
    `${indent}  class="${classes}"`,
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
    `${indent}  type="checkbox"`,
    `${indent}  id="\${this._inputId}"`,
    `${indent}  .checked="\${this.checked}"`,
    `${indent}  ?disabled="\${this.disabled}"`,
    `${indent}  ?required="\${this.required}"`,
    `${indent}  aria-describedby="\${this._ariaDescribedBy || nothing}"`,
    `${indent}  aria-invalid="\${this.error ? 'true' : nothing}"`,
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
      `${indent}<div class="civ-flex civ-items-start">`,
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
// Main generator
// ---------------------------------------------------------------------------

export function generateLit(schema: ComponentSchema): string {
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
  const coreImports = [baseClass, 'renderLabel', 'renderHint', 'renderError'];
  if (schema.widths || schema.platform?.web?.controlClasses) {
    coreImports.push('inputClasses');
  }

  const imports = [
    `import { html, nothing } from 'lit';`,
    `import { customElement, property } from 'lit/decorators.js';`,
    `import { ${coreImports.join(', ')} } from '@civui/core';`,
  ];

  if (isBooleanControl || hasOptions) {
    imports.push(`import { dispatch } from '@civui/core/utils/events.js';`);
  }
  if (isBooleanControl) {
    imports.push(`import { interpolate } from '@civui/core/utils/interpolate.js';`);
  }

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
