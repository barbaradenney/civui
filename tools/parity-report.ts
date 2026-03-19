#!/usr/bin/env npx tsx
/**
 * CivUI Platform Parity Report Generator
 *
 * Extracts component APIs from web (TypeScript), iOS (Swift), and Android (Kotlin)
 * source files and generates an HTML report showing parity across platforms.
 *
 * Usage: npx tsx tools/parity-report.ts
 * Output: tools/parity-report.html
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

const ROOT = join(import.meta.dirname, '..');
const WEB_DIR = join(ROOT, 'packages/forms/src');
const IOS_DIR = join(ROOT, 'packages/ios/Sources/CivUI');
const ANDROID_DIR = join(ROOT, 'packages/android/src/main/kotlin/gov/civui/components');

interface PropDef {
  name: string;
  type: string;
  required: boolean;
  default?: string;
}

interface EventDef {
  name: string;
  detail?: string;
}

interface ComponentAPI {
  name: string;
  props: PropDef[];
  events: EventDef[];
  file: string;
}

// ── Web base class props (inherited from CivFormElement) ─────

const WEB_BASE_PROPS: PropDef[] = [
  { name: 'label', type: 'String', required: false, default: "''" },
  { name: 'name', type: 'String', required: false, default: "''" },
  { name: 'value', type: 'String', required: false, default: "''" },
  { name: 'hint', type: 'String', required: false, default: "''" },
  { name: 'error', type: 'String', required: false, default: "''" },
  { name: 'required', type: 'Boolean', required: false, default: 'false' },
  { name: 'disabled', type: 'Boolean', required: false, default: 'false' },
  { name: 'readonly', type: 'Boolean', required: false, default: 'false' },
];

// Boolean form elements (checkbox, toggle) also have:
const WEB_BOOLEAN_PROPS: PropDef[] = [
  { name: 'checked', type: 'Boolean', required: false, default: 'false' },
  { name: 'description', type: 'String', required: false, default: "''" },
];

// Events all form components dispatch:
const WEB_BASE_EVENTS = ['civ-input', 'civ-change', 'civ-analytics'];

// ── Web (TypeScript/Lit) parser ──────────────────────────────

function parseWebComponent(filePath: string): ComponentAPI | null {
  if (!existsSync(filePath)) return null;
  const src = readFileSync(filePath, 'utf-8');

  const name = basename(filePath, '.ts').replace('civ-', '');
  const props: PropDef[] = [];
  const events: EventDef[] = [];

  // Extract @property declarations
  const propRegex = /@property\(\{([^}]*)\}\)\s+(?:override\s+)?(\w+)(?:\??)(?:\s*[:=]\s*(.+?))?[;\n]/g;
  let m;
  while ((m = propRegex.exec(src)) !== null) {
    const opts = m[1];
    const propName = m[2];
    const defaultVal = m[3]?.trim().replace(/;$/, '');
    const typeMatch = opts.match(/type:\s*(\w+)/);
    const type = typeMatch ? typeMatch[1] : 'String';
    props.push({
      name: propName,
      type: type,
      required: false,
      default: defaultVal,
    });
  }

  // Merge in inherited base class props
  const declaredNames = new Set(props.map(p => p.name));

  const extendsBooleanForm = /extends\s+CivBooleanFormElement/.test(src);
  const extendsForm = /extends\s+(?:LightDomContainerMixin\()?CivFormElement/.test(src);

  if (extendsBooleanForm || extendsForm) {
    for (const baseProp of WEB_BASE_PROPS) {
      if (!declaredNames.has(baseProp.name)) {
        props.push({ ...baseProp });
        declaredNames.add(baseProp.name);
      }
    }
  }

  if (extendsBooleanForm) {
    for (const boolProp of WEB_BOOLEAN_PROPS) {
      if (!declaredNames.has(boolProp.name)) {
        props.push({ ...boolProp });
        declaredNames.add(boolProp.name);
      }
    }
  }

  // Extract @state declarations
  const stateRegex = /@state\(\)\s+(?:private\s+)?(\w+)(?:\s*[:=]\s*(.+?))?[;\n]/g;
  while ((m = stateRegex.exec(src)) !== null) {
    // Skip internal state - not part of public API
  }

  // Extract events from dispatch() calls
  const eventRegex = /dispatch\(this,\s*'([^']+)'(?:,\s*\{([^}]*)\})?\)/g;
  const seenEvents = new Set<string>();
  while ((m = eventRegex.exec(src)) !== null) {
    const eventName = m[1];
    if (!seenEvents.has(eventName)) {
      seenEvents.add(eventName);
      events.push({ name: eventName, detail: m[2]?.trim() });
    }
  }

  // Extract events from JSDoc @fires
  const firesRegex = /@fires\s+(\S+)\s*-?\s*(.*)/g;
  while ((m = firesRegex.exec(src)) !== null) {
    if (!seenEvents.has(m[1])) {
      seenEvents.add(m[1]);
      events.push({ name: m[1], detail: m[2]?.trim() });
    }
  }

  // Merge in base events for form components
  if (extendsBooleanForm || extendsForm) {
    for (const evtName of WEB_BASE_EVENTS) {
      if (!seenEvents.has(evtName)) {
        seenEvents.add(evtName);
        events.push({ name: evtName });
      }
    }
  }

  return { name, props, events, file: filePath.replace(ROOT + '/', '') };
}

// ── iOS (Swift) parser ───────────────────────────────────────

function parseSwiftComponent(filePath: string, targetName?: string): ComponentAPI | null {
  if (!existsSync(filePath)) return null;
  const src = readFileSync(filePath, 'utf-8');

  const name = targetName || basename(filePath, '.swift').replace('Civ', '');
  const props: PropDef[] = [];
  const events: EventDef[] = [];
  const seen = new Set<string>();

  // Parse property declarations from the struct matching the file name
  const expectedStruct = 'Civ' + name;
  const lines = src.split('\n');
  let inTargetStruct = false;
  let structDepth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Track struct boundaries — only parse the struct matching the file name
    const structMatch = line.match(/^public\s+struct\s+(Civ\w+)/);
    if (structMatch) {
      if (structMatch[1] === expectedStruct) {
        inTargetStruct = true;
        structDepth = 0;
      } else if (inTargetStruct) {
        // Reached a different struct while in target — stop
        break;
      }
    }
    if (!inTargetStruct) continue;

    // Skip comments, imports, computed properties
    if (line.startsWith('//') || line.startsWith('///') || line.startsWith('import ')) continue;

    // Skip private, @State, @FocusState, @Environment
    if (line.includes('private ') || line.includes('fileprivate ')) continue;
    if (line.startsWith('@State ') || line.startsWith('@State\n')) continue;
    if (line.startsWith('@FocusState')) continue;
    if (line.startsWith('@Environment')) continue;

    // Match: [public] [let|var] name: Type [= default]
    // Also match: @Binding [public] var name: Type
    const m = line.match(/^(?:@Binding\s+)?(?:public\s+)?(?:var|let)\s+(\w+):\s*(.+?)(?:\s*=\s*(.+))?$/);
    if (!m) continue;

    const propName = m[1].trim();
    let type = m[2].trim();
    const defaultVal = m[3]?.trim();

    // Skip internal state
    if (propName.startsWith('_')) continue;
    if (seen.has(propName)) continue;
    seen.add(propName);

    // Separate callbacks from props
    if (type.includes('->')) {
      events.push({ name: propName, detail: type });
      continue;
    }

    // Clean up trailing braces/commas
    type = type.replace(/[{,]$/, '').trim();

    props.push({
      name: propName,
      type: type.replace(/\?$/, ''),
      required: !defaultVal && !type.includes('?'),
      default: defaultVal,
    });
  }

  return { name, props, events, file: filePath.replace(ROOT + '/', '') };
}

// ── Kotlin parameter parser (handles nested parens/angle brackets) ────

function parseKotlinParams(paramStr: string): Array<{ name: string; type: string; defaultVal?: string }> {
  const results: Array<{ name: string; type: string; defaultVal?: string }> = [];
  let i = 0;
  const s = paramStr;

  while (i < s.length) {
    // Skip whitespace/newlines
    while (i < s.length && /[\s,]/.test(s[i])) i++;
    if (i >= s.length) break;

    // Read parameter name
    const nameStart = i;
    while (i < s.length && /\w/.test(s[i])) i++;
    const paramName = s.slice(nameStart, i).trim();
    if (!paramName) { i++; continue; }

    // Skip whitespace and colon
    while (i < s.length && /\s/.test(s[i])) i++;
    if (i >= s.length || s[i] !== ':') { i++; continue; }
    i++; // skip ':'
    while (i < s.length && /\s/.test(s[i])) i++;

    // Read type (respecting nested parens, angle brackets, and Kotlin function types like (X) -> Y)
    let type = '';
    let depth = 0; // track () and <>
    let inType = true;
    while (i < s.length && inType) {
      const ch = s[i];
      if (ch === '(' || ch === '<') { depth++; type += ch; i++; }
      else if (ch === ')' || ch === '>') {
        if (depth > 0) {
          depth--;
          type += ch;
          i++;
          // After closing paren at depth 0, check if followed by -> (function type continuation)
          if (depth === 0) {
            // Peek ahead for -> or ?. or ? -> patterns
            let peek = i;
            while (peek < s.length && /[\s?]/.test(s[peek])) peek++;
            if (peek + 1 < s.length && s[peek] === '-' && s[peek + 1] === '>') {
              // This is a function type like (X) -> Y, continue reading
              // Consume up to and including -> and the return type
              while (i < peek + 2) { type += s[i]; i++; }
              // Read the return type (single token like Unit, String?, etc.)
              while (i < s.length && /\s/.test(s[i])) { type += s[i]; i++; }
              // Read return type token (don't consume commas - those separate params)
              while (i < s.length && /[\w.<>?]/.test(s[i])) { type += s[i]; i++; }
            }
          }
        }
        else { inType = false; } // end of function params
      }
      else if (ch === ',' && depth === 0) { inType = false; }
      else if (ch === '=' && depth === 0) { inType = false; }
      else if (ch === '\n' && depth === 0 && type.trim().length > 0) {
        // Check if next non-whitespace is a comma, =, or ) to decide if type is done
        let peek = i + 1;
        while (peek < s.length && s[peek] === ' ') peek++;
        if (peek < s.length && (s[peek] === ',' || s[peek] === '=' || s[peek] === ')')) {
          inType = false;
        } else {
          type += ch; i++;
        }
      }
      else { type += ch; i++; }
    }
    type = type.trim();

    // Check for default value
    let defaultVal: string | undefined;
    while (i < s.length && /\s/.test(s[i])) i++;
    if (i < s.length && s[i] === '=') {
      i++; // skip '='
      while (i < s.length && /\s/.test(s[i])) i++;
      let def = '';
      let defDepth = 0;
      while (i < s.length) {
        const ch = s[i];
        if (ch === '(' || ch === '<' || ch === '{') { defDepth++; def += ch; i++; }
        else if (ch === ')' || ch === '>' || ch === '}') {
          if (defDepth > 0) { defDepth--; def += ch; i++; }
          else break;
        }
        else if (ch === ',' && defDepth === 0) break;
        else if (ch === '\n' && defDepth === 0) break;
        else { def += ch; i++; }
      }
      defaultVal = def.trim();
    }

    if (paramName && type) {
      results.push({ name: paramName, type, defaultVal });
    }
  }

  return results;
}

// ── Android (Kotlin) parser ──────────────────────────────────

function parseKotlinComponent(filePath: string, targetName?: string): ComponentAPI | null {
  if (!existsSync(filePath)) return null;
  const src = readFileSync(filePath, 'utf-8');

  const name = targetName || basename(filePath, '.kt').replace('Civ', '');
  const props: PropDef[] = [];
  const events: EventDef[] = [];

  // Find the @Composable function matching the target name
  // Pattern: fun CivName(\n  param: Type = default,\n  ...
  const funcName = 'Civ' + name;
  const funcRegex = new RegExp(`(?:@Composable\\s+)?fun\\s+${funcName}\\s*\\(([\\s\\S]*?)\\)\\s*\\{`);
  const funcMatch = funcRegex.exec(src);
  if (funcMatch) {
    const params = funcMatch[1];
    // Parse parameters handling nested parens/angle brackets
    const parsedParams = parseKotlinParams(params);
    for (const { name: paramName, type, defaultVal } of parsedParams) {
      // Skip Modifier and content lambdas
      if (type === 'Modifier') continue;
      if (type.includes('@Composable') && type.includes('Unit')) continue;

      // Identify callbacks
      if (type.includes('->')) {
        events.push({ name: paramName, detail: type });
        continue;
      }

      props.push({
        name: paramName,
        type: type,
        required: defaultVal === undefined,
        default: defaultVal,
      });
    }
  }

  return { name, props, events, file: filePath.replace(ROOT + '/', '') };
}

// ── Component mapping ────────────────────────────────────────

interface ComponentMapping {
  displayName: string;
  web?: string; // path to web component file
  ios?: string; // path to iOS file
  android?: string; // path to Android file
}

function discoverComponents(): ComponentMapping[] {
  const mappings: ComponentMapping[] = [];

  // Scan web components
  const webDirs = readdirSync(WEB_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const nameMap: Record<string, ComponentMapping> = {};

  // Web child components that are part of their parent on native (no separate file needed)
  const childComponents = new Set(['Segment']);

  for (const dir of webDirs) {
    const files = readdirSync(join(WEB_DIR, dir)).filter(f => f.startsWith('civ-') && f.endsWith('.ts') && !f.includes('.test.') && !f.includes('.stories.'));
    for (const file of files) {
      const componentName = file.replace('civ-', '').replace('.ts', '');
      const displayName = componentName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
      if (childComponents.has(displayName)) continue; // Skip child components
      nameMap[displayName] = {
        displayName,
        web: join(WEB_DIR, dir, file),
      };
    }
  }

  // Native files that contain multiple components (e.g., CivRadio.swift has both CivRadio and CivRadioGroup)
  const nativeMultiFiles: Record<string, string> = {
    'RadioGroup': 'Radio', // CivRadioGroup is inside CivRadio.swift/CivRadio.kt
  };

  // Match iOS files
  if (existsSync(IOS_DIR)) {
    for (const file of readdirSync(IOS_DIR).filter(f => f.endsWith('.swift') && f.startsWith('Civ'))) {
      const name = file.replace('Civ', '').replace('.swift', '');
      if (name === 'Tokens' || name === 'UI' || name === 'Locale' || name === 'FormState') continue;
      if (!nameMap[name]) nameMap[name] = { displayName: name };
      nameMap[name].ios = join(IOS_DIR, file);
    }
    // Map multi-component files
    for (const [target, source] of Object.entries(nativeMultiFiles)) {
      if (nameMap[target] && !nameMap[target].ios && nameMap[source]?.ios) {
        nameMap[target].ios = nameMap[source].ios;
      }
    }
  }

  // Match Android files
  if (existsSync(ANDROID_DIR)) {
    for (const file of readdirSync(ANDROID_DIR).filter(f => f.endsWith('.kt') && f.startsWith('Civ'))) {
      const name = file.replace('Civ', '').replace('.kt', '');
      if (name === 'Tokens' || name === 'FieldHelpers' || name === 'FormState') continue;
      if (!nameMap[name]) nameMap[name] = { displayName: name };
      nameMap[name].android = join(ANDROID_DIR, file);
    }
    // Map multi-component files
    for (const [target, source] of Object.entries(nativeMultiFiles)) {
      if (nameMap[target] && !nameMap[target].android && nameMap[source]?.android) {
        nameMap[target].android = nameMap[source].android;
      }
    }
  }

  return Object.values(nameMap).sort((a, b) => a.displayName.localeCompare(b.displayName));
}

// ── HTML report generation ───────────────────────────────────

function generateReport(): string {
  const components = discoverComponents();
  const results: Array<{
    displayName: string;
    web: ComponentAPI | null;
    ios: ComponentAPI | null;
    android: ComponentAPI | null;
  }> = [];

  for (const comp of components) {
    const web = comp.web ? parseWebComponent(comp.web) : null;
    const ios = comp.ios ? parseSwiftComponent(comp.ios, comp.displayName) : null;
    const android = comp.android ? parseKotlinComponent(comp.android, comp.displayName) : null;
    results.push({ displayName: comp.displayName, web, ios, android });
  }

  // Count totals
  const totalComponents = results.length;
  const withWeb = results.filter(r => r.web).length;
  const withIos = results.filter(r => r.ios).length;
  const withAndroid = results.filter(r => r.android).length;

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CivUI Platform Parity Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #f5f5f5; color: #1b1b1b; padding: 24px; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .subtitle { color: #71767a; font-size: 14px; margin-bottom: 24px; }
  .summary { display: flex; gap: 24px; margin-bottom: 24px; }
  .summary-card { background: white; border: 1px solid #dfe1e2; border-radius: 8px; padding: 16px; flex: 1; text-align: center; }
  .summary-card .num { font-size: 32px; font-weight: 700; }
  .summary-card .label { font-size: 13px; color: #71767a; margin-top: 4px; }
  .component { background: white; border: 1px solid #dfe1e2; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
  .component-header { padding: 12px 16px; font-weight: 600; font-size: 15px; background: #f0f0f0; display: flex; align-items: center; gap: 12px; cursor: pointer; }
  .component-header:hover { background: #e8e8e8; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
  .badge.yes { background: #ecf3ec; color: #4d8055; }
  .badge.no { background: #f4e3db; color: #8b0a03; }
  .component-body { display: none; padding: 0; }
  .component-body.open { display: block; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 8px 12px; background: #f9f9f9; border-bottom: 1px solid #dfe1e2; font-weight: 600; color: #3d4551; }
  td { padding: 6px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
  tr:hover { background: #fafafa; }
  .check { color: #00a91c; }
  .cross { color: #b50909; }
  .dash { color: #a9aeb1; }
  .prop-type { color: #71767a; font-size: 11px; }
  .section-label { font-size: 12px; font-weight: 600; color: #71767a; text-transform: uppercase; padding: 10px 12px 4px; letter-spacing: 0.05em; }
  .file-path { font-size: 11px; color: #71767a; font-family: monospace; }
  .gap-row { background: #fff8f0; }
  .parity-meter { height: 6px; background: #dfe1e2; border-radius: 3px; overflow: hidden; width: 60px; display: inline-block; vertical-align: middle; margin-left: 8px; }
  .parity-fill { height: 100%; border-radius: 3px; }
  .parity-fill.high { background: #00a91c; }
  .parity-fill.mid { background: #e5a000; }
  .parity-fill.low { background: #b50909; }
  .excluded-row { display: none; }
  .show-excluded .excluded-row { display: table-row; opacity: 0.5; }
  .toggle-excluded { font-size: 11px; color: #71767a; background: #f0f0f0; border: 1px solid #dfe1e2; border-radius: 4px; padding: 3px 8px; cursor: pointer; margin-left: 8px; }
  .toggle-excluded:hover { background: #e8e8e8; }
</style>
</head>
<body>
<h1>CivUI Platform Parity Report</h1>
<p class="subtitle">Auto-generated ${new Date().toLocaleDateString()} — extracted from source code</p>

<div class="summary">
  <div class="summary-card"><div class="num">${totalComponents}</div><div class="label">Components</div></div>
  <div class="summary-card"><div class="num">${withWeb}</div><div class="label">Web (Lit)</div></div>
  <div class="summary-card"><div class="num">${withIos}</div><div class="label">iOS (SwiftUI)</div></div>
  <div class="summary-card"><div class="num">${withAndroid}</div><div class="label">Android (Compose)</div></div>
</div>
`;

  for (const result of results) {
    const { displayName, web, ios, android } = result;

    // Collect all unique prop names across platforms
    const allProps = new Map<string, { web?: PropDef; ios?: PropDef; android?: PropDef }>();
    web?.props.forEach(p => {
      if (!allProps.has(p.name)) allProps.set(p.name, {});
      allProps.get(p.name)!.web = p;
    });
    ios?.props.forEach(p => {
      const key = mapPropName(p.name, 'ios');
      if (!allProps.has(key)) allProps.set(key, {});
      allProps.get(key)!.ios = p;
    });
    android?.props.forEach(p => {
      const key = mapPropName(p.name, 'android');
      if (!allProps.has(key)) allProps.set(key, {});
      allProps.get(key)!.android = p;
    });

    // If a component has 'legend', treat 'label' as web-only (inherited from base class, not used for groups)
    if (allProps.has('legend') && allProps.has('label')) {
      const labelEntry = allProps.get('label')!;
      // Only remove if label is web-only (not on native)
      if (labelEntry.web && !labelEntry.ios && !labelEntry.android) {
        allProps.delete('label');
      }
    }

    // Collect all events
    const allEvents = new Map<string, { web?: EventDef; ios?: EventDef; android?: EventDef }>();
    web?.events.forEach(e => {
      if (!allEvents.has(e.name)) allEvents.set(e.name, {});
      allEvents.get(e.name)!.web = e;
    });
    ios?.events.forEach(e => {
      const key = mapEventName(e.name);
      if (!allEvents.has(key)) allEvents.set(key, {});
      allEvents.get(key)!.ios = e;
    });
    android?.events.forEach(e => {
      const key = mapEventName(e.name);
      if (!allEvents.has(key)) allEvents.set(key, {});
      allEvents.get(key)!.android = e;
    });

    // Props that are web-only and should not count against native parity
    const webOnlyProps = new Set([
      // Web platform specifics
      'action', 'method', 'inputmode', 'autocomplete', 'pattern', 'persist', 'prefill',
      'errorHeadingLevel', 'maskPattern',
      // i18n override props (native uses CivLocale instead)
      'chooseDateLabel', 'selectedDateLabel', 'dialogLabel', 'previousMonthLabel',
      'nextMonthLabel', 'dialogOpenedMessage', 'dateSelectedMessage', 'todayLabel',
      'invalidFormatMessage', 'dateRangeMessage', 'minDateMessage', 'maxDateMessage',
      'monthEmptyLabel', 'dayPlaceholder', 'yearPlaceholder', 'dateSetMessage', 'invalidDateMessage',
      'monthLabel', 'dayLabel', 'yearLabel',
      'dragText', 'browseText', 'acceptedLabel', 'maxSizeLabel', 'removeText', 'removeAriaLabel',
      'filesListLabel', 'fileAddedMessage', 'fileRemovedMessage', 'fileSizeError', 'fileTypeError',
      'maxFilesError', 'requiredMessage', 'noResultsText',
      // Web-only internal
      'formValidate', 'pii', 'parts',
      'managedTabIndex', 'inputId',
      // Date picker web-only (native uses system locale/settings)
      'weekStartsOn',
    ]);

    // Props that are native-only and should not count as "missing on web"
    const nativeOnlyProps = new Set([
      'body', 'parts', 'content', 'id', 'data', 'keyboardType', 'points',
      'selected', 'newFiles', 'errors', 'fieldName', 'message', 'url', 'size',
      'formValidate', 'modifier',
      'formState', 'requiredMessage', 'pii', 'formName',
      'options', 'values', 'files', 'state', 'onSelect',
      // Native icon platform-specific
      'sfSymbol', 'accessibilityLabel', 'decorative', 'contentDescription', 'tint',
    ]);

    // Web-only events (excluded only when no native platform has the mapped event)
    const webOnlyEvents = new Set([
      'civ-reset', // native handles reset differently
      'civ-input', // native onChange/onValueChange fires on every change (same as civ-input)
      'civ-invalid', // native form validation uses formState pattern instead
      'civ-analytics', // native uses onAnalytics closure; excluded only for components where no native has it
    ]);

    // Native-only events/callbacks (not real events, excluded from parity)
    const nativeOnlyEvents = new Set([
      'formValidate', // native form validation callback, not a user-facing event
    ]);

    // Remove native-only props so they don't show as gaps
    for (const name of Array.from(allProps.keys())) {
      const v = allProps.get(name)!;
      if (!v.web && nativeOnlyProps.has(name)) {
        allProps.delete(name);
      }
    }

    // Remove native-only events so they don't show as gaps
    for (const name of Array.from(allEvents.keys())) {
      const v = allEvents.get(name)!;
      if (!v.web && nativeOnlyEvents.has(name)) {
        allEvents.delete(name);
      }
    }

    // Calculate parity: what % of web props/events exist on at least one native platform
    let webItems = 0;
    let matchedItems = 0;
    allProps.forEach((v, name) => {
      if (v.web && !webOnlyProps.has(name)) { webItems++; if (v.ios || v.android) matchedItems++; }
    });
    allEvents.forEach((v, name) => {
      // Only skip web-only events when no native platform has them
      const isWebOnly = webOnlyEvents.has(name) && !v.ios && !v.android;
      if (v.web && !isWebOnly) { webItems++; if (v.ios || v.android) matchedItems++; }
    });
    const parityPct = webItems > 0 ? Math.round((matchedItems / webItems) * 100) : (ios || android ? 100 : 0);
    const parityClass = parityPct >= 80 ? 'high' : parityPct >= 50 ? 'mid' : 'low';

    html += `
<div class="component">
  <div class="component-header" onclick="this.nextElementSibling.classList.toggle('open')">
    ${displayName}
    <span class="badge ${web ? 'yes' : 'no'}">${web ? 'Web' : 'No Web'}</span>
    <span class="badge ${ios ? 'yes' : 'no'}">${ios ? 'iOS' : 'No iOS'}</span>
    <span class="badge ${android ? 'yes' : 'no'}">${android ? 'Android' : 'No Android'}</span>
    <span class="parity-meter"><span class="parity-fill ${parityClass}" style="width:${parityPct}%"></span></span>
    <span style="font-size:12px;color:#71767a;">${parityPct}%</span>
  </div>
  <div class="component-body">
    <div class="file-path" style="padding:8px 12px;">
      ${web ? `Web: ${web.file}` : ''}
      ${ios ? `<br>iOS: ${ios.file}` : ''}
      ${android ? `<br>Android: ${android.file}` : ''}
    </div>
    <div class="section-label">Properties <button class="toggle-excluded" onclick="document.body.classList.toggle('show-excluded')">Toggle web-only / native-only props</button></div>
    <table>
      <tr><th>Property</th><th>Web</th><th>iOS</th><th>Android</th></tr>
      ${Array.from(allProps.entries()).map(([name, platforms]) => {
        const hasGap = (!platforms.web || !platforms.ios || !platforms.android) && (platforms.web || platforms.ios || platforms.android);
        const isExcluded = (webOnlyProps.has(name) && platforms.web && !platforms.ios && !platforms.android) ||
                           (nativeOnlyProps.has(name) && !platforms.web && (platforms.ios || platforms.android));
        const rowClass = isExcluded ? 'excluded-row' : (hasGap ? 'gap-row' : '');
        return `<tr class="${rowClass}">
          <td><strong>${name}</strong></td>
          <td>${platforms.web ? `<span class="check">✓</span> <span class="prop-type">${platforms.web.type}</span>` : '<span class="cross">✗</span>'}</td>
          <td>${platforms.ios ? `<span class="check">✓</span> <span class="prop-type">${platforms.ios.type}</span>` : '<span class="cross">✗</span>'}</td>
          <td>${platforms.android ? `<span class="check">✓</span> <span class="prop-type">${platforms.android.type}</span>` : '<span class="cross">✗</span>'}</td>
        </tr>`;
      }).join('')}
    </table>
    <div class="section-label">Events / Callbacks</div>
    <table>
      <tr><th>Event</th><th>Web</th><th>iOS</th><th>Android</th></tr>
      ${Array.from(allEvents.entries()).map(([name, platforms]) => {
        const hasGap = (!platforms.web || !platforms.ios || !platforms.android) && (platforms.web || platforms.ios || platforms.android);
        const isExcluded = (webOnlyEvents.has(name) && platforms.web && !platforms.ios && !platforms.android) ||
                           (nativeOnlyEvents.has(name) && !platforms.web && (platforms.ios || platforms.android));
        const rowClass = isExcluded ? 'excluded-row' : (hasGap ? 'gap-row' : '');
        return `<tr class="${rowClass}">
          <td><strong>${name}</strong></td>
          <td>${platforms.web ? '<span class="check">✓</span>' : '<span class="cross">✗</span>'}</td>
          <td>${platforms.ios ? '<span class="check">✓</span>' : '<span class="cross">✗</span>'}</td>
          <td>${platforms.android ? '<span class="check">✓</span>' : '<span class="cross">✗</span>'}</td>
        </tr>`;
      }).join('')}
    </table>
  </div>
</div>`;
  }

  html += `
<script>
  // Expand all / collapse all
  document.addEventListener('keydown', e => {
    if (e.key === 'e' && e.ctrlKey) {
      e.preventDefault();
      const bodies = document.querySelectorAll('.component-body');
      const allOpen = Array.from(bodies).every(b => b.classList.contains('open'));
      bodies.forEach(b => b.classList.toggle('open', !allOpen));
    }
  });
</script>
</body>
</html>`;

  return html;
}

// ── Prop name normalization ──────────────────────────────────

function mapPropName(name: string, platform: 'ios' | 'android'): string {
  // Normalize platform-specific naming to web convention
  // Strip common prefixes
  let normalized = name;

  // iOS: isRequired -> required, isTile -> tile, etc.
  if (normalized.startsWith('is') && normalized.length > 2 && normalized[2] === normalized[2].toUpperCase()) {
    normalized = normalized[2].toLowerCase() + normalized.slice(3);
  }

  const map: Record<string, string> = {
    // Common renames
    formName: 'name',
    formState: 'formState',
    formValidate: 'formValidate',
    isPii: 'pii',
    maskType: 'mask',
    inputType: 'type',
    noResultsText: 'noResultsText',
    maxSize: 'maxSize',
    maxFiles: 'maxFiles',
    browseText: 'browseText',
    removeText: 'removeText',
    monthLabel: 'monthLabel',
    dayLabel: 'dayLabel',
    yearLabel: 'yearLabel',
    requiredMessage: 'requiredMessage',
    orientation: 'orientation',
    values: 'value',
    maxLength: 'maxlength',
    minLength: 'minlength',
    maxlength: 'maxlength',
    maxwords: 'maxwords',
    placeholder: 'placeholder',
    rows: 'rows',
    indeterminate: 'indeterminate',
    description: 'description',
    emptyLabel: 'emptyLabel',
    legend: 'legend',
    options: 'options',
    accept: 'accept',
    multiple: 'multiple',
    min: 'min',
    max: 'max',
    locale: 'locale',
    width: 'width',
  };

  return map[normalized] || normalized;
}

function mapEventName(name: string): string {
  const map: Record<string, string> = {
    // Web events
    'civ-input': 'civ-input',
    'civ-change': 'civ-change',
    'civ-reset': 'civ-reset',
    'civ-analytics': 'civ-analytics',
    'civ-submit': 'civ-submit',
    'civ-invalid': 'civ-invalid',
    'civ-dismiss': 'civ-dismiss',
    // iOS/Android callbacks -> web event names
    onChange: 'civ-change',
    onInput: 'civ-input',
    onAnalytics: 'civ-analytics',
    onSubmit: 'civ-submit',
    onValueChange: 'civ-change',
    onCheckedChange: 'civ-change',
    onValuesChange: 'civ-change',
    onFilesChange: 'civ-change',
    onDismiss: 'civ-dismiss',
    onSelect: 'civ-change',
  };
  return map[name] || name;
}

// ── Main ─────────────────────────────────────────────────────

const report = generateReport();
const outputPath = join(ROOT, 'tools/parity-report.html');
writeFileSync(outputPath, report);
console.log(`Parity report generated: ${outputPath}`);
console.log('Open in browser to view.');
