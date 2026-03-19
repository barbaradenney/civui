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

  return { name, props, events, file: filePath.replace(ROOT + '/', '') };
}

// ── iOS (Swift) parser ───────────────────────────────────────

function parseSwiftComponent(filePath: string): ComponentAPI | null {
  if (!existsSync(filePath)) return null;
  const src = readFileSync(filePath, 'utf-8');

  const name = basename(filePath, '.swift').replace('Civ', '');
  const props: PropDef[] = [];
  const events: EventDef[] = [];
  const seen = new Set<string>();

  // Parse ALL lines that look like property declarations
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

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

// ── Android (Kotlin) parser ──────────────────────────────────

function parseKotlinComponent(filePath: string): ComponentAPI | null {
  if (!existsSync(filePath)) return null;
  const src = readFileSync(filePath, 'utf-8');

  const name = basename(filePath, '.kt').replace('Civ', '');
  const props: PropDef[] = [];
  const events: EventDef[] = [];

  // Find the main @Composable function and extract parameters
  // Pattern: fun CivName(\n  param: Type = default,\n  ...
  const funcRegex = /(?:@Composable\s+)?fun\s+Civ\w+\s*\(([\s\S]*?)\)\s*\{/;
  const funcMatch = funcRegex.exec(src);
  if (funcMatch) {
    const params = funcMatch[1];
    // Parse each parameter line
    const paramRegex = /(\w+):\s*([^=,\n]+?)(?:\s*=\s*([^,\n]+))?\s*[,)]/g;
    let m;
    while ((m = paramRegex.exec(params)) !== null) {
      const paramName = m[1].trim();
      const type = m[2].trim();
      const defaultVal = m[3]?.trim();

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
  const childComponents = new Set(['Segment', 'RadioGroup']);

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

  // Match iOS files
  if (existsSync(IOS_DIR)) {
    for (const file of readdirSync(IOS_DIR).filter(f => f.endsWith('.swift') && f.startsWith('Civ'))) {
      const name = file.replace('Civ', '').replace('.swift', '');
      if (name === 'Tokens' || name === 'UI' || name === 'Locale' || name === 'FormState') continue;
      if (!nameMap[name]) nameMap[name] = { displayName: name };
      nameMap[name].ios = join(IOS_DIR, file);
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
    const ios = comp.ios ? parseSwiftComponent(comp.ios) : null;
    const android = comp.android ? parseKotlinComponent(comp.android) : null;
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
      'dragText', 'browseText', 'acceptedLabel', 'maxSizeLabel', 'removeText', 'removeAriaLabel',
      'filesListLabel', 'fileAddedMessage', 'fileRemovedMessage', 'fileSizeError', 'fileTypeError',
      'maxFilesError', 'requiredMessage', 'noResultsText',
      // Web-only internal
      'formValidate', 'pii', 'parts',
    ]);

    // Web-only events
    const webOnlyEvents = new Set([
      'civ-reset', // native handles reset differently
    ]);

    // Calculate parity: what % of web props/events exist on at least one native platform
    let webItems = 0;
    let matchedItems = 0;
    allProps.forEach((v, name) => {
      if (v.web && !webOnlyProps.has(name)) { webItems++; if (v.ios || v.android) matchedItems++; }
    });
    allEvents.forEach((v, name) => {
      if (v.web && !webOnlyEvents.has(name)) { webItems++; if (v.ios || v.android) matchedItems++; }
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
    <div class="section-label">Properties</div>
    <table>
      <tr><th>Property</th><th>Web</th><th>iOS</th><th>Android</th></tr>
      ${Array.from(allProps.entries()).map(([name, platforms]) => {
        const hasGap = (!platforms.web || !platforms.ios || !platforms.android) && (platforms.web || platforms.ios || platforms.android);
        return `<tr class="${hasGap ? 'gap-row' : ''}">
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
        return `<tr class="${hasGap ? 'gap-row' : ''}">
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
  };
  return map[name] || name;
}

// ── Main ─────────────────────────────────────────────────────

const report = generateReport();
const outputPath = join(ROOT, 'tools/parity-report.html');
writeFileSync(outputPath, report);
console.log(`Parity report generated: ${outputPath}`);
console.log('Open in browser to view.');
