/**
 * SwiftUI Generator
 *
 * Generates a SwiftUI View from a CivUI component schema.
 * Supports all component patterns:
 * - Text input / textarea (TextField, TextEditor)
 * - Select (Picker with .menu style)
 * - Checkbox / toggle (Toggle with appropriate style)
 * - Group containers (fieldset, radio-group, checkbox-group)
 * - Date picker (native DatePicker)
 * - Memorable date (three-field composition)
 * - File upload (document picker)
 * - Segmented control (Picker .segmented)
 * - Combobox (searchable list)
 * - Form / form-group (structural containers)
 */

import type { ComponentSchema, PropDef } from '@civui/schema/types';
import { WIDTH_NATIVE_NAMES, INPUT_TYPE_NATIVE_NAMES } from '@civui/schema/naming-maps';
import { toComponentName } from '../utils/naming.js';

// ---------------------------------------------------------------------------
// Pattern detection
// ---------------------------------------------------------------------------

type ComponentPattern =
  | 'textInput'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'toggle'
  | 'radioGroup'
  | 'checkboxGroup'
  | 'combobox'
  | 'datePicker'
  | 'memorableDate'
  | 'fileUpload'
  | 'segmented'
  | 'form'
  | 'formGroup'
  | 'fieldset';

function detectPattern(schema: ComponentSchema): ComponentPattern {
  const name = schema.name;
  if (name === 'civ-textarea') return 'textarea';
  if (name === 'civ-select') return 'select';
  if (name === 'civ-checkbox') return 'checkbox';
  if (name === 'civ-toggle') return 'toggle';
  if (name === 'civ-radio-group') return 'radioGroup';
  if (name === 'civ-checkbox-group') return 'checkboxGroup';
  if (name === 'civ-combobox') return 'combobox';
  if (name === 'civ-date-picker') return 'datePicker';
  if (name === 'civ-memorable-date') return 'memorableDate';
  if (name === 'civ-file-upload') return 'fileUpload';
  if (name === 'civ-segmented-control') return 'segmented';
  if (name === 'civ-form') return 'form';
  if (name === 'civ-form-group') return 'formGroup';
  if (name === 'civ-fieldset') return 'fieldset';
  return 'textInput';
}

// ---------------------------------------------------------------------------
// Swift type helpers
// ---------------------------------------------------------------------------

function swiftType(prop: PropDef, name: string): string {
  if (prop.type === 'enum' && prop.values) {
    return `Civ${toComponentName(`-${name}`)}`;
  }
  switch (prop.type) {
    case 'string': return 'String';
    case 'boolean': return 'Bool';
    case 'number': return 'Int';
    case 'array': return '[CivOption]';
    default: return 'String';
  }
}

function isOptional(prop: PropDef): boolean {
  return prop.default === undefined || prop.default === '';
}

// ---------------------------------------------------------------------------
// Enum generators (reused from original)
// ---------------------------------------------------------------------------

function generateWidthEnum(schema: ComponentSchema): string {
  if (!schema.widths) return '';
  const lines = [
    '/// Width variant (parallels web `width` prop).',
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
    '/// Keyboard type mapping (parallels web `type` attribute).',
    'public enum CivInputType {',
  ];
  for (const v of typeProp.values) {
    const caseName = INPUT_TYPE_NATIVE_NAMES[v] || v;
    lines.push(`    case ${caseName}`);
  }
  lines.push('}');
  return lines.join('\n');
}

function generateOrientationEnum(): string {
  return [
    '/// Layout orientation for group children.',
    'public enum CivOrientation {',
    '    case vertical',
    '    case horizontal',
    '}',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Common subview generators
// ---------------------------------------------------------------------------

function labelView(labelProp: string = 'label'): string {
  return [
    '    private var labelView: some View {',
    '        HStack(spacing: CivTokens.Spacing._0_5) {',
    `            Text(${labelProp})`,
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

function hintView(): string {
  return [
    '    @ViewBuilder',
    '    private var hintView: some View {',
    '        if let hint {',
    '            Text(hint)',
    '                .font(.system(size: CivTokens.Typography.FontSize.sm))',
    '                .foregroundColor(adaptiveColor(',
    '                    light: CivTokens.Colors.Base.dark,',
    '                    dark: CivTokens.DarkColors.Base.dark',
    '                ))',
    '                .accessibilityIdentifier("civ-hint")',
    '        }',
    '    }',
  ].join('\n');
}

function errorView(): string {
  return [
    '    @ViewBuilder',
    '    private var errorView: some View {',
    '        if let error {',
    '            Text(error)',
    '                .font(.system(size: CivTokens.Typography.FontSize.sm,',
    '                              weight: CivTokens.Typography.FontWeight.bold))',
    '                .foregroundColor(adaptiveColor(',
    '                    light: CivTokens.Colors.Error.default_,',
    '                    dark: CivTokens.DarkColors.Error.default_',
    '                ))',
    '                .accessibilityIdentifier("civ-error")',
    '                .accessibilityAddTraits(.updatesFrequently)',
    '        }',
    '    }',
  ].join('\n');
}

function colorHelper(): string {
  return [
    '    private func adaptiveColor(light: Color, dark: Color) -> Color {',
    '        colorScheme == .dark ? dark : light',
    '    }',
  ].join('\n');
}

function borderViews(): string {
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

function accessibilityHelper(labelPropName: string = 'label'): string {
  return [
    `    private var accessibilityLabelText: String {`,
    `        var parts = [${labelPropName}]`,
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

// ---------------------------------------------------------------------------
// Platform-specific mapping generators
// ---------------------------------------------------------------------------

function keyboardMapping(schema: ComponentSchema): string {
  const map = schema.platform?.ios?.keyboardType;
  if (!map) return '';
  return [
    '',
    '    private var keyboardType: UIKeyboardType {',
    '        switch inputType {',
    ...Object.entries(map).map(([k, v]) => `        case .${INPUT_TYPE_NATIVE_NAMES[k] || k}: return ${v}`),
    '        }',
    '    }',
  ].join('\n');
}

function contentTypeMapping(schema: ComponentSchema): string {
  const map = schema.platform?.ios?.contentType;
  if (!map) return '';
  return [
    '',
    '    private var contentType: UITextContentType? {',
    '        switch inputType {',
    ...Object.entries(map).map(([k, v]) => `        case .${INPUT_TYPE_NATIVE_NAMES[k] || k}: return ${v}`),
    '        default: return nil',
    '        }',
    '    }',
  ].join('\n');
}

function autocapMapping(schema: ComponentSchema): string {
  const map = schema.platform?.ios?.autocapitalization;
  if (!map) return '';
  const entries = Object.entries(map).filter(([k]) => k !== '_default');
  const defaultVal = map['_default'] || '.sentences';
  return [
    '',
    '    private var autocapitalization: TextInputAutocapitalization {',
    '        switch inputType {',
    ...entries.map(([k, v]) => `        case .${INPUT_TYPE_NATIVE_NAMES[k] || k}: return ${v}`),
    `        default: return ${defaultVal}`,
    '        }',
    '    }',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Pattern-specific generators
// ---------------------------------------------------------------------------

function generateTextInputBody(schema: ComponentSchema): string {
  const hasWidth = !!schema.widths;
  const widthFrame = hasWidth
    ? '\n        .frame(maxWidth: width.points ?? .infinity, alignment: .leading)'
    : '';

  return [
    '    public var body: some View {',
    '        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {',
    '            labelView',
    '            hintView',
    '            errorView',
    '',
    '            let field = Group {',
    '                if inputType == .password {',
    '                    SecureField(placeholder ?? "", text: inputBinding)',
    '                        .textFieldStyle(.plain)',
    '                } else {',
    '                    TextField(placeholder ?? "", text: inputBinding)',
    '                        .textFieldStyle(.plain)',
    '                        .keyboardType(keyboardType)',
    '                        .textContentType(contentType)',
    '                        .textInputAutocapitalization(autocapitalization)',
    '                }',
    '            }',
    '            .font(.system(size: CivTokens.Typography.FontSize.base))',
    '            .padding(.horizontal, CivTokens.Spacing._2)',
    '            .padding(.vertical, CivTokens.Spacing._1_5)',
    '            .background(adaptiveColor(',
    '                light: CivTokens.Colors.White.default_,',
    '                dark: CivTokens.DarkColors.White.default_',
    '            ))',
    '            .cornerRadius(CivTokens.Border.Radius.default_)',
    '            .overlay(borderOverlay)',
    '            .civFocusRing(isFocused)',
    '            .focused($isFocused)',
    '            .disabled(isDisabled)',
    '            .opacity(isDisabled ? 0.5 : 1.0)' + widthFrame,
    '            .accessibilityLabel(accessibilityLabelText)',
    '            .accessibilityHint(accessibilityHintText)',
    '            .accessibilityValue(value)',
    '',
    '            if #available(iOS 17.0, *) {',
    '                field',
    '                    .onChange(of: isFocused) { oldValue, newValue in',
    '                        if oldValue && !newValue { onChange?(value) }',
    '                    }',
    '            } else {',
    '                field',
    '                    .onChange(of: isFocused) { newValue in',
    '                        if !newValue { onChange?(value) }',
    '                    }',
    '            }',
    '        }',
    '        .padding(.bottom, CivTokens.Spacing._4)',
    '        .accessibilityElement(children: .contain)',
    '    }',
  ].join('\n');
}

function generateTextareaBody(): string {
  return [
    '    public var body: some View {',
    '        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {',
    '            labelView',
    '            hintView',
    '            errorView',
    '',
    '            TextEditor(text: inputBinding)',
    '                .font(.system(size: CivTokens.Typography.FontSize.base))',
    '                .frame(minHeight: CGFloat(rows) * 20, alignment: .topLeading)',
    '                .padding(.horizontal, CivTokens.Spacing._2)',
    '                .padding(.vertical, CivTokens.Spacing._1_5)',
    '                .background(adaptiveColor(',
    '                    light: CivTokens.Colors.White.default_,',
    '                    dark: CivTokens.DarkColors.White.default_',
    '                ))',
    '                .cornerRadius(CivTokens.Border.Radius.default_)',
    '                .overlay(borderOverlay)',
    '                .civFocusRing(isFocused)',
    '                .focused($isFocused)',
    '                .disabled(isDisabled)',
    '                .opacity(isDisabled ? 0.5 : 1.0)',
    '                .accessibilityLabel(accessibilityLabelText)',
    '                .accessibilityHint(accessibilityHintText)',
    '',
    '            if let maxlength {',
    '                Text("\\(value.count)/\\(maxlength)")',
    '                    .font(.system(size: CivTokens.Typography.FontSize.xs))',
    '                    .foregroundColor(adaptiveColor(',
    '                        light: CivTokens.Colors.Base.dark,',
    '                        dark: CivTokens.DarkColors.Base.dark',
    '                    ))',
    '                    .frame(maxWidth: .infinity, alignment: .trailing)',
    '                    .accessibilityLabel("\\(maxlength - value.count) characters remaining")',
    '            }',
    '        }',
    '        .padding(.bottom, CivTokens.Spacing._4)',
    '        .accessibilityElement(children: .contain)',
    '    }',
  ].join('\n');
}

function generateSelectBody(): string {
  return [
    '    public var body: some View {',
    '        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {',
    '            labelView',
    '            hintView',
    '            errorView',
    '',
    '            Picker(label, selection: $value) {',
    '                Text(emptyLabel).tag("")',
    '                ForEach(options) { option in',
    '                    Text(option.label).tag(option.value)',
    '                }',
    '            }',
    '            .pickerStyle(.menu)',
    '            .padding(.horizontal, CivTokens.Spacing._2)',
    '            .padding(.vertical, CivTokens.Spacing._1_5)',
    '            .background(adaptiveColor(',
    '                light: CivTokens.Colors.White.default_,',
    '                dark: CivTokens.DarkColors.White.default_',
    '            ))',
    '            .cornerRadius(CivTokens.Border.Radius.default_)',
    '            .overlay(borderOverlay)',
    '            .disabled(isDisabled)',
    '            .opacity(isDisabled ? 0.5 : 1.0)',
    '            .accessibilityLabel(accessibilityLabelText)',
    '            .accessibilityHint(accessibilityHintText)',
    '        }',
    '        .padding(.bottom, CivTokens.Spacing._4)',
    '        .accessibilityElement(children: .contain)',
    '        .onChange(of: value) { _ in',
    '            onInput?(value)',
    '            onChange?(value)',
    '        }',
    '    }',
  ].join('\n');
}

function generateCheckboxBody(): string {
  return [
    '    public var body: some View {',
    '        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {',
    '            hintView',
    '            errorView',
    '',
    '            Toggle(isOn: checkedBinding) {',
    '                VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {',
    '                    HStack(spacing: CivTokens.Spacing._0_5) {',
    '                        Text(label)',
    '                            .font(.system(size: CivTokens.Typography.FontSize.base))',
    '                        if isRequired {',
    '                            Text("*")',
    '                                .foregroundColor(adaptiveColor(',
    '                                    light: CivTokens.Colors.Error.default_,',
    '                                    dark: CivTokens.DarkColors.Error.default_',
    '                                ))',
    '                                .accessibilityLabel("required")',
    '                        }',
    '                    }',
    '                    if let description {',
    '                        Text(description)',
    '                            .font(.system(size: CivTokens.Typography.FontSize.sm))',
    '                            .foregroundColor(adaptiveColor(',
    '                                light: CivTokens.Colors.Base.dark,',
    '                                dark: CivTokens.DarkColors.Base.dark',
    '                            ))',
    '                    }',
    '                }',
    '            }',
    '            .toggleStyle(.checkbox)',
    '            .disabled(isDisabled)',
    '            .opacity(isDisabled ? 0.5 : 1.0)',
    '            .accessibilityLabel(accessibilityLabelText)',
    '            .accessibilityHint(accessibilityHintText)',
    '        }',
    '        .padding(.bottom, CivTokens.Spacing._2)',
    '        .accessibilityElement(children: .contain)',
    '    }',
  ].join('\n');
}

function generateToggleBody(): string {
  return [
    '    public var body: some View {',
    '        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {',
    '            HStack(spacing: CivTokens.Spacing._3) {',
    '                Toggle("", isOn: checkedBinding)',
    '                    .toggleStyle(.switch)',
    '                    .labelsHidden()',
    '                    .disabled(isDisabled)',
    '',
    '                VStack(alignment: .leading, spacing: CivTokens.Spacing._0_5) {',
    '                    HStack(spacing: CivTokens.Spacing._0_5) {',
    '                        Text(label)',
    '                            .font(.system(size: CivTokens.Typography.FontSize.base))',
    '                        if isRequired {',
    '                            Text("*")',
    '                                .foregroundColor(adaptiveColor(',
    '                                    light: CivTokens.Colors.Error.default_,',
    '                                    dark: CivTokens.DarkColors.Error.default_',
    '                                ))',
    '                                .accessibilityLabel("required")',
    '                        }',
    '                    }',
    '                    if let description {',
    '                        Text(description)',
    '                            .font(.system(size: CivTokens.Typography.FontSize.sm))',
    '                            .foregroundColor(adaptiveColor(',
    '                                light: CivTokens.Colors.Base.dark,',
    '                                dark: CivTokens.DarkColors.Base.dark',
    '                            ))',
    '                    }',
    '                }',
    '            }',
    '            .opacity(isDisabled ? 0.5 : 1.0)',
    '            .accessibilityLabel(accessibilityLabelText)',
    '            .accessibilityHint(accessibilityHintText)',
    '',
    '            hintView',
    '            errorView',
    '        }',
    '        .padding(.bottom, CivTokens.Spacing._2)',
    '        .accessibilityElement(children: .contain)',
    '    }',
  ].join('\n');
}

function generateGroupBody(schema: ComponentSchema): string {
  const hasOrientation = !!schema.props['orientation'];
  const role = schema.a11y.role;
  const layoutLine = hasOrientation
    ? '            let layout = orientation == .horizontal ? AnyLayout(HStackLayout(spacing: CivTokens.Spacing._3)) : AnyLayout(VStackLayout(alignment: .leading, spacing: CivTokens.Spacing._2))'
    : '';
  const contentLine = hasOrientation
    ? '            layout { content() }'
    : '            content()';

  return [
    '    public var body: some View {',
    '        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {',
    '            // Legend',
    '            labelView',
    '            hintView',
    '            errorView',
    '',
    layoutLine,
    contentLine,
    '        }',
    '        .padding(.bottom, CivTokens.Spacing._4)',
    `        .accessibilityElement(children: .contain)`,
    role !== 'group' ? `        // Role: ${role}` : '',
    '    }',
  ].join('\n');
}

function generateDatePickerBody(): string {
  return [
    '    public var body: some View {',
    '        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {',
    '            labelView',
    '            hintView',
    '            errorView',
    '',
    '            DatePicker(',
    '                "",',
    '                selection: dateBinding,',
    '                in: dateRange,',
    '                displayedComponents: .date',
    '            )',
    '            .datePickerStyle(.compact)',
    '            .labelsHidden()',
    '            .disabled(isDisabled)',
    '            .opacity(isDisabled ? 0.5 : 1.0)',
    '            .accessibilityLabel(accessibilityLabelText)',
    '            .accessibilityHint(accessibilityHintText)',
    '        }',
    '        .padding(.bottom, CivTokens.Spacing._4)',
    '        .accessibilityElement(children: .contain)',
    '    }',
  ].join('\n');
}

function generateMemorableDateBody(): string {
  return [
    '    public var body: some View {',
    '        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {',
    '            labelView',
    '            hintView',
    '            errorView',
    '',
    '            HStack(spacing: CivTokens.Spacing._2) {',
    '                // Month picker',
    '                VStack(alignment: .leading) {',
    '                    Text(monthLabel)',
    '                        .font(.system(size: CivTokens.Typography.FontSize.sm))',
    '                    Picker(monthLabel, selection: $month) {',
    '                        Text(monthEmptyLabel).tag("")',
    '                        ForEach(1...12, id: \\.self) { m in',
    '                            Text(monthName(m)).tag(String(format: "%02d", m))',
    '                        }',
    '                    }',
    '                    .pickerStyle(.menu)',
    '                }',
    '',
    '                // Day field',
    '                VStack(alignment: .leading) {',
    '                    Text(dayLabel)',
    '                        .font(.system(size: CivTokens.Typography.FontSize.sm))',
    '                    TextField(dayPlaceholder, text: $day)',
    '                        .keyboardType(.numberPad)',
    '                        .frame(width: 60)',
    '                        .textFieldStyle(.plain)',
    '                        .padding(.horizontal, CivTokens.Spacing._2)',
    '                        .padding(.vertical, CivTokens.Spacing._1_5)',
    '                        .overlay(borderOverlay)',
    '                }',
    '',
    '                // Year field',
    '                VStack(alignment: .leading) {',
    '                    Text(yearLabel)',
    '                        .font(.system(size: CivTokens.Typography.FontSize.sm))',
    '                    TextField(yearPlaceholder, text: $year)',
    '                        .keyboardType(.numberPad)',
    '                        .frame(width: 80)',
    '                        .textFieldStyle(.plain)',
    '                        .padding(.horizontal, CivTokens.Spacing._2)',
    '                        .padding(.vertical, CivTokens.Spacing._1_5)',
    '                        .overlay(borderOverlay)',
    '                }',
    '            }',
    '            .disabled(isDisabled)',
    '            .opacity(isDisabled ? 0.5 : 1.0)',
    '        }',
    '        .padding(.bottom, CivTokens.Spacing._4)',
    '        .accessibilityElement(children: .contain)',
    '    }',
  ].join('\n');
}

function generateFileUploadBody(): string {
  return [
    '    public var body: some View {',
    '        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {',
    '            labelView',
    '            hintView',
    '            errorView',
    '',
    '            Button(action: { isPickerPresented = true }) {',
    '                VStack(spacing: CivTokens.Spacing._1) {',
    '                    Image(systemName: "arrow.up.doc")',
    '                        .font(.title2)',
    '                    Text(dragText)',
    '                        .font(.system(size: CivTokens.Typography.FontSize.sm))',
    '                    Text(browseText)',
    '                        .font(.system(size: CivTokens.Typography.FontSize.sm,',
    '                                      weight: CivTokens.Typography.FontWeight.bold))',
    '                        .foregroundColor(adaptiveColor(',
    '                            light: CivTokens.Colors.Primary.default_,',
    '                            dark: CivTokens.DarkColors.Primary.default_',
    '                        ))',
    '                }',
    '                .frame(maxWidth: .infinity)',
    '                .padding(CivTokens.Spacing._4)',
    '                .background(adaptiveColor(',
    '                    light: CivTokens.Colors.White.default_,',
    '                    dark: CivTokens.DarkColors.White.default_',
    '                ))',
    '                .cornerRadius(CivTokens.Border.Radius.default_)',
    '                .overlay(',
    '                    RoundedRectangle(cornerRadius: CivTokens.Border.Radius.default_)',
    '                        .stroke(style: StrokeStyle(lineWidth: 1, dash: [5]))',
    '                        .foregroundColor(borderColor)',
    '                )',
    '            }',
    '            .buttonStyle(.plain)',
    '            .disabled(isDisabled)',
    '            .opacity(isDisabled ? 0.5 : 1.0)',
    '            .accessibilityLabel(accessibilityLabelText)',
    '            .accessibilityHint(accessibilityHintText)',
    '',
    '            // Selected files list',
    '            if !selectedFiles.isEmpty {',
    '                VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {',
    '                    ForEach(selectedFiles, id: \\.self) { fileName in',
    '                        HStack {',
    '                            Text(fileName)',
    '                                .font(.system(size: CivTokens.Typography.FontSize.sm))',
    '                            Spacer()',
    '                            Button(removeText) {',
    '                                selectedFiles.removeAll { $0 == fileName }',
    '                            }',
    '                            .font(.system(size: CivTokens.Typography.FontSize.sm))',
    '                            .foregroundColor(adaptiveColor(',
    '                                light: CivTokens.Colors.Error.default_,',
    '                                dark: CivTokens.DarkColors.Error.default_',
    '                            ))',
    '                            .accessibilityLabel("\\(removeText) \\(fileName)")',
    '                        }',
    '                    }',
    '                }',
    '                .accessibilityLabel(filesListLabel)',
    '            }',
    '        }',
    '        .padding(.bottom, CivTokens.Spacing._4)',
    '        .accessibilityElement(children: .contain)',
    '    }',
  ].join('\n');
}

function generateSegmentedBody(): string {
  return [
    '    public var body: some View {',
    '        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {',
    '            if !legend.isEmpty {',
    '                Text(legend)',
    '                    .font(.system(size: CivTokens.Typography.FontSize.base,',
    '                                  weight: CivTokens.Typography.FontWeight.bold))',
    '                    .accessibilityHidden(true) // VoiceOver reads Picker label',
    '            }',
    '            hintView',
    '            errorView',
    '',
    '            Picker(legend, selection: $value) {',
    '                content()',
    '            }',
    '            .pickerStyle(.segmented)',
    '            .disabled(isDisabled)',
    '            .opacity(isDisabled ? 0.5 : 1.0)',
    '        }',
    '        .padding(.bottom, CivTokens.Spacing._4)',
    '        .accessibilityElement(children: .contain)',
    '        .onChange(of: value) { _ in',
    '            onInput?(value)',
    '            onChange?(value)',
    '        }',
    '    }',
  ].join('\n');
}

function generateComboboxBody(): string {
  return [
    '    public var body: some View {',
    '        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {',
    '            labelView',
    '            hintView',
    '            errorView',
    '',
    '            TextField(placeholder ?? "", text: $filterText)',
    '                .textFieldStyle(.plain)',
    '                .font(.system(size: CivTokens.Typography.FontSize.base))',
    '                .padding(.horizontal, CivTokens.Spacing._2)',
    '                .padding(.vertical, CivTokens.Spacing._1_5)',
    '                .background(adaptiveColor(',
    '                    light: CivTokens.Colors.White.default_,',
    '                    dark: CivTokens.DarkColors.White.default_',
    '                ))',
    '                .cornerRadius(CivTokens.Border.Radius.default_)',
    '                .overlay(borderOverlay)',
    '                .civFocusRing(isFocused)',
    '                .focused($isFocused)',
    '                .disabled(isDisabled)',
    '                .opacity(isDisabled ? 0.5 : 1.0)',
    '                .accessibilityLabel(accessibilityLabelText)',
    '                .onChange(of: filterText) { newValue in',
    '                    isOpen = !newValue.isEmpty',
    '                    onInput?(newValue)',
    '                }',
    '',
    '            if isOpen {',
    '                let filtered = options.filter {',
    '                    filterText.isEmpty || $0.label.localizedCaseInsensitiveContains(filterText)',
    '                }',
    '                if filtered.isEmpty {',
    '                    Text(noResultsText)',
    '                        .font(.system(size: CivTokens.Typography.FontSize.sm))',
    '                        .foregroundColor(adaptiveColor(',
    '                            light: CivTokens.Colors.Base.dark,',
    '                            dark: CivTokens.DarkColors.Base.dark',
    '                        ))',
    '                        .padding(CivTokens.Spacing._2)',
    '                } else {',
    '                    ScrollView {',
    '                        LazyVStack(alignment: .leading, spacing: 0) {',
    '                            ForEach(filtered) { option in',
    '                                Button(action: {',
    '                                    value = option.value',
    '                                    filterText = option.label',
    '                                    isOpen = false',
    '                                    onChange?(option.value)',
    '                                }) {',
    '                                    Text(option.label)',
    '                                        .frame(maxWidth: .infinity, alignment: .leading)',
    '                                        .padding(.horizontal, CivTokens.Spacing._2)',
    '                                        .padding(.vertical, CivTokens.Spacing._1_5)',
    '                                }',
    '                                .buttonStyle(.plain)',
    '                            }',
    '                        }',
    '                    }',
    '                    .frame(maxHeight: 200)',
    '                    .background(adaptiveColor(',
    '                        light: CivTokens.Colors.White.default_,',
    '                        dark: CivTokens.DarkColors.White.default_',
    '                    ))',
    '                    .cornerRadius(CivTokens.Border.Radius.default_)',
    '                    .overlay(borderOverlay)',
    '                }',
    '            }',
    '        }',
    '        .padding(.bottom, CivTokens.Spacing._4)',
    '        .accessibilityElement(children: .contain)',
    '    }',
  ].join('\n');
}

function generateFormBody(): string {
  return [
    '    public var body: some View {',
    '        VStack(alignment: .leading, spacing: 0) {',
    '            content()',
    '        }',
    '        .accessibilityElement(children: .contain)',
    '        .accessibilityLabel(formLabel.isEmpty ? "Form" : formLabel)',
    '    }',
  ].join('\n');
}

function generateFormGroupBody(): string {
  return [
    '    public var body: some View {',
    '        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {',
    '            labelView',
    '            hintView',
    '            errorView',
    '            content()',
    '        }',
    '        .padding(.bottom, CivTokens.Spacing._4)',
    '        .accessibilityElement(children: .contain)',
    '    }',
  ].join('\n');
}

function generateFieldsetBody(): string {
  return [
    '    public var body: some View {',
    '        VStack(alignment: .leading, spacing: CivTokens.Spacing._1) {',
    '            labelView',
    '            hintView',
    '            errorView',
    '            content()',
    '        }',
    '        .padding(.bottom, CivTokens.Spacing._4)',
    '        .disabled(isDisabled)',
    '        .opacity(isDisabled ? 0.5 : 1.0)',
    '        .accessibilityElement(children: .contain)',
    '    }',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Property and initializer generation per pattern
// ---------------------------------------------------------------------------

function generateProperties(schema: ComponentSchema, pattern: ComponentPattern): string {
  const lines: string[] = [];
  const isGroup = schema.isGroup;
  const labelProp = isGroup ? 'legend' : 'label';

  // Primary label prop
  if (pattern !== 'form') {
    lines.push(`    /// ${isGroup ? 'Group legend text.' : 'Visible label text (required — never use placeholder as sole label).'}`);
    lines.push(`    public let ${labelProp}: String`);
  }

  // Value binding based on pattern
  switch (pattern) {
    case 'textInput':
    case 'textarea':
    case 'combobox':
    case 'select':
    case 'radioGroup':
    case 'segmented':
      lines.push('');
      lines.push('    /// Bound value.');
      lines.push('    @Binding public var value: String');
      break;
    case 'checkbox':
    case 'toggle':
      lines.push('');
      lines.push('    /// Whether the control is in the checked/on state.');
      lines.push('    @Binding public var checked: Bool');
      break;
    case 'datePicker':
      lines.push('');
      lines.push('    /// Bound date value (YYYY-MM-DD string).');
      lines.push('    @Binding public var value: String');
      break;
    case 'memorableDate':
      lines.push('');
      lines.push('    /// Month component (01-12).');
      lines.push('    @Binding public var month: String');
      lines.push('    /// Day component (1-31).');
      lines.push('    @Binding public var day: String');
      lines.push('    /// Year component (4-digit).');
      lines.push('    @Binding public var year: String');
      break;
    case 'fileUpload':
      lines.push('');
      lines.push('    /// Array of selected file names.');
      lines.push('    @Binding public var selectedFiles: [String]');
      break;
    // form, formGroup, fieldset have no value binding
  }

  // Schema-specific props (excluding handled ones)
  const skip = new Set(['label', 'value', 'checked', 'legend']);
  for (const [name, prop] of Object.entries(schema.props)) {
    if (skip.has(name)) continue;

    const swName = name === 'type' ? 'inputType' : name;
    const swType = name === 'type' ? 'CivInputType' : name === 'width' ? 'CivInputWidth' : swiftType(prop, name);
    const opt = isOptional(prop) ? '?' : '';

    lines.push('');
    lines.push(`    /// ${prop.description}`);

    if (prop.type === 'boolean') {
      const boolName = swName === 'required' ? 'isRequired' : swName === 'disabled' ? 'isDisabled' : swName;
      lines.push(`    public var ${boolName}: ${swType}`);
    } else {
      lines.push(`    public var ${swName}: ${swType}${opt}`);
    }
  }

  // Standard form-element props (hint, error, required, disabled) — only if not already in schema
  if (!schema.props['hint']) {
    lines.push('');
    lines.push('    /// Help text shown below the label.');
    lines.push('    public var hint: String?');
  }
  if (!schema.props['error']) {
    lines.push('');
    lines.push('    /// Error message. When set, renders with VoiceOver announcement.');
    lines.push('    public var error: String?');
  }
  if (!schema.props['required']) {
    lines.push('');
    lines.push('    /// Whether the field is required.');
    lines.push('    public var isRequired: Bool');
  }
  if (!schema.props['disabled'] && pattern !== 'form') {
    lines.push('');
    lines.push('    /// Whether the field is disabled.');
    lines.push('    public var isDisabled: Bool');
  }

  // Callbacks
  if (schema.form.valueMode === 'string' && pattern !== 'form' && pattern !== 'formGroup' && pattern !== 'fieldset') {
    lines.push('');
    lines.push('    /// Called on every value change.');
    lines.push('    public var onInput: ((String) -> Void)?');
    lines.push('');
    lines.push('    /// Called on committed change.');
    lines.push('    public var onChange: ((String) -> Void)?');
  } else if (schema.form.valueMode === 'boolean') {
    lines.push('');
    lines.push('    /// Called on every checked state change.');
    lines.push('    public var onCheckedChange: ((Bool) -> Void)?');
  }

  // ViewBuilder content for slot-based components
  if (pattern === 'radioGroup' || pattern === 'checkboxGroup' || pattern === 'segmented' || pattern === 'form' || pattern === 'formGroup' || pattern === 'fieldset' || pattern === 'memorableDate') {
    // Only add @ViewBuilder content for truly slot-based ones
    if (['radioGroup', 'checkboxGroup', 'form', 'formGroup', 'fieldset', 'segmented'].includes(pattern)) {
      lines.push('');
      lines.push('    /// Child content (slot).');
      lines.push('    public let content: () -> AnyView');
    }
  }

  return lines.join('\n');
}

function generateInternalState(pattern: ComponentPattern): string {
  const lines: string[] = [
    '',
    '    // MARK: - Internal State',
    '',
    '    @Environment(\\.colorScheme) private var colorScheme',
  ];

  // Patterns that need focus tracking
  if (['textInput', 'textarea', 'combobox'].includes(pattern)) {
    lines.push('    @FocusState private var isFocused: Bool');
  }

  // Combobox internal state
  if (pattern === 'combobox') {
    lines.push('    @State private var filterText: String = ""');
    lines.push('    @State private var isOpen: Bool = false');
  }

  // Date picker needs date conversion state
  if (pattern === 'datePicker') {
    lines.push('    @State private var selectedDate: Date = Date()');
  }

  // File upload needs picker state
  if (pattern === 'fileUpload') {
    lines.push('    @State private var isPickerPresented: Bool = false');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Initializer generation
// ---------------------------------------------------------------------------

function generateInitializer(schema: ComponentSchema, componentName: string, pattern: ComponentPattern): string {
  const isGroup = schema.isGroup;
  const labelProp = isGroup ? 'legend' : 'label';
  const params: string[] = [];
  const assignments: string[] = [];

  // Primary label
  if (pattern !== 'form') {
    params.push(`        ${labelProp}: String,`);
    assignments.push(`        self.${labelProp} = ${labelProp}`);
  }

  // Value binding
  switch (pattern) {
    case 'textInput':
    case 'textarea':
    case 'combobox':
    case 'select':
    case 'radioGroup':
    case 'segmented':
    case 'datePicker':
      params.push('        value: Binding<String>,');
      assignments.push('        self._value = value');
      break;
    case 'checkbox':
    case 'toggle':
      params.push('        checked: Binding<Bool>,');
      assignments.push('        self._checked = checked');
      break;
    case 'memorableDate':
      params.push('        month: Binding<String>,');
      params.push('        day: Binding<String>,');
      params.push('        year: Binding<String>,');
      assignments.push('        self._month = month');
      assignments.push('        self._day = day');
      assignments.push('        self._year = year');
      break;
    case 'fileUpload':
      params.push('        selectedFiles: Binding<[String]>,');
      assignments.push('        self._selectedFiles = selectedFiles');
      break;
  }

  // Standard optional params
  if (!schema.props['hint']) {
    params.push('        hint: String? = nil,');
    assignments.push('        self.hint = hint');
  }
  if (!schema.props['error']) {
    params.push('        error: String? = nil,');
    assignments.push('        self.error = error');
  }
  if (!schema.props['required']) {
    params.push('        isRequired: Bool = false,');
    assignments.push('        self.isRequired = isRequired');
  }
  if (!schema.props['disabled'] && pattern !== 'form') {
    params.push('        isDisabled: Bool = false,');
    assignments.push('        self.isDisabled = isDisabled');
  }

  // Schema-specific props
  const skip = new Set(['label', 'value', 'checked', 'legend', 'hint', 'error', 'required', 'disabled']);
  for (const [name, prop] of Object.entries(schema.props)) {
    if (skip.has(name)) continue;

    const swName = name === 'type' ? 'inputType' : name;

    if (prop.type === 'boolean') {
      const boolName = swName === 'required' ? 'isRequired' : swName === 'disabled' ? 'isDisabled' : swName;
      params.push(`        ${boolName}: Bool = ${prop.default ?? false},`);
      assignments.push(`        self.${boolName} = ${boolName}`);
    } else if (name === 'type') {
      params.push(`        inputType: CivInputType = .${INPUT_TYPE_NATIVE_NAMES[prop.default as string] || prop.default},`);
      assignments.push('        self.inputType = inputType');
    } else if (name === 'width') {
      const defCase = prop.default === 'default' ? 'full' : (WIDTH_NATIVE_NAMES[prop.default as string] || prop.default);
      params.push(`        width: CivInputWidth = .${defCase},`);
      assignments.push('        self.width = width');
    } else if (prop.type === 'array') {
      params.push(`        ${swName}: [CivOption] = [],`);
      assignments.push(`        self.${swName} = ${swName}`);
    } else if (isOptional(prop)) {
      params.push(`        ${swName}: String? = nil,`);
      assignments.push(`        self.${swName} = ${swName}`);
    } else {
      params.push(`        ${swName}: String = "${prop.default}",`);
      assignments.push(`        self.${swName} = ${swName}`);
    }
  }

  // Callbacks
  if (schema.form.valueMode === 'string' && pattern !== 'form' && pattern !== 'formGroup' && pattern !== 'fieldset') {
    params.push('        onInput: ((String) -> Void)? = nil,');
    params.push('        onChange: ((String) -> Void)? = nil,');
    assignments.push('        self.onInput = onInput');
    assignments.push('        self.onChange = onChange');
  } else if (schema.form.valueMode === 'boolean') {
    params.push('        onCheckedChange: ((Bool) -> Void)? = nil,');
    assignments.push('        self.onCheckedChange = onCheckedChange');
  }

  // ViewBuilder content
  if (['radioGroup', 'checkboxGroup', 'form', 'formGroup', 'fieldset', 'segmented'].includes(pattern)) {
    params.push('        @ViewBuilder content: @escaping () -> AnyView');
    assignments.push('        self.content = content');
  }

  // Remove trailing comma from last param that isn't the ViewBuilder
  const lastIdx = params.length - 1;
  if (lastIdx >= 0 && params[lastIdx].endsWith(',')) {
    params[lastIdx] = params[lastIdx].slice(0, -1);
  }

  return [
    `    public init(`,
    ...params,
    `    ) {`,
    ...assignments,
    `    }`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Preview generation
// ---------------------------------------------------------------------------

function generatePreview(componentName: string, pattern: ComponentPattern): string {
  const lines: string[] = [
    '#if DEBUG',
    `struct ${componentName}_Previews: PreviewProvider {`,
    '    struct PreviewWrapper: View {',
  ];

  switch (pattern) {
    case 'textInput':
      lines.push(
        '        @State private var name = "Jane Doe"',
        '        @State private var email = ""',
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
        `                    ${componentName}(`,
        '                        label: "Email",',
        '                        value: $email,',
        '                        inputType: .email,',
        '                        isRequired: true',
        '                    )',
        '                }',
        '                .padding()',
        '            }',
        '        }',
      );
      break;
    case 'textarea':
      lines.push(
        '        @State private var text = ""',
        '',
        '        var body: some View {',
        '            VStack(alignment: .leading, spacing: 0) {',
        `                ${componentName}(`,
        '                    label: "Comments",',
        '                    value: $text,',
        '                    hint: "Please provide details",',
        '                    maxlength: 500',
        '                )',
        '            }',
        '            .padding()',
        '        }',
      );
      break;
    case 'select':
      lines.push(
        '        @State private var selected = ""',
        '',
        '        var body: some View {',
        '            VStack(alignment: .leading, spacing: 0) {',
        `                ${componentName}(`,
        '                    label: "State",',
        '                    value: $selected,',
        '                    options: [',
        '                        CivOption(value: "CA", label: "California"),',
        '                        CivOption(value: "NY", label: "New York"),',
        '                    ],',
        '                    isRequired: true',
        '                )',
        '            }',
        '            .padding()',
        '        }',
      );
      break;
    case 'checkbox':
      lines.push(
        '        @State private var agreed = false',
        '',
        '        var body: some View {',
        '            VStack(alignment: .leading, spacing: 0) {',
        `                ${componentName}(`,
        '                    label: "I agree to the terms",',
        '                    checked: $agreed,',
        '                    isRequired: true',
        '                )',
        '            }',
        '            .padding()',
        '        }',
      );
      break;
    case 'toggle':
      lines.push(
        '        @State private var enabled = false',
        '',
        '        var body: some View {',
        '            VStack(alignment: .leading, spacing: 0) {',
        `                ${componentName}(`,
        '                    label: "Enable notifications",',
        '                    checked: $enabled,',
        '                    description: "Receive email updates about your application"',
        '                )',
        '            }',
        '            .padding()',
        '        }',
      );
      break;
    case 'datePicker':
      lines.push(
        '        @State private var date = ""',
        '',
        '        var body: some View {',
        '            VStack(alignment: .leading, spacing: 0) {',
        `                ${componentName}(`,
        '                    label: "Appointment date",',
        '                    value: $date,',
        '                    hint: "Select a future date"',
        '                )',
        '            }',
        '            .padding()',
        '        }',
      );
      break;
    default:
      lines.push(
        '        var body: some View {',
        '            VStack(alignment: .leading, spacing: 0) {',
        `                Text("${componentName} preview")`,
        '            }',
        '            .padding()',
        '        }',
      );
  }

  lines.push(
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
  );

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Pattern-specific helper methods
// ---------------------------------------------------------------------------

function generatePatternHelpers(schema: ComponentSchema, pattern: ComponentPattern): string {
  const sections: string[] = [];

  // Input binding for text-based components
  if (['textInput', 'textarea'].includes(pattern)) {
    sections.push([
      '    private var inputBinding: Binding<String> {',
      '        Binding(',
      '            get: { value },',
      '            set: { newValue in',
      '                value = newValue',
      '                onInput?(newValue)',
      '            }',
      '        )',
      '    }',
    ].join('\n'));
  }

  // Checked binding for boolean controls
  if (['checkbox', 'toggle'].includes(pattern)) {
    sections.push([
      '    private var checkedBinding: Binding<Bool> {',
      '        Binding(',
      '            get: { checked },',
      '            set: { newValue in',
      '                checked = newValue',
      '                onCheckedChange?(newValue)',
      '            }',
      '        )',
      '    }',
    ].join('\n'));
  }

  // Date binding for date picker
  if (pattern === 'datePicker') {
    sections.push([
      '    private var dateBinding: Binding<Date> {',
      '        Binding(',
      '            get: { selectedDate },',
      '            set: { newDate in',
      '                selectedDate = newDate',
      '                let formatter = DateFormatter()',
      '                formatter.dateFormat = "yyyy-MM-dd"',
      '                value = formatter.string(from: newDate)',
      '                onInput?(value)',
      '                onChange?(value)',
      '            }',
      '        )',
      '    }',
      '',
      '    private var dateRange: ClosedRange<Date> {',
      '        let formatter = DateFormatter()',
      '        formatter.dateFormat = "yyyy-MM-dd"',
      '        let minDate = min.isEmpty ? Date.distantPast : (formatter.date(from: min) ?? Date.distantPast)',
      '        let maxDate = max.isEmpty ? Date.distantFuture : (formatter.date(from: max) ?? Date.distantFuture)',
      '        return minDate...maxDate',
      '    }',
    ].join('\n'));
  }

  // Month name helper for memorable date
  if (pattern === 'memorableDate') {
    sections.push([
      '    private func monthName(_ month: Int) -> String {',
      '        let formatter = DateFormatter()',
      '        formatter.locale = Locale(identifier: locale)',
      '        return formatter.monthSymbols[month - 1]',
      '    }',
    ].join('\n'));
  }

  // Keyboard/content type mappings for text input
  if (pattern === 'textInput') {
    const km = keyboardMapping(schema);
    const ct = contentTypeMapping(schema);
    const ac = autocapMapping(schema);
    if (km) sections.push(km);
    if (ct) sections.push(ct);
    if (ac) sections.push(ac);
  }

  return sections.join('\n\n');
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export function generateSwiftUI(schema: ComponentSchema): string {
  const componentName = `Civ${toComponentName(schema.name)}`;
  const pattern = detectPattern(schema);
  const isGroup = schema.isGroup;
  const labelProp = isGroup ? 'legend' : 'label';

  // Collect top-level declarations
  const topDecls: string[] = [];

  const inputTypeEnum = generateInputTypeEnum(schema);
  if (inputTypeEnum) topDecls.push(inputTypeEnum);

  const widthEnum = generateWidthEnum(schema);
  if (widthEnum) topDecls.push(widthEnum);

  if (schema.props['orientation']) {
    topDecls.push(generateOrientationEnum());
  }

  // Option struct for select/combobox
  const hasOptions = Object.values(schema.props).some(p => p.type === 'array' && p.items);
  if (hasOptions) {
    topDecls.push([
      '/// Option item for selection components.',
      'public struct CivOption: Identifiable, Hashable {',
      '    public let id = UUID()',
      '    public let value: String',
      '    public let label: String',
      '',
      '    public init(value: String, label: String) {',
      '        self.value = value',
      '        self.label = label',
      '    }',
      '}',
    ].join('\n'));
  }

  // Generate body based on pattern
  let body: string;
  switch (pattern) {
    case 'textInput': body = generateTextInputBody(schema); break;
    case 'textarea': body = generateTextareaBody(); break;
    case 'select': body = generateSelectBody(); break;
    case 'checkbox': body = generateCheckboxBody(); break;
    case 'toggle': body = generateToggleBody(); break;
    case 'radioGroup':
    case 'checkboxGroup': body = generateGroupBody(schema); break;
    case 'combobox': body = generateComboboxBody(); break;
    case 'datePicker': body = generateDatePickerBody(); break;
    case 'memorableDate': body = generateMemorableDateBody(); break;
    case 'fileUpload': body = generateFileUploadBody(); break;
    case 'segmented': body = generateSegmentedBody(); break;
    case 'form': body = generateFormBody(); break;
    case 'formGroup': body = generateFormGroupBody(); break;
    case 'fieldset': body = generateFieldsetBody(); break;
    default: body = generateTextInputBody(schema);
  }

  // Determine which subviews are needed
  const needsBorder = ['textInput', 'textarea', 'combobox', 'memorableDate', 'fileUpload'].includes(pattern);
  const needsLabelView = pattern !== 'form';
  const needsHintError = !['form'].includes(pattern);

  const subviews: string[] = [];
  if (needsLabelView) subviews.push(labelView(labelProp));
  if (needsHintError) {
    subviews.push(hintView());
    subviews.push(errorView());
  }
  if (needsBorder) subviews.push(borderViews());

  const helpers = generatePatternHelpers(schema, pattern);
  const accessibility = accessibilityHelper(labelProp);

  const lines = [
    `// Auto-generated by @civui/codegen — do not edit`,
    `// Source: packages/schema/src/components/${schema.name}.schema.ts`,
    '',
    `// CivUI — ${componentName} for SwiftUI`,
    `// ${schema.description}`,
    `// Accessible, Section 508 compliant`,
    '',
    'import SwiftUI',
    '',
    ...topDecls.map(d => d + '\n'),
    `/// ${schema.description}`,
    `public struct ${componentName}: View {`,
    '    // MARK: - Properties',
    '',
    generateProperties(schema, pattern),
    generateInternalState(pattern),
    '',
    '    // MARK: - Initializer',
    '',
    generateInitializer(schema, componentName, pattern),
    '',
    '    // MARK: - Body',
    '',
    body,
    '',
    '    // MARK: - Subviews',
    '',
    ...subviews.map(s => s + '\n'),
    helpers ? '    // MARK: - Helpers\n' : '',
    helpers,
    '',
    '    // MARK: - Accessibility',
    '',
    accessibility,
    '',
    '    // MARK: - Color Helper',
    '',
    colorHelper(),
    '}',
    '',
    generatePreview(componentName, pattern),
  ];

  return lines.filter(l => l !== undefined).join('\n') + '\n';
}
