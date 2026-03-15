/**
 * Jetpack Compose Generator
 *
 * Generates a Jetpack Compose @Composable function from a CivUI component schema.
 * Supports all component patterns:
 * - Text input / textarea (TextField, multiline)
 * - Select (ExposedDropdownMenuBox)
 * - Checkbox / toggle (Checkbox, Switch)
 * - Group containers (fieldset, radio-group, checkbox-group)
 * - Date picker (Material DatePickerDialog)
 * - Memorable date (three-field composition)
 * - File upload (document picker launcher)
 * - Segmented control (SegmentedButtonRow)
 * - Combobox (filterable dropdown)
 * - Form / form-group (structural containers)
 */

import type { ComponentSchema, PropDef } from '@civui/schema/types';
import { WIDTH_KOTLIN_NAMES, INPUT_TYPE_KOTLIN_NAMES } from '@civui/schema/naming-maps';
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
// Kotlin type helpers
// ---------------------------------------------------------------------------

function kotlinType(prop: PropDef, name: string): string {
  if (prop.type === 'enum' && prop.values) return `Civ${toComponentName(`-${name}`)}`;
  switch (prop.type) {
    case 'string': return 'String';
    case 'boolean': return 'Boolean';
    case 'number': return 'Int';
    case 'array': return 'List<CivOption>';
    default: return 'String';
  }
}

function kotlinDefault(prop: PropDef, name: string): string {
  if (name === 'type') return ' = CivInputType.Text';
  if (name === 'width') return ' = CivInputWidth.Full';
  if (prop.default === undefined) return '';
  if (Array.isArray(prop.default)) return ' = emptyList()';
  if (typeof prop.default === 'string') return prop.default === '' ? ' = ""' : ` = "${prop.default}"`;
  if (typeof prop.default === 'boolean') return ` = ${prop.default}`;
  if (typeof prop.default === 'number') return ` = ${prop.default}`;
  return '';
}

// ---------------------------------------------------------------------------
// Enum generators
// ---------------------------------------------------------------------------

function generateInputTypeEnum(schema: ComponentSchema): string {
  const typeProp = schema.props['type'];
  if (!typeProp || typeProp.type !== 'enum' || !typeProp.values) return '';
  const lines = ['/// Keyboard type mapping (parallels web `type` attribute).', 'enum class CivInputType {'];
  for (const v of typeProp.values) {
    const name = INPUT_TYPE_KOTLIN_NAMES[v] || v.charAt(0).toUpperCase() + v.slice(1);
    lines.push(`    ${name},`);
  }
  lines.push('}');
  return lines.join('\n');
}

function generateWidthEnum(schema: ComponentSchema): string {
  if (!schema.widths) return '';
  const lines = ['/// Width variant (parallels web `width` prop).', 'enum class CivInputWidth(val dp: Float?) {'];
  for (const [key, w] of Object.entries(schema.widths)) {
    const enumName = WIDTH_KOTLIN_NAMES[key] || key.charAt(0).toUpperCase() + key.slice(1);
    lines.push(`    ${enumName}(${w.androidDp === null ? 'null' : `${w.androidDp}f`}),`);
  }
  lines.push('}');
  return lines.join('\n');
}

function generateOrientationEnum(): string {
  return [
    '/// Layout orientation for group children.',
    'enum class CivOrientation {',
    '    Vertical,',
    '    Horizontal,',
    '}',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Import generators per pattern
// ---------------------------------------------------------------------------

function generateImports(pattern: ComponentPattern): string {
  const base = [
    'package gov.civui.components',
    '',
    'import androidx.compose.animation.animateColorAsState',
    'import androidx.compose.foundation.border',
    'import androidx.compose.foundation.isSystemInDarkTheme',
    'import androidx.compose.foundation.layout.Column',
    'import androidx.compose.foundation.layout.Row',
    'import androidx.compose.foundation.layout.Spacer',
    'import androidx.compose.foundation.layout.fillMaxWidth',
    'import androidx.compose.foundation.layout.height',
    'import androidx.compose.foundation.layout.padding',
    'import androidx.compose.foundation.layout.width',
    'import androidx.compose.foundation.shape.RoundedCornerShape',
    'import androidx.compose.material3.Text',
    'import androidx.compose.runtime.Composable',
    'import androidx.compose.runtime.getValue',
    'import androidx.compose.runtime.mutableStateOf',
    'import androidx.compose.runtime.remember',
    'import androidx.compose.runtime.setValue',
    'import androidx.compose.ui.Alignment',
    'import androidx.compose.ui.Modifier',
    'import androidx.compose.ui.draw.alpha',
    'import androidx.compose.ui.graphics.Color',
    'import androidx.compose.ui.semantics.LiveRegionMode',
    'import androidx.compose.ui.semantics.contentDescription',
    'import androidx.compose.ui.semantics.error',
    'import androidx.compose.ui.semantics.liveRegion',
    'import androidx.compose.ui.semantics.semantics',
    'import androidx.compose.ui.text.TextStyle',
    'import androidx.compose.ui.text.font.FontWeight',
    'import androidx.compose.ui.tooling.preview.Preview',
    'import androidx.compose.ui.unit.dp',
    'import gov.civui.tokens.CivTokens',
  ];

  const extras: string[] = [];

  switch (pattern) {
    case 'textInput':
      extras.push(
        'import androidx.compose.foundation.text.KeyboardActions',
        'import androidx.compose.foundation.text.KeyboardOptions',
        'import androidx.compose.material3.TextField',
        'import androidx.compose.material3.TextFieldDefaults',
        'import androidx.compose.ui.focus.onFocusChanged',
        'import androidx.compose.ui.text.input.ImeAction',
        'import androidx.compose.ui.text.input.KeyboardCapitalization',
        'import androidx.compose.ui.text.input.KeyboardType',
        'import androidx.compose.ui.text.input.PasswordVisualTransformation',
        'import androidx.compose.ui.text.input.VisualTransformation',
      );
      break;
    case 'textarea':
      extras.push(
        'import androidx.compose.foundation.text.KeyboardOptions',
        'import androidx.compose.material3.TextField',
        'import androidx.compose.material3.TextFieldDefaults',
        'import androidx.compose.ui.focus.onFocusChanged',
        'import androidx.compose.ui.text.input.KeyboardCapitalization',
      );
      break;
    case 'select':
      extras.push(
        'import androidx.compose.material3.DropdownMenuItem',
        'import androidx.compose.material3.ExposedDropdownMenuBox',
        'import androidx.compose.material3.ExposedDropdownMenuDefaults',
        'import androidx.compose.material3.TextField',
        'import androidx.compose.material3.TextFieldDefaults',
      );
      break;
    case 'checkbox':
      extras.push(
        'import androidx.compose.material3.Checkbox',
        'import androidx.compose.foundation.clickable',
      );
      break;
    case 'toggle':
      extras.push(
        'import androidx.compose.material3.Switch',
      );
      break;
    case 'combobox':
      extras.push(
        'import androidx.compose.foundation.lazy.LazyColumn',
        'import androidx.compose.foundation.lazy.items',
        'import androidx.compose.foundation.text.KeyboardOptions',
        'import androidx.compose.material3.TextField',
        'import androidx.compose.material3.TextFieldDefaults',
        'import androidx.compose.ui.focus.onFocusChanged',
      );
      break;
    case 'datePicker':
      extras.push(
        'import androidx.compose.material3.TextField',
        'import androidx.compose.material3.TextFieldDefaults',
        'import androidx.compose.material3.DatePicker',
        'import androidx.compose.material3.DatePickerDialog',
        'import androidx.compose.material3.TextButton',
        'import androidx.compose.material3.rememberDatePickerState',
        'import androidx.compose.ui.focus.onFocusChanged',
      );
      break;
    case 'memorableDate':
      extras.push(
        'import androidx.compose.foundation.text.KeyboardOptions',
        'import androidx.compose.material3.DropdownMenuItem',
        'import androidx.compose.material3.ExposedDropdownMenuBox',
        'import androidx.compose.material3.ExposedDropdownMenuDefaults',
        'import androidx.compose.material3.TextField',
        'import androidx.compose.material3.TextFieldDefaults',
        'import androidx.compose.ui.text.input.KeyboardType',
      );
      break;
    case 'fileUpload':
      extras.push(
        'import androidx.compose.foundation.BorderStroke',
        'import androidx.compose.material3.Button',
        'import androidx.compose.material3.ButtonDefaults',
        'import androidx.compose.material3.Icon',
        'import androidx.compose.material.icons.Icons',
        'import androidx.compose.material.icons.filled.CloudUpload',
        'import androidx.compose.material.icons.filled.Close',
        'import androidx.compose.material3.IconButton',
      );
      break;
    case 'segmented':
      extras.push(
        'import androidx.compose.material3.SegmentedButton',
        'import androidx.compose.material3.SegmentedButtonDefaults',
        'import androidx.compose.material3.SingleChoiceSegmentedButtonRow',
      );
      break;
  }

  return [...base, ...extras].join('\n');
}

// ---------------------------------------------------------------------------
// Common Compose snippets
// ---------------------------------------------------------------------------

function labelComposable(labelParam: string = 'label'): string {
  return [
    `        // 1. Label`,
    `        Row(`,
    `            modifier = Modifier.padding(bottom = CivTokens.Spacing._1),`,
    `        ) {`,
    `            Text(`,
    `                text = ${labelParam},`,
    `                style = TextStyle(`,
    `                    fontSize = CivTokens.Typography.FontSize.base,`,
    `                    fontWeight = FontWeight.Bold,`,
    `                ),`,
    `                color = labelColor,`,
    `            )`,
    `            if (isRequired) {`,
    `                Text(`,
    `                    text = " *",`,
    `                    style = TextStyle(`,
    `                        fontSize = CivTokens.Typography.FontSize.base,`,
    `                        fontWeight = FontWeight.Bold,`,
    `                    ),`,
    `                    color = errorColor,`,
    `                    modifier = Modifier.semantics {`,
    `                        contentDescription = "required"`,
    `                    },`,
    `                )`,
    `            }`,
    `        }`,
  ].join('\n');
}

function hintComposable(): string {
  return [
    `        // 2. Hint`,
    `        if (hint != null) {`,
    `            Text(`,
    `                text = hint,`,
    `                style = TextStyle(`,
    `                    fontSize = CivTokens.Typography.FontSize.sm,`,
    `                ),`,
    `                color = hintColor,`,
    `                modifier = Modifier.padding(bottom = CivTokens.Spacing._1),`,
    `            )`,
    `        }`,
  ].join('\n');
}

function errorComposable(): string {
  return [
    `        // 3. Error`,
    `        if (error != null) {`,
    `            Text(`,
    `                text = error,`,
    `                style = TextStyle(`,
    `                    fontSize = CivTokens.Typography.FontSize.sm,`,
    `                    fontWeight = FontWeight.Bold,`,
    `                ),`,
    `                color = errorColor,`,
    `                modifier = Modifier`,
    `                    .padding(bottom = CivTokens.Spacing._1)`,
    `                    .semantics {`,
    `                        liveRegion = LiveRegionMode.Assertive`,
    `                        error(error)`,
    `                    },`,
    `            )`,
    `        }`,
  ].join('\n');
}

function colorsSetup(): string {
  return [
    `    val isDark = isSystemInDarkTheme()`,
    `    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest`,
    `    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark`,
    `    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_`,
    `    val backgroundColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_`,
  ].join('\n');
}

function borderColorSetup(): string {
  return [
    `    val borderColor by animateColorAsState(`,
    `        targetValue = when {`,
    `            error != null -> errorColor`,
    `            else -> if (isDark) CivTokens.DarkColors.Base.light else CivTokens.Colors.Base.light`,
    `        },`,
    `        label = "borderColor",`,
    `    )`,
  ].join('\n');
}

function focusBorderColorSetup(): string {
  return [
    `    var isFocused by remember { mutableStateOf(false) }`,
    `    val borderColor by animateColorAsState(`,
    `        targetValue = when {`,
    `            error != null -> errorColor`,
    `            isFocused -> if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_`,
    `            else -> if (isDark) CivTokens.DarkColors.Base.light else CivTokens.Colors.Base.light`,
    `        },`,
    `        label = "borderColor",`,
    `    )`,
  ].join('\n');
}

function accessibilitySemanticsBlock(labelParam: string = 'label'): string {
  return [
    `        val a11yModifier = Modifier.semantics {`,
    `            contentDescription = buildString {`,
    `                append(${labelParam})`,
    `                if (isRequired) append(", required")`,
    `                if (hint != null) append(". $hint")`,
    `                if (error != null) append(". Error: $error")`,
    `            }`,
    `        }`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Pattern-specific body generators
// ---------------------------------------------------------------------------

function generateTextInputComposable(schema: ComponentSchema): string {
  const hasWidth = !!schema.widths;
  return [
    colorsSetup(),
    focusBorderColorSetup(),
    '',
    `    Column(`,
    `        modifier = modifier.padding(bottom = CivTokens.Spacing._4),`,
    `    ) {`,
    labelComposable(),
    '',
    hintComposable(),
    '',
    errorComposable(),
    '',
    `        // 4. Input`,
    hasWidth ? [
      `        val fieldModifier = Modifier`,
      `            .then(`,
      `                if (width.dp != null) Modifier.width(width.dp!!.dp)`,
      `                else Modifier.fillMaxWidth()`,
      `            )`,
    ].join('\n') : `        val fieldModifier = Modifier.fillMaxWidth()`,
    `            .border(`,
    `                width = if (error != null) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,`,
    `                color = borderColor,`,
    `                shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `            )`,
    `            .onFocusChanged { focusState ->`,
    `                val wasFocused = isFocused`,
    `                isFocused = focusState.isFocused`,
    `                if (wasFocused && !focusState.isFocused) {`,
    `                    onChange?.invoke(value)`,
    `                }`,
    `            }`,
    `            .alpha(if (isDisabled) 0.5f else 1f)`,
    '',
    accessibilitySemanticsBlock(),
    '',
    `        TextField(`,
    `            value = value,`,
    `            onValueChange = { newValue ->`,
    `                onValueChange(newValue)`,
    `                onInput?.invoke(newValue)`,
    `            },`,
    `            modifier = fieldModifier.then(a11yModifier),`,
    `            enabled = !isDisabled,`,
    `            placeholder = placeholder?.let {`,
    `                { Text(text = it, color = hintColor) }`,
    `            },`,
    `            textStyle = TextStyle(fontSize = CivTokens.Typography.FontSize.base),`,
    `            visualTransformation = if (inputType == CivInputType.Password) {`,
    `                PasswordVisualTransformation()`,
    `            } else {`,
    `                VisualTransformation.None`,
    `            },`,
    `            keyboardOptions = KeyboardOptions(`,
    `                keyboardType = inputType.toKeyboardType(),`,
    `                capitalization = inputType.toCapitalization(),`,
    `                imeAction = ImeAction.Done,`,
    `            ),`,
    `            singleLine = true,`,
    `            shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `            colors = TextFieldDefaults.colors(`,
    `                focusedContainerColor = backgroundColor,`,
    `                unfocusedContainerColor = backgroundColor,`,
    `                disabledContainerColor = backgroundColor,`,
    `                focusedIndicatorColor = Color.Transparent,`,
    `                unfocusedIndicatorColor = Color.Transparent,`,
    `                disabledIndicatorColor = Color.Transparent,`,
    `                errorIndicatorColor = Color.Transparent,`,
    `            ),`,
    `        )`,
    `    }`,
  ].join('\n');
}

function generateTextareaComposable(): string {
  return [
    colorsSetup(),
    focusBorderColorSetup(),
    '',
    `    Column(`,
    `        modifier = modifier.padding(bottom = CivTokens.Spacing._4),`,
    `    ) {`,
    labelComposable(),
    '',
    hintComposable(),
    '',
    errorComposable(),
    '',
    `        // 4. Textarea`,
    `        TextField(`,
    `            value = value,`,
    `            onValueChange = { newValue ->`,
    `                onValueChange(newValue)`,
    `                onInput?.invoke(newValue)`,
    `            },`,
    `            modifier = Modifier`,
    `                .fillMaxWidth()`,
    `                .height((rows * 24).dp)`,
    `                .border(`,
    `                    width = if (error != null) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,`,
    `                    color = borderColor,`,
    `                    shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `                )`,
    `                .onFocusChanged { focusState ->`,
    `                    val wasFocused = isFocused`,
    `                    isFocused = focusState.isFocused`,
    `                    if (wasFocused && !focusState.isFocused) { onChange?.invoke(value) }`,
    `                }`,
    `                .alpha(if (isDisabled) 0.5f else 1f),`,
    `            enabled = !isDisabled,`,
    `            placeholder = placeholder?.let { { Text(text = it, color = hintColor) } },`,
    `            textStyle = TextStyle(fontSize = CivTokens.Typography.FontSize.base),`,
    `            singleLine = false,`,
    `            maxLines = rows,`,
    `            shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `            colors = TextFieldDefaults.colors(`,
    `                focusedContainerColor = backgroundColor,`,
    `                unfocusedContainerColor = backgroundColor,`,
    `                disabledContainerColor = backgroundColor,`,
    `                focusedIndicatorColor = Color.Transparent,`,
    `                unfocusedIndicatorColor = Color.Transparent,`,
    `                disabledIndicatorColor = Color.Transparent,`,
    `            ),`,
    `        )`,
    '',
    `        // Character count`,
    `        if (maxlength != null && maxlength > 0) {`,
    `            Text(`,
    `                text = "\${value.length}/$maxlength",`,
    `                style = TextStyle(fontSize = CivTokens.Typography.FontSize.xs),`,
    `                color = hintColor,`,
    `                modifier = Modifier`,
    `                    .fillMaxWidth()`,
    `                    .padding(top = CivTokens.Spacing._0_5)`,
    `                    .semantics {`,
    `                        contentDescription = "\${maxlength - value.length} characters remaining"`,
    `                    },`,
    `            )`,
    `        }`,
    `    }`,
  ].join('\n');
}

function generateSelectComposable(): string {
  return [
    colorsSetup(),
    borderColorSetup(),
    `    var expanded by remember { mutableStateOf(false) }`,
    '',
    `    Column(`,
    `        modifier = modifier.padding(bottom = CivTokens.Spacing._4),`,
    `    ) {`,
    labelComposable(),
    '',
    hintComposable(),
    '',
    errorComposable(),
    '',
    `        // 4. Select`,
    `        ExposedDropdownMenuBox(`,
    `            expanded = expanded,`,
    `            onExpandedChange = { if (!isDisabled) expanded = !expanded },`,
    `        ) {`,
    `            val selectedLabel = options.find { it.value == value }?.label ?: emptyLabel`,
    `            TextField(`,
    `                value = selectedLabel,`,
    `                onValueChange = {},`,
    `                readOnly = true,`,
    `                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },`,
    `                modifier = Modifier`,
    `                    .menuAnchor()`,
    `                    .fillMaxWidth()`,
    `                    .border(`,
    `                        width = if (error != null) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,`,
    `                        color = borderColor,`,
    `                        shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `                    )`,
    `                    .alpha(if (isDisabled) 0.5f else 1f),`,
    `                enabled = !isDisabled,`,
    `                shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `                colors = TextFieldDefaults.colors(`,
    `                    focusedContainerColor = backgroundColor,`,
    `                    unfocusedContainerColor = backgroundColor,`,
    `                    focusedIndicatorColor = Color.Transparent,`,
    `                    unfocusedIndicatorColor = Color.Transparent,`,
    `                ),`,
    `            )`,
    `            ExposedDropdownMenu(`,
    `                expanded = expanded,`,
    `                onDismissRequest = { expanded = false },`,
    `            ) {`,
    `                options.forEach { option ->`,
    `                    DropdownMenuItem(`,
    `                        text = { Text(option.label) },`,
    `                        onClick = {`,
    `                            onValueChange(option.value)`,
    `                            onInput?.invoke(option.value)`,
    `                            onChange?.invoke(option.value)`,
    `                            expanded = false`,
    `                        },`,
    `                    )`,
    `                }`,
    `            }`,
    `        }`,
    `    }`,
  ].join('\n');
}

function generateCheckboxComposable(): string {
  return [
    colorsSetup(),
    '',
    `    Column(`,
    `        modifier = modifier.padding(bottom = CivTokens.Spacing._2),`,
    `    ) {`,
    hintComposable(),
    '',
    errorComposable(),
    '',
    `        // Control + inline label`,
    `        Row(`,
    `            verticalAlignment = Alignment.Top,`,
    `            modifier = Modifier`,
    `                .clickable(enabled = !isDisabled) {`,
    `                    val newChecked = !checked`,
    `                    onCheckedChange(newChecked)`,
    `                }`,
    `                .alpha(if (isDisabled) 0.5f else 1f)`,
    `                .semantics {`,
    `                    contentDescription = buildString {`,
    `                        append(label)`,
    `                        if (isRequired) append(", required")`,
    `                        if (checked) append(", checked")`,
    `                    }`,
    `                },`,
    `        ) {`,
    `            Checkbox(`,
    `                checked = checked,`,
    `                onCheckedChange = null, // handled by Row clickable`,
    `                enabled = !isDisabled,`,
    `            )`,
    `            Column(modifier = Modifier.padding(start = CivTokens.Spacing._2)) {`,
    `                Row {`,
    `                    Text(`,
    `                        text = label,`,
    `                        style = TextStyle(fontSize = CivTokens.Typography.FontSize.base),`,
    `                        color = labelColor,`,
    `                    )`,
    `                    if (isRequired) {`,
    `                        Text(`,
    `                            text = " *",`,
    `                            color = errorColor,`,
    `                            modifier = Modifier.semantics { contentDescription = "required" },`,
    `                        )`,
    `                    }`,
    `                }`,
    `                if (description != null) {`,
    `                    Text(`,
    `                        text = description,`,
    `                        style = TextStyle(fontSize = CivTokens.Typography.FontSize.sm),`,
    `                        color = hintColor,`,
    `                    )`,
    `                }`,
    `            }`,
    `        }`,
    `    }`,
  ].join('\n');
}

function generateToggleComposable(): string {
  return [
    colorsSetup(),
    '',
    `    Column(`,
    `        modifier = modifier.padding(bottom = CivTokens.Spacing._2),`,
    `    ) {`,
    `        // Switch + inline label`,
    `        Row(`,
    `            verticalAlignment = Alignment.CenterVertically,`,
    `            modifier = Modifier`,
    `                .alpha(if (isDisabled) 0.5f else 1f)`,
    `                .semantics {`,
    `                    contentDescription = buildString {`,
    `                        append(label)`,
    `                        if (isRequired) append(", required")`,
    `                        append(if (checked) ", on" else ", off")`,
    `                    }`,
    `                },`,
    `        ) {`,
    `            Switch(`,
    `                checked = checked,`,
    `                onCheckedChange = { newChecked ->`,
    `                    onCheckedChange(newChecked)`,
    `                },`,
    `                enabled = !isDisabled,`,
    `            )`,
    `            Column(modifier = Modifier.padding(start = CivTokens.Spacing._3)) {`,
    `                Row {`,
    `                    Text(`,
    `                        text = label,`,
    `                        style = TextStyle(fontSize = CivTokens.Typography.FontSize.base),`,
    `                        color = labelColor,`,
    `                    )`,
    `                    if (isRequired) {`,
    `                        Text(`,
    `                            text = " *",`,
    `                            color = errorColor,`,
    `                            modifier = Modifier.semantics { contentDescription = "required" },`,
    `                        )`,
    `                    }`,
    `                }`,
    `                if (description != null) {`,
    `                    Text(`,
    `                        text = description,`,
    `                        style = TextStyle(fontSize = CivTokens.Typography.FontSize.sm),`,
    `                        color = hintColor,`,
    `                    )`,
    `                }`,
    `            }`,
    `        }`,
    '',
    hintComposable(),
    '',
    errorComposable(),
    `    }`,
  ].join('\n');
}

function generateGroupComposable(schema: ComponentSchema): string {
  const hasOrientation = !!schema.props['orientation'];
  const role = schema.a11y.role;

  return [
    colorsSetup(),
    borderColorSetup(),
    '',
    `    Column(`,
    `        modifier = modifier.padding(bottom = CivTokens.Spacing._4),`,
    `    ) {`,
    labelComposable('legend'),
    '',
    hintComposable(),
    '',
    errorComposable(),
    '',
    `        // Children (slot)`,
    hasOrientation
      ? [
          `        if (orientation == CivOrientation.Horizontal) {`,
          `            Row(`,
          `                modifier = Modifier.fillMaxWidth()`,
          `                    .alpha(if (isDisabled) 0.5f else 1f),`,
          `            ) {`,
          `                content()`,
          `            }`,
          `        } else {`,
          `            Column(`,
          `                modifier = Modifier.fillMaxWidth()`,
          `                    .alpha(if (isDisabled) 0.5f else 1f),`,
          `            ) {`,
          `                content()`,
          `            }`,
          `        }`,
        ].join('\n')
      : [
          `        Column(`,
          `            modifier = Modifier.fillMaxWidth()`,
          `                .alpha(if (isDisabled) 0.5f else 1f),`,
          `        ) {`,
          `            content()`,
          `        }`,
        ].join('\n'),
    role !== 'group' ? `        // Role: ${role}` : '',
    `    }`,
  ].join('\n');
}

function generateComboboxComposable(): string {
  return [
    colorsSetup(),
    focusBorderColorSetup(),
    `    var filterText by remember { mutableStateOf("") }`,
    `    var isOpen by remember { mutableStateOf(false) }`,
    '',
    `    Column(`,
    `        modifier = modifier.padding(bottom = CivTokens.Spacing._4),`,
    `    ) {`,
    labelComposable(),
    '',
    hintComposable(),
    '',
    errorComposable(),
    '',
    `        // 4. Combobox input`,
    `        TextField(`,
    `            value = filterText,`,
    `            onValueChange = { newValue ->`,
    `                filterText = newValue`,
    `                isOpen = newValue.isNotEmpty()`,
    `                onInput?.invoke(newValue)`,
    `            },`,
    `            modifier = Modifier`,
    `                .fillMaxWidth()`,
    `                .border(`,
    `                    width = if (error != null) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,`,
    `                    color = borderColor,`,
    `                    shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `                )`,
    `                .onFocusChanged { isFocused = it.isFocused }`,
    `                .alpha(if (isDisabled) 0.5f else 1f),`,
    `            enabled = !isDisabled,`,
    `            placeholder = placeholder?.let { { Text(text = it, color = hintColor) } },`,
    `            textStyle = TextStyle(fontSize = CivTokens.Typography.FontSize.base),`,
    `            singleLine = true,`,
    `            shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `            colors = TextFieldDefaults.colors(`,
    `                focusedContainerColor = backgroundColor,`,
    `                unfocusedContainerColor = backgroundColor,`,
    `                focusedIndicatorColor = Color.Transparent,`,
    `                unfocusedIndicatorColor = Color.Transparent,`,
    `            ),`,
    `        )`,
    '',
    `        // Filtered options list`,
    `        if (isOpen) {`,
    `            val filtered = options.filter {`,
    `                filterText.isEmpty() || it.label.contains(filterText, ignoreCase = true)`,
    `            }`,
    `            if (filtered.isEmpty()) {`,
    `                Text(`,
    `                    text = noResultsText,`,
    `                    style = TextStyle(fontSize = CivTokens.Typography.FontSize.sm),`,
    `                    color = hintColor,`,
    `                    modifier = Modifier.padding(CivTokens.Spacing._2),`,
    `                )`,
    `            } else {`,
    `                LazyColumn(`,
    `                    modifier = Modifier`,
    `                        .fillMaxWidth()`,
    `                        .height(200.dp)`,
    `                        .border(`,
    `                            width = CivTokens.Border.Width.default_,`,
    `                            color = borderColor,`,
    `                            shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `                        ),`,
    `                ) {`,
    `                    items(filtered) { option ->`,
    `                        Text(`,
    `                            text = option.label,`,
    `                            modifier = Modifier`,
    `                                .fillMaxWidth()`,
    `                                .clickable {`,
    `                                    onValueChange(option.value)`,
    `                                    filterText = option.label`,
    `                                    isOpen = false`,
    `                                    onChange?.invoke(option.value)`,
    `                                }`,
    `                                .padding(`,
    `                                    horizontal = CivTokens.Spacing._2,`,
    `                                    vertical = CivTokens.Spacing._1_5,`,
    `                                ),`,
    `                        )`,
    `                    }`,
    `                }`,
    `            }`,
    `        }`,
    `    }`,
  ].join('\n');
}

function generateDatePickerComposable(): string {
  return [
    colorsSetup(),
    borderColorSetup(),
    `    var showDialog by remember { mutableStateOf(false) }`,
    `    val datePickerState = rememberDatePickerState()`,
    '',
    `    Column(`,
    `        modifier = modifier.padding(bottom = CivTokens.Spacing._4),`,
    `    ) {`,
    labelComposable(),
    '',
    hintComposable(),
    '',
    errorComposable(),
    '',
    `        // 4. Date input + calendar button`,
    `        TextField(`,
    `            value = value,`,
    `            onValueChange = { newValue ->`,
    `                onValueChange(newValue)`,
    `                onInput?.invoke(newValue)`,
    `            },`,
    `            modifier = Modifier`,
    `                .fillMaxWidth()`,
    `                .border(`,
    `                    width = if (error != null) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,`,
    `                    color = borderColor,`,
    `                    shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `                )`,
    `                .alpha(if (isDisabled) 0.5f else 1f),`,
    `            enabled = !isDisabled,`,
    `            placeholder = placeholder?.let { { Text(text = it, color = hintColor) } },`,
    `            trailingIcon = {`,
    `                IconButton(onClick = { showDialog = true }) {`,
    `                    Icon(Icons.Default.DateRange, contentDescription = chooseDateLabel)`,
    `                }`,
    `            },`,
    `            textStyle = TextStyle(fontSize = CivTokens.Typography.FontSize.base),`,
    `            singleLine = true,`,
    `            shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `            colors = TextFieldDefaults.colors(`,
    `                focusedContainerColor = backgroundColor,`,
    `                unfocusedContainerColor = backgroundColor,`,
    `                focusedIndicatorColor = Color.Transparent,`,
    `                unfocusedIndicatorColor = Color.Transparent,`,
    `            ),`,
    `        )`,
    '',
    `        if (showDialog) {`,
    `            DatePickerDialog(`,
    `                onDismissRequest = { showDialog = false },`,
    `                confirmButton = {`,
    `                    TextButton(onClick = {`,
    `                        showDialog = false`,
    `                        // Convert millis to YYYY-MM-DD`,
    `                        datePickerState.selectedDateMillis?.let { millis ->`,
    `                            val date = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US)`,
    `                                .format(java.util.Date(millis))`,
    `                            onValueChange(date)`,
    `                            onChange?.invoke(date)`,
    `                        }`,
    `                    }) { Text("OK") }`,
    `                },`,
    `                dismissButton = {`,
    `                    TextButton(onClick = { showDialog = false }) { Text("Cancel") }`,
    `                },`,
    `            ) {`,
    `                DatePicker(state = datePickerState)`,
    `            }`,
    `        }`,
    `    }`,
  ].join('\n');
}

function generateMemorableDateComposable(): string {
  return [
    colorsSetup(),
    borderColorSetup(),
    `    var monthExpanded by remember { mutableStateOf(false) }`,
    `    val months = listOf("January", "February", "March", "April", "May", "June",`,
    `        "July", "August", "September", "October", "November", "December")`,
    '',
    `    Column(`,
    `        modifier = modifier.padding(bottom = CivTokens.Spacing._4),`,
    `    ) {`,
    labelComposable('legend'),
    '',
    hintComposable(),
    '',
    errorComposable(),
    '',
    `        // 4. Three-field date entry`,
    `        Row(`,
    `            modifier = Modifier`,
    `                .fillMaxWidth()`,
    `                .alpha(if (isDisabled) 0.5f else 1f),`,
    `        ) {`,
    `            // Month picker`,
    `            Column(modifier = Modifier.weight(1f)) {`,
    `                Text(monthLabel, style = TextStyle(fontSize = CivTokens.Typography.FontSize.sm), color = labelColor)`,
    `                ExposedDropdownMenuBox(`,
    `                    expanded = monthExpanded,`,
    `                    onExpandedChange = { monthExpanded = !monthExpanded },`,
    `                ) {`,
    `                    TextField(`,
    `                        value = months.getOrNull((month.toIntOrNull() ?: 0) - 1) ?: monthEmptyLabel,`,
    `                        onValueChange = {},`,
    `                        readOnly = true,`,
    `                        modifier = Modifier.menuAnchor().fillMaxWidth(),`,
    `                        shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `                    )`,
    `                    ExposedDropdownMenu(`,
    `                        expanded = monthExpanded,`,
    `                        onDismissRequest = { monthExpanded = false },`,
    `                    ) {`,
    `                        months.forEachIndexed { index, name ->`,
    `                            DropdownMenuItem(`,
    `                                text = { Text(name) },`,
    `                                onClick = {`,
    `                                    onMonthChange(String.format("%02d", index + 1))`,
    `                                    monthExpanded = false`,
    `                                },`,
    `                            )`,
    `                        }`,
    `                    }`,
    `                }`,
    `            }`,
    '',
    `            Spacer(modifier = Modifier.width(CivTokens.Spacing._2))`,
    '',
    `            // Day field`,
    `            Column(modifier = Modifier.width(60.dp)) {`,
    `                Text(dayLabel, style = TextStyle(fontSize = CivTokens.Typography.FontSize.sm), color = labelColor)`,
    `                TextField(`,
    `                    value = day,`,
    `                    onValueChange = onDayChange,`,
    `                    placeholder = { Text(dayPlaceholder) },`,
    `                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),`,
    `                    singleLine = true,`,
    `                    modifier = Modifier.fillMaxWidth(),`,
    `                    shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `                )`,
    `            }`,
    '',
    `            Spacer(modifier = Modifier.width(CivTokens.Spacing._2))`,
    '',
    `            // Year field`,
    `            Column(modifier = Modifier.width(80.dp)) {`,
    `                Text(yearLabel, style = TextStyle(fontSize = CivTokens.Typography.FontSize.sm), color = labelColor)`,
    `                TextField(`,
    `                    value = year,`,
    `                    onValueChange = onYearChange,`,
    `                    placeholder = { Text(yearPlaceholder) },`,
    `                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),`,
    `                    singleLine = true,`,
    `                    modifier = Modifier.fillMaxWidth(),`,
    `                    shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `                )`,
    `            }`,
    `        }`,
    `    }`,
  ].join('\n');
}

function generateFileUploadComposable(): string {
  return [
    colorsSetup(),
    borderColorSetup(),
    `    val primaryColor = if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_`,
    '',
    `    Column(`,
    `        modifier = modifier.padding(bottom = CivTokens.Spacing._4),`,
    `    ) {`,
    labelComposable(),
    '',
    hintComposable(),
    '',
    errorComposable(),
    '',
    `        // 4. Upload dropzone`,
    `        Button(`,
    `            onClick = onBrowse,`,
    `            modifier = Modifier`,
    `                .fillMaxWidth()`,
    `                .alpha(if (isDisabled) 0.5f else 1f),`,
    `            enabled = !isDisabled,`,
    `            shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `            border = BorderStroke(1.dp, borderColor),`,
    `            colors = ButtonDefaults.outlinedButtonColors(containerColor = backgroundColor),`,
    `        ) {`,
    `            Column(`,
    `                horizontalAlignment = Alignment.CenterHorizontally,`,
    `                modifier = Modifier.padding(CivTokens.Spacing._4),`,
    `            ) {`,
    `                Icon(Icons.Default.CloudUpload, contentDescription = null)`,
    `                Spacer(modifier = Modifier.height(CivTokens.Spacing._1))`,
    `                Text(dragText, style = TextStyle(fontSize = CivTokens.Typography.FontSize.sm))`,
    `                Text(`,
    `                    browseText,`,
    `                    style = TextStyle(fontSize = CivTokens.Typography.FontSize.sm, fontWeight = FontWeight.Bold),`,
    `                    color = primaryColor,`,
    `                )`,
    `            }`,
    `        }`,
    '',
    `        // Selected files list`,
    `        selectedFiles.forEachIndexed { index, fileName ->`,
    `            Row(`,
    `                verticalAlignment = Alignment.CenterVertically,`,
    `                modifier = Modifier.padding(vertical = CivTokens.Spacing._0_5),`,
    `            ) {`,
    `                Text(`,
    `                    text = fileName,`,
    `                    style = TextStyle(fontSize = CivTokens.Typography.FontSize.sm),`,
    `                    modifier = Modifier.weight(1f),`,
    `                )`,
    `                IconButton(onClick = { onRemoveFile(index) }) {`,
    `                    Icon(`,
    `                        Icons.Default.Close,`,
    `                        contentDescription = "$removeText $fileName",`,
    `                        tint = errorColor,`,
    `                    )`,
    `                }`,
    `            }`,
    `        }`,
    `    }`,
  ].join('\n');
}

function generateSegmentedComposable(): string {
  return [
    colorsSetup(),
    '',
    `    Column(`,
    `        modifier = modifier.padding(bottom = CivTokens.Spacing._4),`,
    `    ) {`,
    `        if (legend.isNotEmpty()) {`,
    `            Text(`,
    `                text = legend,`,
    `                style = TextStyle(`,
    `                    fontSize = CivTokens.Typography.FontSize.base,`,
    `                    fontWeight = FontWeight.Bold,`,
    `                ),`,
    `                color = labelColor,`,
    `                modifier = Modifier.padding(bottom = CivTokens.Spacing._1),`,
    `            )`,
    `        }`,
    '',
    hintComposable(),
    '',
    errorComposable(),
    '',
    `        // Segmented button row (child content provides segments)`,
    `        SingleChoiceSegmentedButtonRow(`,
    `            modifier = Modifier`,
    `                .fillMaxWidth()`,
    `                .alpha(if (isDisabled) 0.5f else 1f),`,
    `        ) {`,
    `            content()`,
    `        }`,
    `    }`,
  ].join('\n');
}

function generateFormComposable(): string {
  return [
    `    Column(`,
    `        modifier = modifier,`,
    `    ) {`,
    `        content()`,
    `    }`,
  ].join('\n');
}

function generateFormGroupComposable(): string {
  return [
    colorsSetup(),
    '',
    `    Column(`,
    `        modifier = modifier.padding(bottom = CivTokens.Spacing._4),`,
    `    ) {`,
    labelComposable(),
    '',
    hintComposable(),
    '',
    errorComposable(),
    '',
    `        content()`,
    `    }`,
  ].join('\n');
}

function generateFieldsetComposable(): string {
  return [
    colorsSetup(),
    '',
    `    Column(`,
    `        modifier = modifier`,
    `            .padding(bottom = CivTokens.Spacing._4)`,
    `            .alpha(if (isDisabled) 0.5f else 1f),`,
    `    ) {`,
    labelComposable('legend'),
    '',
    hintComposable(),
    '',
    errorComposable(),
    '',
    `        content()`,
    `    }`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Parameter generation
// ---------------------------------------------------------------------------

function generateParams(schema: ComponentSchema, pattern: ComponentPattern): string {
  const lines: string[] = [];
  const isGroup = schema.isGroup;
  const labelParam = isGroup ? 'legend' : 'label';

  // Primary label
  if (pattern !== 'form') {
    lines.push(`    ${labelParam}: String,`);
  }

  // Value/state params
  switch (pattern) {
    case 'textInput':
    case 'textarea':
    case 'select':
    case 'radioGroup':
    case 'segmented':
    case 'datePicker':
      lines.push(`    value: String,`);
      lines.push(`    onValueChange: (String) -> Unit,`);
      break;
    case 'combobox':
      lines.push(`    value: String,`);
      lines.push(`    onValueChange: (String) -> Unit,`);
      break;
    case 'checkbox':
    case 'toggle':
      lines.push(`    checked: Boolean,`);
      lines.push(`    onCheckedChange: (Boolean) -> Unit,`);
      break;
    case 'memorableDate':
      lines.push(`    month: String,`);
      lines.push(`    day: String,`);
      lines.push(`    year: String,`);
      lines.push(`    onMonthChange: (String) -> Unit,`);
      lines.push(`    onDayChange: (String) -> Unit,`);
      lines.push(`    onYearChange: (String) -> Unit,`);
      break;
    case 'fileUpload':
      lines.push(`    selectedFiles: List<String>,`);
      lines.push(`    onBrowse: () -> Unit,`);
      lines.push(`    onRemoveFile: (Int) -> Unit,`);
      break;
  }

  lines.push(`    modifier: Modifier = Modifier,`);

  // Standard optional params
  if (!schema.props['hint']) lines.push(`    hint: String? = null,`);
  if (!schema.props['error']) lines.push(`    error: String? = null,`);
  if (!schema.props['required']) lines.push(`    isRequired: Boolean = false,`);
  if (!schema.props['disabled'] && pattern !== 'form') lines.push(`    isDisabled: Boolean = false,`);

  // Schema-specific props
  const skip = new Set(['label', 'value', 'checked', 'legend', 'hint', 'error', 'required', 'disabled']);
  for (const [name, prop] of Object.entries(schema.props)) {
    if (skip.has(name)) continue;

    if (prop.type === 'boolean') {
      const boolName = name === 'required' ? 'isRequired' : name === 'disabled' ? 'isDisabled' : name;
      lines.push(`    ${boolName}: Boolean = ${prop.default ?? false},`);
    } else if (name === 'type') {
      lines.push(`    inputType: CivInputType = CivInputType.Text,`);
    } else if (name === 'width') {
      lines.push(`    width: CivInputWidth = CivInputWidth.Full,`);
    } else if (name === 'orientation') {
      lines.push(`    orientation: CivOrientation = CivOrientation.Vertical,`);
    } else if (prop.type === 'array') {
      lines.push(`    ${name}: List<CivOption> = emptyList(),`);
    } else if (prop.type === 'number') {
      const def = prop.default !== undefined ? ` = ${prop.default}` : '? = null';
      lines.push(`    ${name}: Int${prop.default === undefined ? '?' : ''}${def},`);
    } else if (prop.default === '') {
      lines.push(`    ${name}: String? = null,`);
    } else if (typeof prop.default === 'string') {
      lines.push(`    ${name}: String = "${prop.default}",`);
    }
  }

  // Callbacks
  if (schema.form.valueMode === 'string' && !['form', 'formGroup', 'fieldset'].includes(pattern)) {
    lines.push(`    onInput: ((String) -> Unit)? = null,`);
    lines.push(`    onChange: ((String) -> Unit)? = null,`);
  }

  // Slot content
  if (['radioGroup', 'checkboxGroup', 'form', 'formGroup', 'fieldset', 'segmented'].includes(pattern)) {
    lines.push(`    content: @Composable () -> Unit,`);
  }

  // Remove trailing comma from last line
  const lastIdx = lines.length - 1;
  if (lastIdx >= 0 && lines[lastIdx].endsWith(',')) {
    lines[lastIdx] = lines[lastIdx].slice(0, -1);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Keyboard mapping generators (for text input)
// ---------------------------------------------------------------------------

function generateKeyboardMapping(schema: ComponentSchema): string {
  const map = schema.platform?.android?.keyboardType;
  if (!map) return '';
  const lines = ['', 'private fun CivInputType.toKeyboardType(): KeyboardType = when (this) {'];
  for (const [key, value] of Object.entries(map)) {
    const enumName = INPUT_TYPE_KOTLIN_NAMES[key] || key.charAt(0).toUpperCase() + key.slice(1);
    lines.push(`    CivInputType.${enumName} -> ${value}`);
  }
  lines.push('}');
  return lines.join('\n');
}

function generateCapitalizationMapping(schema: ComponentSchema): string {
  const map = schema.platform?.android?.capitalization;
  if (!map) return '';
  const lines = ['', 'private fun CivInputType.toCapitalization(): KeyboardCapitalization = when (this) {'];
  for (const [key, value] of Object.entries(map)) {
    if (key === '_default') continue;
    const enumName = INPUT_TYPE_KOTLIN_NAMES[key] || key.charAt(0).toUpperCase() + key.slice(1);
    lines.push(`    CivInputType.${enumName} -> ${value}`);
  }
  const defaultVal = map['_default'] || 'KeyboardCapitalization.Sentences';
  lines.push(`    else -> ${defaultVal}`);
  lines.push('}');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Preview generation
// ---------------------------------------------------------------------------

function generatePreview(componentName: string, pattern: ComponentPattern): string {
  const lines = [
    '',
    '// MARK: - Preview',
    '',
    `@Preview(showBackground = true, name = "${componentName}")`,
    '@Composable',
    `private fun ${componentName}Preview() {`,
    `    Column(modifier = Modifier.padding(16.dp)) {`,
  ];

  switch (pattern) {
    case 'textInput':
      lines.push(
        `        var name by remember { mutableStateOf("Jane Doe") }`,
        `        ${componentName}(`,
        `            label = "Full name",`,
        `            value = name,`,
        `            onValueChange = { name = it },`,
        `            hint = "First and last name",`,
        `            isRequired = true,`,
        `        )`,
      );
      break;
    case 'textarea':
      lines.push(
        `        var text by remember { mutableStateOf("") }`,
        `        ${componentName}(`,
        `            label = "Comments",`,
        `            value = text,`,
        `            onValueChange = { text = it },`,
        `            hint = "Please provide details",`,
        `            maxlength = 500,`,
        `        )`,
      );
      break;
    case 'select':
      lines.push(
        `        var selected by remember { mutableStateOf("") }`,
        `        ${componentName}(`,
        `            label = "State",`,
        `            value = selected,`,
        `            onValueChange = { selected = it },`,
        `            options = listOf(`,
        `                CivOption("CA", "California"),`,
        `                CivOption("NY", "New York"),`,
        `            ),`,
        `            isRequired = true,`,
        `        )`,
      );
      break;
    case 'checkbox':
      lines.push(
        `        var agreed by remember { mutableStateOf(false) }`,
        `        ${componentName}(`,
        `            label = "I agree to the terms",`,
        `            checked = agreed,`,
        `            onCheckedChange = { agreed = it },`,
        `            isRequired = true,`,
        `        )`,
      );
      break;
    case 'toggle':
      lines.push(
        `        var enabled by remember { mutableStateOf(false) }`,
        `        ${componentName}(`,
        `            label = "Enable notifications",`,
        `            checked = enabled,`,
        `            onCheckedChange = { enabled = it },`,
        `            description = "Receive email updates",`,
        `        )`,
      );
      break;
    default:
      lines.push(
        `        Text("${componentName} preview")`,
      );
  }

  lines.push(
    `    }`,
    `}`,
  );

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export function generateCompose(schema: ComponentSchema): string {
  const componentName = `Civ${toComponentName(schema.name)}`;
  const pattern = detectPattern(schema);

  const topDecls: string[] = [];
  const inputTypeEnum = generateInputTypeEnum(schema);
  if (inputTypeEnum) topDecls.push(inputTypeEnum);
  const widthEnum = generateWidthEnum(schema);
  if (widthEnum) topDecls.push(widthEnum);
  if (schema.props['orientation']) topDecls.push(generateOrientationEnum());

  // Option data class
  const hasOptions = Object.values(schema.props).some(p => p.type === 'array' && p.items);
  if (hasOptions) {
    topDecls.push([
      '/// Option item for selection components.',
      'data class CivOption(',
      '    val value: String,',
      '    val label: String,',
      ')',
    ].join('\n'));
  }

  // Build body
  let body: string;
  switch (pattern) {
    case 'textInput': body = generateTextInputComposable(schema); break;
    case 'textarea': body = generateTextareaComposable(); break;
    case 'select': body = generateSelectComposable(); break;
    case 'checkbox': body = generateCheckboxComposable(); break;
    case 'toggle': body = generateToggleComposable(); break;
    case 'radioGroup':
    case 'checkboxGroup': body = generateGroupComposable(schema); break;
    case 'combobox': body = generateComboboxComposable(); break;
    case 'datePicker': body = generateDatePickerComposable(); break;
    case 'memorableDate': body = generateMemorableDateComposable(); break;
    case 'fileUpload': body = generateFileUploadComposable(); break;
    case 'segmented': body = generateSegmentedComposable(); break;
    case 'form': body = generateFormComposable(); break;
    case 'formGroup': body = generateFormGroupComposable(); break;
    case 'fieldset': body = generateFieldsetComposable(); break;
    default: body = generateTextInputComposable(schema);
  }

  // Keyboard mappings
  const keyboardMapping = generateKeyboardMapping(schema);
  const capitalizationMapping = generateCapitalizationMapping(schema);

  const lines = [
    `// Auto-generated by @civui/codegen — do not edit`,
    `// Source: packages/schema/src/components/${schema.name}.schema.ts`,
    '',
    `// CivUI — ${componentName} for Jetpack Compose`,
    `// ${schema.description}`,
    `// Accessible, Section 508 compliant`,
    '',
    generateImports(pattern),
    '',
    ...topDecls.map(d => d + '\n'),
    `/**`,
    ` * ${schema.description}`,
    ` */`,
    `@Composable`,
    `fun ${componentName}(`,
    generateParams(schema, pattern),
    `) {`,
    body,
    `}`,
    '',
    keyboardMapping ? `// MARK: - Input Type Mapping` : '',
    keyboardMapping,
    capitalizationMapping,
    '',
    generatePreview(componentName, pattern),
  ];

  return lines.filter(l => l !== undefined).join('\n') + '\n';
}
