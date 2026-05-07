#!/usr/bin/env npx tsx
/**
 * CivUI Schema Parity Check
 *
 * Validates that the canonical Lit web implementation of each component
 * matches the platform-neutral schema in `@civui/schema`. Schemas are
 * the contract that contractors / new platform implementations are
 * expected to satisfy — this tool fails the build when the Lit source
 * drifts from the schema.
 *
 * Coverage grows incrementally as schemas are synced and added —
 * extend `COVERED_COMPONENTS` below to include a component once
 * its schema matches the Lit source.
 *
 * Usage:
 *   npx tsx tools/schema-parity.ts          # report drift, exit 1 on any drift
 *   npx tsx tools/schema-parity.ts --strict # also fail on missing schemas
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const ROOT = join(import.meta.dirname, '..');

interface SchemaProp {
  name: string;
  type: string;
  default?: string | number | boolean;
  attribute?: string;
  /** Web-specific prop that the platform parity check should skip */
  webOnly?: boolean;
}

interface LitProp {
  name: string;
  type: string;
  default?: string;
  attribute?: string;
}

interface ComponentEvent {
  name: string;
  /** Sorted list of keys in the event detail object (e.g. ['value'] for {value: '...'}) */
  detailKeys: string[];
  /**
   * True when at least one dispatch site uses a non-inline detail
   * (e.g. `dispatch(this, 'civ-input', detail)` with a variable, or
   * a spread inside the literal). The shape is unknowable from
   * source, so the diff skips detail-key comparison for this event.
   */
  detailUnknown?: boolean;
}

interface ComponentSpec {
  /** Schema file name without extension (e.g. "civ-text-input") */
  name: string;
  /** Path to the canonical Lit source, relative to repo root */
  source: string;
  /** Whether this component extends a boolean form base (checkbox/toggle) — adds checked/description as inherited props */
  isBoolean?: boolean;
  /** Optional path to the iOS SwiftUI struct (relative to repo root). When set, platform parity validates prop coverage */
  ios?: string;
  /** Optional path to the Android Compose function */
  android?: string;
  /** Optional path to the Drupal SDC `<name>.component.yml` */
  drupal?: string;
}

const COVERED_COMPONENTS: ComponentSpec[] = [
  { name: 'civ-text-input',        source: 'packages/inputs/src/text-input/civ-text-input.ts',                                        ios: 'packages/ios/Sources/CivUI/CivTextInput.swift',        android: 'packages/android/src/main/kotlin/gov/civui/components/CivTextInput.kt',        drupal: 'packages/drupal/civui/components/text-input/text-input.component.yml' },
  { name: 'civ-checkbox',          source: 'packages/controls/src/checkbox/civ-checkbox.ts',           isBoolean: true,                ios: 'packages/ios/Sources/CivUI/CivCheckbox.swift',         android: 'packages/android/src/main/kotlin/gov/civui/components/CivCheckbox.kt',         drupal: 'packages/drupal/civui/components/checkbox/checkbox.component.yml' },
  { name: 'civ-radio-group',       source: 'packages/controls/src/radio/civ-radio-group.ts',                                          ios: 'packages/ios/Sources/CivUI/CivRadio.swift',                                                                                                drupal: 'packages/drupal/civui/components/radio-group/radio-group.component.yml' },
  { name: 'civ-yes-no',            source: 'packages/inputs/src/yes-no/civ-yes-no.ts',                                                ios: 'packages/ios/Sources/CivUI/CivYesNo.swift',            android: 'packages/android/src/main/kotlin/gov/civui/components/CivYesNo.kt',            drupal: 'packages/drupal/civui/components/yes-no/yes-no.component.yml' },
  { name: 'civ-checkbox-group',    source: 'packages/controls/src/checkbox/civ-checkbox-group.ts',                                    ios: 'packages/ios/Sources/CivUI/CivCheckboxGroup.swift',    android: 'packages/android/src/main/kotlin/gov/civui/components/CivCheckboxGroup.kt',    drupal: 'packages/drupal/civui/components/checkbox-group/checkbox-group.component.yml' },
  { name: 'civ-combobox',          source: 'packages/inputs/src/combobox/civ-combobox.ts',                                            ios: 'packages/ios/Sources/CivUI/CivCombobox.swift',         android: 'packages/android/src/main/kotlin/gov/civui/components/CivCombobox.kt',         drupal: 'packages/drupal/civui/components/combobox/combobox.component.yml' },
  { name: 'civ-date-picker',       source: 'packages/inputs/src/date-picker/civ-date-picker.ts',                                      ios: 'packages/ios/Sources/CivUI/CivDatePicker.swift',       android: 'packages/android/src/main/kotlin/gov/civui/components/CivDatePicker.kt',       drupal: 'packages/drupal/civui/components/date-picker/date-picker.component.yml' },
  { name: 'civ-file-upload',       source: 'packages/inputs/src/file-upload/civ-file-upload.ts',                                      ios: 'packages/ios/Sources/CivUI/CivFileUpload.swift',       android: 'packages/android/src/main/kotlin/gov/civui/components/CivFileUpload.kt',       drupal: 'packages/drupal/civui/components/file-upload/file-upload.component.yml' },
  { name: 'civ-memorable-date',    source: 'packages/inputs/src/date-input/civ-memorable-date.ts',                                    ios: 'packages/ios/Sources/CivUI/CivMemorableDate.swift',    android: 'packages/android/src/main/kotlin/gov/civui/components/CivMemorableDate.kt',    drupal: 'packages/drupal/civui/components/memorable-date/memorable-date.component.yml' },
  { name: 'civ-segmented-control', source: 'packages/controls/src/segmented-control/civ-segmented-control.ts',                       ios: 'packages/ios/Sources/CivUI/CivSegmentedControl.swift', android: 'packages/android/src/main/kotlin/gov/civui/components/CivSegmentedControl.kt', drupal: 'packages/drupal/civui/components/segmented-control/segmented-control.component.yml' },
  { name: 'civ-select',            source: 'packages/inputs/src/select/civ-select.ts',                                                ios: 'packages/ios/Sources/CivUI/CivSelect.swift',           android: 'packages/android/src/main/kotlin/gov/civui/components/CivSelect.kt',           drupal: 'packages/drupal/civui/components/select/select.component.yml' },
  { name: 'civ-textarea',          source: 'packages/inputs/src/textarea/civ-textarea.ts',                                            ios: 'packages/ios/Sources/CivUI/CivTextarea.swift',         android: 'packages/android/src/main/kotlin/gov/civui/components/CivTextarea.kt',         drupal: 'packages/drupal/civui/components/textarea/textarea.component.yml' },
  { name: 'civ-toggle',            source: 'packages/inputs/src/toggle/civ-toggle.ts',                 isBoolean: true,                ios: 'packages/ios/Sources/CivUI/CivToggle.swift',           android: 'packages/android/src/main/kotlin/gov/civui/components/CivToggle.kt',           drupal: 'packages/drupal/civui/components/toggle/toggle.component.yml' },
  { name: 'civ-address',           source: 'packages/compound/src/address/civ-address.ts',                                            ios: 'packages/ios/Sources/CivUI/CivAddress.swift',          android: 'packages/android/src/main/kotlin/gov/civui/components/CivAddress.kt',          drupal: 'packages/drupal/civui/components/address/address.component.yml' },
  { name: 'civ-repeater',          source: 'packages/form-patterns/src/repeater/civ-repeater.ts',                                     ios: 'packages/ios/Sources/CivUI/CivRepeater.swift',         android: 'packages/android/src/main/kotlin/gov/civui/components/CivRepeater.kt',         drupal: 'packages/drupal/civui/components/repeater/repeater.component.yml' },
  { name: 'civ-name',              source: 'packages/compound/src/name/civ-name.ts',                                                  ios: 'packages/ios/Sources/CivUI/CivName.swift',             android: 'packages/android/src/main/kotlin/gov/civui/components/CivName.kt',             drupal: 'packages/drupal/civui/components/name/name.component.yml' },
  { name: 'civ-direct-deposit',    source: 'packages/compound/src/direct-deposit/civ-direct-deposit.ts',                              ios: 'packages/ios/Sources/CivUI/CivDirectDeposit.swift',    android: 'packages/android/src/main/kotlin/gov/civui/components/CivDirectDeposit.kt',    drupal: 'packages/drupal/civui/components/direct-deposit/direct-deposit.component.yml' },
  { name: 'civ-signature',         source: 'packages/compound/src/signature/civ-signature.ts',                                        ios: 'packages/ios/Sources/CivUI/CivSignature.swift',        android: 'packages/android/src/main/kotlin/gov/civui/components/CivSignature.kt',        drupal: 'packages/drupal/civui/components/signature/signature.component.yml' },
  { name: 'civ-form-step',         source: 'packages/form-patterns/src/form-step/civ-form-step.ts',                                   ios: 'packages/ios/Sources/CivUI/CivFormStep.swift',         android: 'packages/android/src/main/kotlin/gov/civui/components/CivFormStep.kt',         drupal: 'packages/drupal/civui/components/form-step/form-step.component.yml' },
  { name: 'civ-progress-steps',    source: 'packages/form-patterns/src/progress/civ-progress-steps.ts',                               ios: 'packages/ios/Sources/CivUI/CivProgressSteps.swift',    android: 'packages/android/src/main/kotlin/gov/civui/components/CivProgressSteps.kt' },
  { name: 'civ-progress-percent',  source: 'packages/form-patterns/src/progress/civ-progress-percent.ts',                             ios: 'packages/ios/Sources/CivUI/CivProgressPercent.swift',  android: 'packages/android/src/main/kotlin/gov/civui/components/CivProgressPercent.kt',  drupal: 'packages/drupal/civui/components/progress-percent/progress-percent.component.yml' },
  { name: 'civ-race-ethnicity',    source: 'packages/compound/src/race-ethnicity/civ-race-ethnicity.ts',                              ios: 'packages/ios/Sources/CivUI/CivRaceEthnicity.swift',    android: 'packages/android/src/main/kotlin/gov/civui/components/CivRaceEthnicity.kt',    drupal: 'packages/drupal/civui/components/race-ethnicity/race-ethnicity.component.yml' },
  { name: 'civ-marriage-history',  source: 'packages/compound/src/marriage-history/civ-marriage-history.ts',                          ios: 'packages/ios/Sources/CivUI/CivMarriageHistory.swift',  android: 'packages/android/src/main/kotlin/gov/civui/components/CivMarriageHistory.kt',  drupal: 'packages/drupal/civui/components/marriage-history/marriage-history.component.yml' },
  { name: 'civ-relationship',      source: 'packages/compound/src/relationship/civ-relationship.ts',                                  ios: 'packages/ios/Sources/CivUI/CivRelationship.swift',     android: 'packages/android/src/main/kotlin/gov/civui/components/CivRelationship.kt',     drupal: 'packages/drupal/civui/components/relationship/relationship.component.yml' },
  { name: 'civ-service-history',   source: 'packages/compound/src/service-history/civ-service-history.ts',                            ios: 'packages/ios/Sources/CivUI/CivServiceHistory.swift',   android: 'packages/android/src/main/kotlin/gov/civui/components/CivServiceHistory.kt',   drupal: 'packages/drupal/civui/components/service-history/service-history.component.yml' },
  { name: 'civ-filterable-list',   source: 'packages/layout/src/filterable-list/civ-filterable-list.ts',                                ios: 'packages/ios/Sources/CivUI/CivFilterableList.swift',   android: 'packages/android/src/main/kotlin/gov/civui/components/CivFilterableList.kt',   drupal: 'packages/drupal/civui/components/filterable-list/filterable-list.component.yml' },
];

/**
 * Props inherited from CivFormElement / CivBaseElement that aren't
 * worth declaring in every schema. The schema-parity check ignores
 * these on the Lit side so schemas don't need to repeat them.
 */
const INHERITED_FORM_PROPS = new Set([
  'label',
  'name',
  'value',
  'hint',
  'error',
  'required',
  'requiredMessage',
  'disabled',
  'readonly',
  'touched',
  'disableAnalytics',
]);

const INHERITED_BOOLEAN_PROPS = new Set(['checked', 'description']);

/**
 * Events fired by the base form classes that every form component
 * inherits. Skip them on both sides so schemas only have to declare
 * truly component-specific events.
 */
const INHERITED_FORM_EVENTS = new Set(['civ-analytics', 'civ-reset']);

/**
 * Events that the base CivFormElement class dispatches via the
 * `_handleInput` / `_handleChange` helpers. Subclasses that delegate
 * to those helpers don't need to dispatch these explicitly. The
 * schema can still declare them — we just don't flag them as
 * "removed from source" when the subclass file has no dispatch call.
 */
const BASE_DISPATCHED_EVENTS = new Set(['civ-input', 'civ-change']);

function parseLitProps(filePath: string, isBoolean: boolean): LitProp[] {
  const src = readFileSync(filePath, 'utf-8');
  const props: LitProp[] = [];
  // Capture everything from `@property({ ... })` through the next ; or newline,
  // including optional access modifiers and a default-value initializer.
  const regex = /@property\(\{([^}]*)\}\)\s+(?:public\s+|private\s+|protected\s+|override\s+)*(\w+)(?:[?!])?(?:\s*:\s*[^=;\n]+)?(?:\s*=\s*([^;\n]+))?/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(src)) !== null) {
    const opts = m[1];
    const name = m[2];
    const dflt = m[3]?.trim();
    const skip = INHERITED_FORM_PROPS.has(name) || (isBoolean && INHERITED_BOOLEAN_PROPS.has(name));
    if (skip) continue;
    const typeMatch = opts.match(/type:\s*(\w+)/);
    const attrMatch = opts.match(/attribute:\s*['"]([^'"]+)['"]/);
    props.push({
      name,
      type: typeMatch ? typeMatch[1].toLowerCase() : 'string',
      default: dflt,
      attribute: attrMatch ? attrMatch[1] : undefined,
    });
  }
  return props;
}

/**
 * Walk the source for `dispatch(this, '<name>', { detail-keys })` calls
 * and collect a deduped list. Detail-key parsing is shallow — picks up
 * the top-level keys of the literal object passed as the third arg —
 * which is the surface contract a consumer relies on.
 */
function parseLitEvents(filePath: string): ComponentEvent[] {
  const src = readFileSync(filePath, 'utf-8');
  const eventsByName = new Map<string, { keys: Set<string>; unknown: boolean }>();

  function record(name: string, detailArg: string | undefined): void {
    if (INHERITED_FORM_EVENTS.has(name)) return;
    if (!eventsByName.has(name)) eventsByName.set(name, { keys: new Set(), unknown: false });
    const entry = eventsByName.get(name)!;
    const arg = detailArg?.trim();
    if (!arg) return;
    if (!arg.startsWith('{')) {
      entry.unknown = true;
      return;
    }
    const body = arg.replace(/^\{/, '').replace(/\}$/, '');
    for (const piece of body.split(',')) {
      const trimmed = piece.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('...')) {
        entry.unknown = true;
        continue;
      }
      const keyMatch = trimmed.match(/^(?:['"]([\w-]+)['"]|(\w+))/);
      if (!keyMatch) continue;
      const key = keyMatch[1] ?? keyMatch[2];
      if (key) entry.keys.add(key);
    }
  }

  // Pattern 1: dispatch(this, 'name', { ... })  — preferred helper
  const dispatchRegex = /dispatch\(this,\s*['"]([\w-]+)['"](?:,\s*([^)]+))?\)/g;
  // Pattern 2: this.dispatchEvent(new CustomEvent('name', { detail: {...}, ... }))
  //   Some components dispatch raw CustomEvents instead of using the
  //   helper. Pull the detail object out of the init body so we can
  //   compare detail keys.
  const customEventRegex = /this\.dispatchEvent\(\s*new\s+CustomEvent\(\s*['"]([\w-]+)['"](?:\s*,\s*\{([\s\S]*?)\}\s*\))?/g;

  let m: RegExpExecArray | null;
  while ((m = dispatchRegex.exec(src)) !== null) {
    record(m[1], m[2]);
  }
  while ((m = customEventRegex.exec(src)) !== null) {
    const initBody = m[2];
    let detailArg: string | undefined;
    if (initBody) {
      const detailMatch = initBody.match(/detail:\s*(\{[\s\S]*?\})/);
      detailArg = detailMatch?.[1];
    }
    record(m[1], detailArg);
  }

  return [...eventsByName.entries()].map(([name, entry]) => ({
    name,
    detailKeys: [...entry.keys].sort(),
    detailUnknown: entry.unknown,
  }));
}

/**
 * iOS uses Swift naming conventions, particularly an `is` prefix for
 * boolean props (`required` → `isRequired`, `tile` → `isTile`, etc.).
 * For each schema prop, also accept the `isXxx` variant — false-positive
 * collisions are vanishingly rare for well-named props.
 */
/**
 * Native platforms use Swift/Kotlin camelCase for HTML-attribute-derived
 * props that the schema and Lit keep all-lowercase (matching the HTML
 * attribute spec). Translate `maxlength` → `maxLength`, etc.
 */
const HTML_ATTR_TO_NATIVE_CAMEL: Record<string, string> = {
  maxlength: 'maxLength',
  minlength: 'minLength',
  inputmode: 'inputMode',
  autocomplete: 'autocomplete', // already camel-friendly
};

function iosPropAlternatives(name: string): string[] {
  const alternatives = [name, `is${name[0].toUpperCase()}${name.slice(1)}`];
  // iOS also commonly maps `type` → `inputType` and `name` → `formName`,
  // since `type` shadows Swift's metatype keyword and `name` collides
  // with View's accessibility name.
  if (name === 'type') alternatives.push('inputType');
  if (name === 'name') alternatives.push('formName');
  if (HTML_ATTR_TO_NATIVE_CAMEL[name]) alternatives.push(HTML_ATTR_TO_NATIVE_CAMEL[name]);
  return alternatives;
}

/**
 * Android Compose largely follows Lit's prop names verbatim, but a few
 * collide with reserved/builtin keywords and get renamed.
 */
function androidPropAlternatives(name: string): string[] {
  const alternatives = [name];
  if (name === 'type') alternatives.push('inputType');
  if (HTML_ATTR_TO_NATIVE_CAMEL[name]) alternatives.push(HTML_ATTR_TO_NATIVE_CAMEL[name]);
  return alternatives;
}

function parseSwiftPropNames(filePath: string): string[] {
  const src = readFileSync(filePath, 'utf-8');
  const names = new Set<string>();
  // Match `public var name:` and `public let name:` and `@Binding public var name:`
  // Skip computed-property declarations (those use `var name: Type {`)
  // and the body of preview structs.
  const propRegex = /(?:^|\n)\s*(?:@\w+\s+)*public\s+(?:var|let)\s+(\w+)\s*:/g;
  let m: RegExpExecArray | null;
  while ((m = propRegex.exec(src)) !== null) {
    names.add(m[1]);
  }
  return [...names];
}

function parseKotlinPropNames(filePath: string, displayName: string): string[] {
  const src = readFileSync(filePath, 'utf-8');
  // Find the @Composable function signature for the matching component.
  // Pattern: `fun CivXxx(\n  param1: Type,\n  param2: Type,...)`
  const fnStart = src.search(new RegExp(`fun\\s+${displayName}\\s*\\(`));
  if (fnStart < 0) return [];
  // Walk forward and capture the parameter list up to the matching `)`.
  // Skip only the FIRST `(` (the function-signature opener); all
  // subsequent parens — including those inside lambda / generic type
  // literals like `(AddressValue) -> Unit` — are part of the body.
  let depth = 0;
  let body = '';
  for (let i = fnStart; i < src.length; i++) {
    const ch = src[i];
    if (ch === '(') {
      depth++;
      if (depth === 1) continue; // skip the signature-opening paren only
    } else if (ch === ')') {
      depth--;
      if (depth === 0) break;
    }
    if (depth >= 1) body += ch;
  }
  const names = new Set<string>();
  // Each parameter is `name: Type[ = default]`, separated by commas at the
  // top level. Track paren/brace depth for nested lambda types like
  // `(AddressValue) -> Unit`. Skip generic-angle tracking — the `>` in
  // function-arrow syntax `->` would unbalance it, and Kotlin generic
  // type literals with multiple commas at the parameter top level are
  // rare enough that we accept the simpler walker.
  let paramStart = 0;
  let parenDepth = 0;
  for (let i = 0; i <= body.length; i++) {
    const ch = body[i];
    if (ch === '(' || ch === '{' || ch === '[') parenDepth++;
    else if (ch === ')' || ch === '}' || ch === ']') parenDepth--;
    if ((ch === ',' && parenDepth === 0) || i === body.length) {
      const piece = body.slice(paramStart, i).trim();
      paramStart = i + 1;
      const colonIdx = piece.indexOf(':');
      if (colonIdx < 0) continue;
      const name = piece.slice(0, colonIdx).trim();
      if (name && /^[a-zA-Z_]\w*$/.test(name)) names.add(name);
    }
  }
  return [...names];
}

function camelToSnake(name: string): string {
  return name.replace(/([A-Z]+)/g, '_$1').replace(/^_/, '').toLowerCase();
}

function parseDrupalPropNames(yamlPath: string): string[] {
  const src = readFileSync(yamlPath, 'utf-8');
  // Drupal SDCs declare props under `props.properties.<name>`. Parse by
  // looking for the `properties:` section and extracting indented keys.
  const lines = src.split('\n');
  const names = new Set<string>();
  let inProperties = false;
  let baseIndent = 0;
  for (const line of lines) {
    const propsMatch = line.match(/^(\s*)properties\s*:/);
    if (propsMatch && !inProperties) {
      inProperties = true;
      baseIndent = propsMatch[1].length;
      continue;
    }
    if (!inProperties) continue;
    const m = line.match(/^(\s*)([\w-]+)\s*:/);
    if (!m) continue;
    const indent = m[1].length;
    if (indent <= baseIndent) {
      // dedented past the properties block — done
      inProperties = false;
      continue;
    }
    if (indent === baseIndent + 2) {
      // direct child of `properties:` is a prop name
      names.add(m[2]);
    }
  }
  return [...names];
}

async function loadSchema(name: string): Promise<any | null> {
  const path = join(ROOT, 'packages/schema/src/components', `${name}.schema.ts`);
  if (!existsSync(path)) return null;
  const mod = await import(pathToFileURL(path).href);
  return mod.default ?? mod;
}

function schemaPropsFrom(schema: any, isBoolean: boolean): SchemaProp[] {
  const props: SchemaProp[] = [];
  for (const [propName, def] of Object.entries(schema.props ?? {}) as [string, any][]) {
    // Match what parseLitProps skips so the diff is symmetric. Schemas
    // are allowed to declare inherited props for documentation, but the
    // parity check only compares component-specific surface.
    const skip =
      INHERITED_FORM_PROPS.has(propName) ||
      (isBoolean && INHERITED_BOOLEAN_PROPS.has(propName));
    if (skip) continue;
    props.push({
      name: propName,
      type: def.type,
      default: def.default,
      attribute: def.attribute,
      webOnly: def.webOnly,
    });
  }
  return props;
}

function schemaEventsFrom(schema: any): ComponentEvent[] {
  const events: ComponentEvent[] = [];
  for (const [evtName, def] of Object.entries(schema.events ?? {}) as [string, any][]) {
    if (INHERITED_FORM_EVENTS.has(evtName)) continue;
    const detailKeys = Object.keys(def.detail ?? {}).sort();
    events.push({ name: evtName, detailKeys });
  }
  return events;
}

interface PropDrift {
  /** Props declared in source but missing from schema */
  missingFromSchema: string[];
  /** Props declared in schema but no longer present in source */
  removedFromSource: string[];
  /** Props where the type / default / attribute differs */
  mismatched: Array<{ name: string; field: string; schema: unknown; source: unknown }>;
}

/**
 * Schemas use 'string' for both required and optional string props,
 * but Lit @property({ type: String }) is the source of truth for the
 * type token. We normalize a few common variants here so we don't
 * report cosmetic differences.
 */
function normalizeType(type: string): string {
  const lower = type.toLowerCase();
  if (lower === 'string' || lower === 'enum') return 'string-or-enum';
  if (lower === 'array') return 'array';
  return lower;
}

function diffProps(schema: SchemaProp[], lit: LitProp[]): PropDrift {
  const schemaByName = new Map(schema.map((p) => [p.name, p]));
  const litByName = new Map(lit.map((p) => [p.name, p]));

  const missingFromSchema: string[] = [];
  const removedFromSource: string[] = [];
  const mismatched: PropDrift['mismatched'] = [];

  for (const litProp of lit) {
    if (!schemaByName.has(litProp.name)) {
      missingFromSchema.push(litProp.name);
      continue;
    }
    const schemaProp = schemaByName.get(litProp.name)!;
    if (normalizeType(schemaProp.type) !== normalizeType(litProp.type)) {
      mismatched.push({
        name: litProp.name,
        field: 'type',
        schema: schemaProp.type,
        source: litProp.type,
      });
    }
    if ((schemaProp.attribute ?? undefined) !== (litProp.attribute ?? undefined)) {
      mismatched.push({
        name: litProp.name,
        field: 'attribute',
        schema: schemaProp.attribute,
        source: litProp.attribute,
      });
    }
  }

  for (const schemaProp of schema) {
    if (!litByName.has(schemaProp.name)) {
      removedFromSource.push(schemaProp.name);
    }
  }

  return { missingFromSchema, removedFromSource, mismatched };
}

interface EventDrift {
  missingFromSchema: string[];
  removedFromSource: string[];
  detailMismatches: Array<{ name: string; schema: string[]; source: string[] }>;
}

function diffEvents(schema: ComponentEvent[], lit: ComponentEvent[]): EventDrift {
  const schemaByName = new Map(schema.map((e) => [e.name, e]));
  const litByName = new Map(lit.map((e) => [e.name, e]));

  const missingFromSchema: string[] = [];
  const removedFromSource: string[] = [];
  const detailMismatches: EventDrift['detailMismatches'] = [];

  for (const litEvent of lit) {
    const schemaEvent = schemaByName.get(litEvent.name);
    if (!schemaEvent) {
      missingFromSchema.push(litEvent.name);
      continue;
    }
    // Skip detail-key comparison when the source dispatches with a
    // variable / spread — we can't know the shape statically.
    if (litEvent.detailUnknown) continue;
    // Detail-key drift only flags when source dispatches a key that
    // the schema doesn't document. The reverse (schema declares a key
    // that source never dispatches) is checked below in case it's a
    // typo on the schema side.
    const litKeys = new Set(litEvent.detailKeys);
    const schemaKeys = new Set(schemaEvent.detailKeys);
    const sourceOnly = [...litKeys].filter((k) => !schemaKeys.has(k));
    const schemaOnly = [...schemaKeys].filter((k) => !litKeys.has(k));
    if (sourceOnly.length > 0 || schemaOnly.length > 0) {
      detailMismatches.push({
        name: litEvent.name,
        schema: schemaEvent.detailKeys,
        source: litEvent.detailKeys,
      });
    }
  }

  for (const schemaEvent of schema) {
    if (litByName.has(schemaEvent.name)) continue;
    // The base class fires these through _handleInput/_handleChange
    // helpers — subclasses that delegate don't dispatch explicitly.
    if (BASE_DISPATCHED_EVENTS.has(schemaEvent.name)) continue;
    removedFromSource.push(schemaEvent.name);
  }

  return { missingFromSchema, removedFromSource, detailMismatches };
}

interface PlatformDrift {
  platform: 'ios' | 'android' | 'drupal';
  /** Schema-declared props missing from this platform's source */
  missing: string[];
}

function checkPlatformParity(
  schemaPropNames: string[],
  spec: ComponentSpec,
  /** Map from schema prop name → schema's `attribute` override, when set. */
  schemaAttributes: Map<string, string> = new Map(),
): PlatformDrift[] {
  const drifts: PlatformDrift[] = [];

  if (spec.ios) {
    const path = join(ROOT, spec.ios);
    if (existsSync(path)) {
      const iosNames = new Set(parseSwiftPropNames(path));
      const missing = schemaPropNames.filter((p) => {
        const alts = iosPropAlternatives(p);
        return !alts.some((alt) => iosNames.has(alt));
      });
      if (missing.length > 0) drifts.push({ platform: 'ios', missing });
    }
  }

  if (spec.android) {
    const path = join(ROOT, spec.android);
    if (existsSync(path)) {
      // Android function name follows the iOS struct name (CivXxx) per the
      // codegen scaffold output. Derive it from the kebab-case schema name.
      const display = 'Civ' + spec.name
        .replace(/^civ-/, '')
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join('');
      const androidNames = new Set(parseKotlinPropNames(path, display));
      const missing = schemaPropNames.filter((p) => {
        // Compose follows Lit's prop names directly, but a few conflict
        // with reserved words (type → inputType) — borrow the iOS
        // alternative list for those collisions.
        const alts = androidPropAlternatives(p);
        return !alts.some((alt) => androidNames.has(alt));
      });
      if (missing.length > 0) drifts.push({ platform: 'android', missing });
    }
  }

  if (spec.drupal) {
    const path = join(ROOT, spec.drupal);
    if (existsSync(path)) {
      const drupalNames = new Set(parseDrupalPropNames(path));
      // Drupal SDCs mirror the Lit HTML attribute (with `-` → `_`). When
      // the schema declares `attribute: 'foo-bar'`, that's the source of
      // truth — `validateType` with attribute `validate` lives in Drupal
      // as `validate`, not `validate_type`.
      const missing = schemaPropNames.filter((p) => {
        const candidates = [p, camelToSnake(p)];
        const attr = schemaAttributes.get(p);
        if (attr) candidates.push(attr.replace(/-/g, '_'));
        return !candidates.some((c) => drupalNames.has(c));
      });
      if (missing.length > 0) drifts.push({ platform: 'drupal', missing });
    }
  }

  return drifts;
}

async function main(): Promise<void> {
  const strict = process.argv.includes('--strict');
  // Platforms check is opt-in (informational by default). When --platforms
  // is passed, drift on ios/android/drupal also fails the build.
  const enforcePlatforms = process.argv.includes('--platforms');
  let drift = 0;
  let platformDriftCount = 0;
  for (const spec of COVERED_COMPONENTS) {
    const sourcePath = join(ROOT, spec.source);
    if (!existsSync(sourcePath)) {
      console.log(`⚠  ${spec.name}: source file not found at ${spec.source}`);
      drift++;
      continue;
    }
    const schemaPath = join(ROOT, 'packages/schema/src/components', `${spec.name}.schema.ts`);
    if (!existsSync(schemaPath)) {
      console.log(`${strict ? '✗' : '⚠'}  ${spec.name}: no schema file at packages/schema/src/components/${spec.name}.schema.ts`);
      if (strict) drift++;
      continue;
    }
    const schema = await loadSchema(spec.name);
    const schemaProps = schemaPropsFrom(schema, !!spec.isBoolean);
    const schemaEvents = schemaEventsFrom(schema);
    const litProps = parseLitProps(sourcePath, !!spec.isBoolean);
    const litEvents = parseLitEvents(sourcePath);
    const propResult = diffProps(schemaProps, litProps);
    const eventResult = diffEvents(schemaEvents, litEvents);
    const hasDrift =
      propResult.missingFromSchema.length > 0 ||
      propResult.removedFromSource.length > 0 ||
      propResult.mismatched.length > 0 ||
      eventResult.missingFromSchema.length > 0 ||
      eventResult.removedFromSource.length > 0 ||
      eventResult.detailMismatches.length > 0;
    // Cross-platform parity: validate each platform's source declares
    // the schema's props (informational by default; failing only when
    // --platforms is passed). Platforms without a source file are
    // silently skipped. webOnly props are excluded — they're abstractions
    // that don't have a clean cross-platform mapping.
    const crossPlatformProps = schemaProps.filter((p) => !p.webOnly);
    const crossPlatformPropNames = crossPlatformProps.map((p) => p.name);
    const schemaAttributes = new Map<string, string>();
    for (const p of crossPlatformProps) {
      if (p.attribute) schemaAttributes.set(p.name, p.attribute);
    }
    const platformDrifts = checkPlatformParity(
      crossPlatformPropNames,
      spec,
      schemaAttributes,
    );
    if (platformDrifts.length > 0) platformDriftCount++;

    if (!hasDrift && platformDrifts.length === 0) {
      console.log(`✓  ${spec.name} (${litProps.length} props, ${litEvents.length} events in sync across all platforms)`);
      continue;
    }
    if (hasDrift) drift++;
    console.log(`${hasDrift ? '✗' : '⚠'}  ${spec.name}`);
    if (propResult.missingFromSchema.length > 0) {
      console.log(`   props in source but missing from schema: ${propResult.missingFromSchema.join(', ')}`);
    }
    if (propResult.removedFromSource.length > 0) {
      console.log(`   props in schema but no longer in source: ${propResult.removedFromSource.join(', ')}`);
    }
    for (const m of propResult.mismatched) {
      console.log(`   ${m.name}.${m.field} differs: schema=${JSON.stringify(m.schema)}, source=${JSON.stringify(m.source)}`);
    }
    if (eventResult.missingFromSchema.length > 0) {
      console.log(`   events fired in source but missing from schema: ${eventResult.missingFromSchema.join(', ')}`);
    }
    if (eventResult.removedFromSource.length > 0) {
      console.log(`   events declared in schema but never dispatched: ${eventResult.removedFromSource.join(', ')}`);
    }
    for (const m of eventResult.detailMismatches) {
      console.log(`   ${m.name} detail keys differ: schema=${JSON.stringify(m.schema)}, source=${JSON.stringify(m.source)}`);
    }
    for (const pd of platformDrifts) {
      console.log(`   ${pd.platform}: missing schema props in source (${pd.missing.length}): ${pd.missing.join(', ')}`);
    }
  }
  const litFailure = drift > 0;
  const platformFailure = enforcePlatforms && platformDriftCount > 0;
  if (litFailure || platformFailure) {
    if (litFailure) {
      console.log(`\n${drift} component(s) have Lit ↔ schema drift.`);
    }
    if (platformDriftCount > 0) {
      const verb = enforcePlatforms ? 'have' : 'have informational';
      console.log(`${platformDriftCount} component(s) ${verb} platform parity gaps (run with --platforms to fail the build).`);
    }
    if (litFailure || platformFailure) process.exit(1);
  }
  console.log(`\n${COVERED_COMPONENTS.length}/${COVERED_COMPONENTS.length} components match their schema.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
