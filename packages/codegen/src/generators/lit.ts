/**
 * Lit Web Component Generator
 *
 * Generates a Lit 3 web component from a CivUI component schema.
 * Output matches the hand-written CivUI patterns:
 * - Light DOM (createRenderRoot returns this)
 * - ElementInternals for form participation
 * - Tailwind with civ- prefix
 * - renderLabel/renderHint/renderError helpers from @civui/core
 */

import type { ComponentSchema, PropDef } from '@civui/schema/types';
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
  if (typeof prop.default === 'string') return ` = '${prop.default}'`;
  if (typeof prop.default === 'boolean') return ` = ${prop.default}`;
  if (typeof prop.default === 'number') return ` = ${prop.default}`;
  return '';
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

function generateRenderBody(schema: ComponentSchema): string {
  const lines: string[] = [];

  // Width class resolution
  if (schema.widths) {
    lines.push(`    const widthClass = WIDTH_CLASSES[this.width] || WIDTH_CLASSES['default'];`);
    lines.push(`    const classes = inputClasses({`);
    lines.push(`      extra: [widthClass, 'civ-max-w-full'],`);
    lines.push(`    });`);
    lines.push('');
  }

  lines.push(`    return html\``);
  lines.push(`      <div class="civ-mb-4">`);

  for (const el of schema.renderOrder) {
    switch (el.type) {
      case 'label':
        lines.push(`        \${renderLabel({ label: this.label, inputId: this._inputId, required: this.required })}`);
        break;
      case 'hint':
        lines.push(`        \${renderHint(this._hintId, this.hint)}`);
        break;
      case 'error':
        lines.push(`        \${renderError(this._errorId, this.error)}`);
        break;
      case 'input':
        lines.push(generateInputElement(schema));
        break;
    }
  }

  lines.push(`      </div>`);
  lines.push(`    \`;`);

  return lines.join('\n');
}

function generateInputElement(schema: ComponentSchema): string {
  const lines: string[] = [];
  const classExpr = schema.widths ? '${classes}' : 'civ-input focus-visible:civ-focus-ring';

  lines.push(`        <input`);
  lines.push(`          class="${classExpr}"`);
  lines.push(`          id="\${this._inputId}"`);

  // Bind input-specific props
  const inputBindings = schema.renderOrder.find((e) => e.type === 'input')?.bindings ?? {};
  for (const [attr, prop] of Object.entries(inputBindings)) {
    const propDef = schema.props[prop];
    if (!propDef) continue;

    if (propDef.type === 'boolean') {
      lines.push(`          ?${attr}="\${this.${prop}}"`);
    } else if (attr === 'value') {
      lines.push(`          .value="\${this.value}"`);
    } else if (propDef.type === 'number') {
      lines.push(`          ${attr}="\${this.${prop} && this.${prop} > 0 ? this.${prop} : nothing}"`);
    } else if (propDef.default === '') {
      lines.push(`          ${attr}="\${this.${prop} || nothing}"`);
    } else {
      lines.push(`          ${attr}="\${this.${prop}}"`);
    }
  }

  // Standard form attributes
  lines.push(`          name="\${this.name}"`);
  lines.push(`          aria-required="\${this.required || nothing}"`);
  lines.push(`          aria-describedby="\${this._ariaDescribedBy || nothing}"`);
  lines.push(`          aria-invalid="\${this.error ? 'true' : nothing}"`);

  // Event handlers
  lines.push(`          @input="\${this._handleInput}"`);
  lines.push(`          @change="\${this._handleChange}"`);
  lines.push(`        />`);

  return lines.join('\n');
}

export function generateLit(schema: ComponentSchema): string {
  const className = toPascalCase(schema.name);
  const componentName = toComponentName(schema.name);
  const baseClass = schema.extends;

  const enumTypes = generateEnumTypes(schema);
  const widthMap = generateWidthMap(schema);

  const imports = [
    `import { html, nothing } from 'lit';`,
    `import { customElement, property } from 'lit/decorators.js';`,
    `import { ${baseClass}, renderLabel, renderHint, renderError, inputClasses } from '@civui/core';`,
  ];

  const propDeclarations = Object.entries(schema.props)
    .map(([name, prop]) => {
      const type = tsType(prop, name, componentName);
      const litType = litPropType(prop);
      const def = defaultValue(prop);
      const optional = prop.default === undefined ? '?' : '';
      const reflectOpt = prop.reflect ? ', reflect: true' : '';
      return `  @property({ type: ${litType}${reflectOpt} }) ${name}${optional}: ${type}${def};`;
    })
    .join('\n');

  const renderBody = generateRenderBody(schema);

  const lines = [
    `// Auto-generated by @civui/codegen — do not edit`,
    `// Source: packages/schema/src/components/${schema.name}.schema.ts`,
    '',
    ...imports,
    '',
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
    `  override render() {`,
    renderBody,
    `  }`,
    `}`,
    '',
    `declare global {`,
    `  interface HTMLElementTagNameMap {`,
    `    '${schema.name}': ${className};`,
    `  }`,
    `}`,
  ];

  return lines.join('\n') + '\n';
}
