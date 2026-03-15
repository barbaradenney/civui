/**
 * SwiftUI Generator
 *
 * Generates a SwiftUI View from a CivUI component schema.
 * Output matches the hand-written CivUI iOS patterns:
 * - SwiftUI struct conforming to View
 * - CivTokens for colors, spacing, typography
 * - Dark mode via @Environment(\.colorScheme)
 * - VoiceOver accessibility
 * - Two-color focus ring via .civFocusRing()
 */

import type { ComponentSchema, PropDef } from '@civui/schema/types';
import { WIDTH_NATIVE_NAMES, INPUT_TYPE_NATIVE_NAMES } from '@civui/schema/naming-maps';
import { toComponentName } from '../utils/naming.js';

function swiftType(prop: PropDef, name: string): string {
  if (prop.type === 'enum' && prop.values) {
    return `Civ${toComponentName(`-${name}`)}`;
  }
  switch (prop.type) {
    case 'string':
      return 'String';
    case 'boolean':
      return 'Bool';
    case 'number':
      return 'Int';
    default:
      return 'String';
  }
}

function swiftDefault(prop: PropDef): string {
  if (prop.default === undefined) return '';
  if (typeof prop.default === 'string') return prop.default === '' ? ' = nil' : ` = "${prop.default}"`;
  if (typeof prop.default === 'boolean') return ` = ${prop.default}`;
  if (typeof prop.default === 'number') return ` = ${prop.default}`;
  return '';
}

function isOptional(prop: PropDef): boolean {
  return prop.default === undefined || prop.default === '';
}

function generateEnum(name: string, prop: PropDef): string {
  if (prop.type !== 'enum' || !prop.values) return '';

  const enumName = `Civ${toComponentName(`-${name}`)}`;
  const lines = [`public enum ${enumName} {`];

  for (const v of prop.values) {
    const caseName = /^\d/.test(v) ? `_${v}` : v;
    lines.push(`    case ${caseName}`);
  }

  // Width enum gets a points computed property
  if (name === 'width') {
    lines.push('');
    lines.push('    var points: CGFloat? {');
    lines.push('        switch self {');
    for (const v of prop.values) {
      const caseName = /^\d/.test(v) ? `_${v}` : v;
      // Look up from schema widths later — for now use pattern
      lines.push(`        case .${caseName}: return nil // set by schema widths`);
    }
    lines.push('        }');
    lines.push('    }');
  }

  lines.push('}');
  return lines.join('\n');
}

function generateWidthEnum(schema: ComponentSchema): string {
  if (!schema.widths) return '';

  const lines = [
    '/// Width variant for CivTextInput (parallels web `width` prop).',
    'public enum CivInputWidth {',
  ];

  for (const [key] of Object.entries(schema.widths)) {
    const caseName = WIDTH_NATIVE_NAMES[key] || key;
    lines.push(`    case ${caseName}`);
  }

  lines.push('');
  lines.push('    var points: CGFloat? {');
  lines.push('        switch self {');

  for (const [key, w] of Object.entries(schema.widths)) {
    const caseName = WIDTH_NATIVE_NAMES[key] || key;
    lines.push(`        case .${caseName}: return ${w.iosPoints === null ? 'nil' : w.iosPoints}`);
  }

  lines.push('        }');
  lines.push('    }');
  lines.push('}');

  return lines.join('\n');
}

function generateInputTypeEnum(schema: ComponentSchema): string {
  const typeProp = schema.props['type'];
  if (!typeProp || typeProp.type !== 'enum' || !typeProp.values) return '';

  const lines = [
    '/// Keyboard type mapping for CivTextInput (parallels web `type` attribute).',
    'public enum CivInputType {',
  ];

  for (const v of typeProp.values) {
    const caseName = INPUT_TYPE_NATIVE_NAMES[v] || v;
    lines.push(`    case ${caseName}`);
  }

  lines.push('}');
  return lines.join('\n');
}

function generateKeyboardMapping(schema: ComponentSchema): string {
  const map = schema.platform?.ios?.keyboardType;
  if (!map) return '';

  const lines = [
    '',
    '    private var keyboardType: UIKeyboardType {',
    '        switch inputType {',
  ];

  for (const [key, value] of Object.entries(map)) {
    lines.push(`        case .${key}: return ${value}`);
  }

  lines.push('        }');
  lines.push('    }');
  return lines.join('\n');
}

function generateContentTypeMapping(schema: ComponentSchema): string {
  const map = schema.platform?.ios?.contentType;
  if (!map) return '';

  const lines = [
    '',
    '    private var contentType: UITextContentType? {',
    '        switch inputType {',
  ];

  for (const [key, value] of Object.entries(map)) {
    lines.push(`        case .${key}: return ${value}`);
  }

  lines.push('        default: return nil');
  lines.push('        }');
  lines.push('    }');
  return lines.join('\n');
}

function generateAutocapMapping(schema: ComponentSchema): string {
  const map = schema.platform?.ios?.autocapitalization;
  if (!map) return '';

  const lines = [
    '',
    '    private var autocapitalization: TextInputAutocapitalization {',
    '        switch inputType {',
  ];

  for (const [key, value] of Object.entries(map)) {
    if (key === '_default') continue;
    lines.push(`        case .${key}: return ${value}`);
  }

  const defaultVal = map['_default'] || '.sentences';
  lines.push(`        default: return ${defaultVal}`);
  lines.push('        }');
  lines.push('    }');
  return lines.join('\n');
}

export function generateSwiftUI(schema: ComponentSchema): string {
  const componentName = `Civ${toComponentName(schema.name)}`;

  const inputTypeEnum = generateInputTypeEnum(schema);
  const widthEnum = generateWidthEnum(schema);

  // Build properties
  const propLines: string[] = [];
  propLines.push(`    /// Visible label text (required — never use placeholder as sole label).`);
  propLines.push(`    public let label: String`);
  propLines.push('');
  propLines.push(`    /// Bound input value.`);
  propLines.push(`    @Binding public var value: String`);

  // Schema-specific props (skip label/value — handled above)
  for (const [name, prop] of Object.entries(schema.props)) {
    if (name === 'label' || name === 'value') continue;

    const swName = name === 'type' ? 'inputType' : name;
    const swType = name === 'type' ? 'CivInputType' : name === 'width' ? 'CivInputWidth' : swiftType(prop, name);
    const opt = isOptional(prop) ? '?' : '';

    propLines.push('');
    propLines.push(`    /// ${prop.description}`);

    if (prop.type === 'boolean') {
      propLines.push(`    public var ${swName === 'required' ? 'isRequired' : swName === 'disabled' ? 'isDisabled' : swName}: ${swType}`);
    } else if (isOptional(prop)) {
      propLines.push(`    public var ${swName}: ${swType}${opt}`);
    } else {
      propLines.push(`    public var ${swName}: ${swType}`);
    }
  }

  // Base props from CivFormElement (hint, error, required, disabled)
  propLines.push('');
  propLines.push('    /// Help text shown below the label.');
  propLines.push('    public var hint: String?');
  propLines.push('');
  propLines.push('    /// Error message. When set, renders with VoiceOver announcement.');
  propLines.push('    public var error: String?');
  propLines.push('');
  propLines.push('    /// Whether the field is required.');
  propLines.push('    public var isRequired: Bool');
  propLines.push('');
  propLines.push('    /// Whether the field is disabled.');
  propLines.push('    public var isDisabled: Bool');
  propLines.push('');
  propLines.push('    /// Called on every value change (parallels `civ-input` event).');
  propLines.push('    public var onInput: ((String) -> Void)?');
  propLines.push('');
  propLines.push('    /// Called on committed change / focus loss (parallels `civ-change` event).');
  propLines.push('    public var onChange: ((String) -> Void)?');

  // Internal state
  const stateLines = [
    '',
    '    // MARK: - Internal State',
    '',
    '    @FocusState private var isFocused: Bool',
    '    @Environment(\\.colorScheme) private var colorScheme',
  ];

  const keyboardMapping = generateKeyboardMapping(schema);
  const contentTypeMapping = generateContentTypeMapping(schema);
  const autocapMapping = generateAutocapMapping(schema);

  const lines = [
    `// Auto-generated by @civui/codegen — do not edit`,
    `// Source: packages/schema/src/components/${schema.name}.schema.ts`,
    '',
    `// CivUI — ${componentName} for SwiftUI`,
    '// Accessible text input following government design system patterns.',
    '// Renders: label → hint → error → input (Section 508 compliant)',
    '',
    'import SwiftUI',
    '',
    inputTypeEnum,
    '',
    widthEnum,
    '',
    `/// ${schema.description}`,
    `public struct ${componentName}: View {`,
    '    // MARK: - Properties',
    '',
    ...propLines,
    ...stateLines,
    '',
    '    // MARK: - Initializer',
    '',
    generateInitializer(schema, componentName),
    '',
    '    // MARK: - Body',
    '',
    generateBody(schema),
    '',
    '    // MARK: - Subviews',
    '',
    generateLabelView(),
    '',
    generateInputField(schema),
    '',
    '    // MARK: - Border',
    '',
    generateBorderViews(),
    '',
    '    // MARK: - Input Binding',
    '',
    generateInputBinding(),
    '',
    '    // MARK: - Keyboard & Content Type Mapping',
    keyboardMapping,
    contentTypeMapping,
    autocapMapping,
    '',
    '    // MARK: - Accessibility',
    '',
    generateAccessibility(),
    '',
    '    // MARK: - Color Helper',
    '',
    '    private func adaptiveColor(light: Color, dark: Color) -> Color {',
    '        colorScheme == .dark ? dark : light',
    '    }',
    '}',
    '',
    generatePreview(componentName),
  ];

  return lines.join('\n') + '\n';
}

function generateInitializer(schema: ComponentSchema, componentName: string): string {
  const params: string[] = [
    '        label: String,',
    '        value: Binding<String>,',
  ];

  params.push('        hint: String? = nil,');
  params.push('        error: String? = nil,');
  params.push('        isRequired: Bool = false,');
  params.push('        isDisabled: Bool = false,');

  for (const [name, prop] of Object.entries(schema.props)) {
    if (name === 'label' || name === 'value') continue;
    const swName = name === 'type' ? 'inputType' : name;
    if (prop.type === 'boolean') continue; // handled via isRequired/isDisabled above

    if (name === 'type') {
      params.push(`        inputType: CivInputType = .${prop.default || 'text'},`);
    } else if (name === 'width') {
      const defaultCase = prop.default === 'default' ? 'full' : prop.default;
      params.push(`        width: CivInputWidth = .${defaultCase},`);
    } else if (isOptional(prop)) {
      params.push(`        ${swName}: String? = nil,`);
    }
  }

  params.push('        onInput: ((String) -> Void)? = nil,');
  params.push('        onChange: ((String) -> Void)? = nil');

  const assignments: string[] = [
    '        self.label = label',
    '        self._value = value',
    '        self.hint = hint',
    '        self.error = error',
    '        self.isRequired = isRequired',
    '        self.isDisabled = isDisabled',
  ];

  for (const [name, prop] of Object.entries(schema.props)) {
    if (name === 'label' || name === 'value') continue;
    if (prop.type === 'boolean') continue;
    const swName = name === 'type' ? 'inputType' : name;
    assignments.push(`        self.${swName} = ${swName}`);
  }

  assignments.push('        self.onInput = onInput');
  assignments.push('        self.onChange = onChange');

  return [
    `    public init(`,
    ...params,
    `    ) {`,
    ...assignments,
    `    }`,
  ].join('\n');
}

function generateBody(schema: ComponentSchema): string {
  return [
    '    public var body: some View {',
    '        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {',
    '            // 1. Label',
    '            labelView',
    '',
    '            // 2. Hint',
    '            if let hint {',
    '                Text(hint)',
    '                    .font(.system(size: CivTokens.Typography.FontSize.sm))',
    '                    .foregroundColor(adaptiveColor(',
    '                        light: CivTokens.Colors.Base.dark,',
    '                        dark: CivTokens.DarkColors.Base.dark',
    '                    ))',
    '                    .accessibilityIdentifier("civ-hint")',
    '            }',
    '',
    '            // 3. Error',
    '            if let error {',
    '                Text(error)',
    '                    .font(.system(size: CivTokens.Typography.FontSize.sm,',
    '                                  weight: CivTokens.Typography.FontWeight.bold))',
    '                    .foregroundColor(adaptiveColor(',
    '                        light: CivTokens.Colors.Error.default_,',
    '                        dark: CivTokens.DarkColors.Error.default_',
    '                    ))',
    '                    .accessibilityIdentifier("civ-error")',
    '                    // role="alert" equivalent — announce immediately',
    '                    .accessibilityAddTraits(.updatesFrequently)',
    '            }',
    '',
    '            // 4. Input',
    '            inputField',
    '        }',
    '        .padding(.bottom, CivTokens.Spacing._4)',
    '        .accessibilityElement(children: .contain)',
    '    }',
  ].join('\n');
}

function generateLabelView(): string {
  return [
    '    private var labelView: some View {',
    '        HStack(spacing: CivTokens.Spacing._0_5) {',
    '            Text(label)',
    '                .font(.system(size: CivTokens.Typography.FontSize.base,',
    '                              weight: CivTokens.Typography.FontWeight.bold))',
    '                .foregroundColor(adaptiveColor(',
    '                    light: CivTokens.Colors.Base.darkest,',
    '                    dark: CivTokens.DarkColors.Base.darkest',
    '                ))',
    '',
    '            if isRequired {',
    '                Text("*")',
    '                    .font(.system(size: CivTokens.Typography.FontSize.base,',
    '                                  weight: CivTokens.Typography.FontWeight.bold))',
    '                    .foregroundColor(adaptiveColor(',
    '                        light: CivTokens.Colors.Error.default_,',
    '                        dark: CivTokens.DarkColors.Error.default_',
    '                    ))',
    '                    .accessibilityLabel("required")',
    '            }',
    '        }',
    '    }',
  ].join('\n');
}

function generateInputField(schema: ComponentSchema): string {
  return [
    '    @ViewBuilder',
    '    private var inputField: some View {',
    '        let field = Group {',
    '            if inputType == .password {',
    '                SecureField(placeholder ?? "", text: inputBinding)',
    '                    .textFieldStyle(.plain)',
    '            } else {',
    '                TextField(placeholder ?? "", text: inputBinding)',
    '                    .textFieldStyle(.plain)',
    '                    .keyboardType(keyboardType)',
    '                    .textContentType(contentType)',
    '                    .textInputAutocapitalization(autocapitalization)',
    '            }',
    '        }',
    '        .font(.system(size: CivTokens.Typography.FontSize.base))',
    '        .padding(.horizontal, CivTokens.Spacing._2)',
    '        .padding(.vertical, CivTokens.Spacing._1_5)',
    '        .background(adaptiveColor(',
    '            light: CivTokens.Colors.White.default_,',
    '            dark: CivTokens.DarkColors.White.default_',
    '        ))',
    '        .cornerRadius(CivTokens.Border.Radius.default_)',
    '        .overlay(borderOverlay)',
    '        .civFocusRing(isFocused)',
    '        .focused($isFocused)',
    '        .disabled(isDisabled)',
    '        .opacity(isDisabled ? 0.5 : 1.0)',
    '        .frame(maxWidth: width.points ?? .infinity, alignment: .leading)',
    '        // Accessibility',
    '        .accessibilityLabel(accessibilityLabelText)',
    '        .accessibilityHint(accessibilityHintText)',
    '        .accessibilityValue(value)',
    '        .accessibilityAddTraits(isRequired ? .startsMediaSession : [])',
    '',
    '        if #available(iOS 17.0, *) {',
    '            field',
    '                .onChange(of: isFocused) { oldValue, newValue in',
    '                    if oldValue && !newValue {',
    '                        onChange?(value)',
    '                    }',
    '                }',
    '        } else {',
    '            field',
    '                .onChange(of: isFocused) { newValue in',
    '                    if !newValue {',
    '                        onChange?(value)',
    '                    }',
    '                }',
    '        }',
    '    }',
  ].join('\n');
}

function generateBorderViews(): string {
  return [
    '    private var borderOverlay: some View {',
    '        RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)',
    '            .stroke(borderColor, lineWidth: error != nil',
    '                ? CivTokens.Border.Width._2',
    '                : CivTokens.Border.Width.default_)',
    '    }',
    '',
    '    private var borderColor: Color {',
    '        if error != nil {',
    '            return adaptiveColor(',
    '                light: CivTokens.Colors.Error.default_,',
    '                dark: CivTokens.DarkColors.Error.default_',
    '            )',
    '        }',
    '        return adaptiveColor(',
    '            light: CivTokens.Colors.Base.light,',
    '            dark: CivTokens.DarkColors.Base.light',
    '        )',
    '    }',
  ].join('\n');
}

function generateInputBinding(): string {
  return [
    '    private var inputBinding: Binding<String> {',
    '        Binding(',
    '            get: { value },',
    '            set: { newValue in',
    '                value = newValue',
    '                onInput?(newValue)',
    '            }',
    '        )',
    '    }',
  ].join('\n');
}

function generateAccessibility(): string {
  return [
    '    private var accessibilityLabelText: String {',
    '        var parts = [label]',
    '        if isRequired { parts.append("required") }',
    '        return parts.joined(separator: ", ")',
    '    }',
    '',
    '    private var accessibilityHintText: String {',
    '        var parts: [String] = []',
    '        if let hint { parts.append(hint) }',
    '        if let error { parts.append("Error: \\(error)") }',
    '        return parts.joined(separator: ". ")',
    '    }',
  ].join('\n');
}

function generatePreview(componentName: string): string {
  return [
    '#if DEBUG',
    `struct ${componentName}_Previews: PreviewProvider {`,
    '    struct PreviewWrapper: View {',
    '        @State private var email = ""',
    '        @State private var name = "Jane Doe"',
    '',
    '        var body: some View {',
    '            ScrollView {',
    '                VStack(alignment: .leading, spacing: 0) {',
    `                    ${componentName}(`,
    '                        label: "Full name",',
    '                        value: $name,',
    '                        hint: "First and last name",',
    '                        isRequired: true',
    '                    )',
    '',
    `                    ${componentName}(`,
    '                        label: "Email address",',
    '                        value: $email,',
    '                        hint: "For example: name@agency.gov",',
    '                        isRequired: true,',
    '                        inputType: .email',
    '                    )',
    '                }',
    '                .padding()',
    '            }',
    '        }',
    '    }',
    '',
    '    static var previews: some View {',
    '        PreviewWrapper()',
    '            .previewDisplayName("Light")',
    '        PreviewWrapper()',
    '            .preferredColorScheme(.dark)',
    '            .previewDisplayName("Dark")',
    '    }',
    '}',
    '#endif',
  ].join('\n');
}
