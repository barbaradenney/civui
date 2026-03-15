/**
 * Jetpack Compose Generator
 *
 * Generates a Jetpack Compose @Composable function from a CivUI component schema.
 * Output matches the hand-written CivUI Android patterns:
 * - @Composable function
 * - CivTokens for colors, spacing, typography
 * - Dark mode via isSystemInDarkTheme()
 * - TalkBack accessibility via LiveRegionMode and semantics
 * - Animated border color transitions
 */

import type { ComponentSchema, PropDef } from '@civui/schema/types';
import { WIDTH_KOTLIN_NAMES, INPUT_TYPE_KOTLIN_NAMES } from '@civui/schema/naming-maps';
import { toComponentName } from '../utils/naming.js';

function kotlinType(prop: PropDef, name: string): string {
  if (prop.type === 'enum' && prop.values) {
    return `Civ${toComponentName(`-${name}`)}`;
  }
  switch (prop.type) {
    case 'string':
      return 'String';
    case 'boolean':
      return 'Boolean';
    case 'number':
      return 'Int';
    default:
      return 'String';
  }
}

function kotlinDefault(prop: PropDef, name: string): string {
  if (name === 'type') return ' = CivInputType.Text';
  if (name === 'width') return ' = CivInputWidth.Full';
  if (prop.default === undefined) return '';
  if (typeof prop.default === 'string') return prop.default === '' ? ' = ""' : ` = "${prop.default}"`;
  if (typeof prop.default === 'boolean') return ` = ${prop.default}`;
  if (typeof prop.default === 'number') return ` = ${prop.default}`;
  return '';
}

function generateInputTypeEnum(schema: ComponentSchema): string {
  const typeProp = schema.props['type'];
  if (!typeProp || typeProp.type !== 'enum' || !typeProp.values) return '';

  const lines = [
    '/// Keyboard type mapping for CivTextInput (parallels web `type` attribute).',
    'enum class CivInputType {',
  ];

  for (const v of typeProp.values) {
    const name = INPUT_TYPE_KOTLIN_NAMES[v] || v.charAt(0).toUpperCase() + v.slice(1);
    lines.push(`    ${name},`);
  }

  lines.push('}');
  return lines.join('\n');
}

function generateWidthEnum(schema: ComponentSchema): string {
  if (!schema.widths) return '';

  const lines = [
    '/// Width variant for CivTextInput (parallels web `width` prop).',
    'enum class CivInputWidth(val dp: Float?) {',
  ];

  for (const [key, w] of Object.entries(schema.widths)) {
    const enumName = WIDTH_KOTLIN_NAMES[key] || key.charAt(0).toUpperCase() + key.slice(1);
    lines.push(`    ${enumName}(${w.androidDp === null ? 'null' : `${w.androidDp}f`}),`);
  }

  lines.push('}');
  return lines.join('\n');
}

function generateKeyboardMapping(schema: ComponentSchema): string {
  const map = schema.platform?.android?.keyboardType;
  if (!map) return '';

  const lines = [
    '',
    'private fun CivInputType.toKeyboardType(): KeyboardType = when (this) {',
  ];

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

  const lines = [
    '',
    'private fun CivInputType.toCapitalization(): KeyboardCapitalization = when (this) {',
  ];

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

export function generateCompose(schema: ComponentSchema): string {
  const componentName = `Civ${toComponentName(schema.name)}`;

  const inputTypeEnum = generateInputTypeEnum(schema);
  const widthEnum = generateWidthEnum(schema);
  const keyboardMapping = generateKeyboardMapping(schema);
  const capitalizationMapping = generateCapitalizationMapping(schema);

  const imports = [
    'package gov.civui.components',
    '',
    'import androidx.compose.animation.animateColorAsState',
    'import androidx.compose.foundation.border',
    'import androidx.compose.foundation.isSystemInDarkTheme',
    'import androidx.compose.foundation.layout.Column',
    'import androidx.compose.foundation.layout.Row',
    'import androidx.compose.foundation.layout.fillMaxWidth',
    'import androidx.compose.foundation.layout.padding',
    'import androidx.compose.foundation.layout.width',
    'import androidx.compose.foundation.shape.RoundedCornerShape',
    'import androidx.compose.foundation.text.KeyboardActions',
    'import androidx.compose.foundation.text.KeyboardOptions',
    'import androidx.compose.material3.Text',
    'import androidx.compose.material3.TextField',
    'import androidx.compose.material3.TextFieldDefaults',
    'import androidx.compose.runtime.Composable',
    'import androidx.compose.runtime.getValue',
    'import androidx.compose.runtime.mutableStateOf',
    'import androidx.compose.runtime.remember',
    'import androidx.compose.runtime.setValue',
    'import androidx.compose.ui.Modifier',
    'import androidx.compose.ui.draw.alpha',
    'import androidx.compose.ui.focus.onFocusChanged',
    'import androidx.compose.ui.graphics.Color',
    'import androidx.compose.ui.platform.LocalFocusManager',
    'import androidx.compose.ui.semantics.LiveRegionMode',
    'import androidx.compose.ui.semantics.contentDescription',
    'import androidx.compose.ui.semantics.error',
    'import androidx.compose.ui.semantics.liveRegion',
    'import androidx.compose.ui.semantics.semantics',
    'import androidx.compose.ui.text.TextStyle',
    'import androidx.compose.ui.text.font.FontWeight',
    'import androidx.compose.ui.text.input.ImeAction',
    'import androidx.compose.ui.text.input.KeyboardCapitalization',
    'import androidx.compose.ui.text.input.KeyboardType',
    'import androidx.compose.ui.text.input.PasswordVisualTransformation',
    'import androidx.compose.ui.text.input.VisualTransformation',
    'import androidx.compose.ui.tooling.preview.Preview',
    'import androidx.compose.ui.unit.dp',
    'import gov.civui.tokens.CivTokens',
  ];

  // Build function parameters
  const params: string[] = [
    `    label: String,`,
    `    value: String,`,
    `    onValueChange: (String) -> Unit,`,
    `    modifier: Modifier = Modifier,`,
    `    hint: String? = null,`,
    `    error: String? = null,`,
    `    isRequired: Boolean = false,`,
    `    isDisabled: Boolean = false,`,
  ];

  for (const [name, prop] of Object.entries(schema.props)) {
    if (['label', 'value'].includes(name)) continue;
    if (prop.type === 'boolean') continue; // handled via isRequired/isDisabled

    if (name === 'type') {
      params.push(`    inputType: CivInputType = CivInputType.Text,`);
    } else if (name === 'width') {
      params.push(`    width: CivInputWidth = CivInputWidth.Full,`);
    } else if (prop.default === '') {
      params.push(`    ${name}: String? = null,`);
    }
  }

  params.push(`    onInput: ((String) -> Unit)? = null,`);
  params.push(`    onChange: ((String) -> Unit)? = null,`);

  const visualTransformMap = schema.platform?.android?.visualTransformation;

  const lines = [
    `// Auto-generated by @civui/codegen — do not edit`,
    `// Source: packages/schema/src/components/${schema.name}.schema.ts`,
    '',
    `// CivUI — ${componentName} for Jetpack Compose`,
    `// Accessible text input following government design system patterns.`,
    `// Renders: label → hint → error → input (Section 508 compliant)`,
    '',
    ...imports,
    '',
    inputTypeEnum,
    '',
    widthEnum,
    '',
    `/**`,
    ` * ${schema.description}`,
    ` */`,
    `@Composable`,
    `fun ${componentName}(`,
    ...params,
    `) {`,
    `    val isDark = isSystemInDarkTheme()`,
    `    var isFocused by remember { mutableStateOf(false) }`,
    '',
    `    // Adaptive colors`,
    `    val labelColor = if (isDark) CivTokens.DarkColors.Base.darkest else CivTokens.Colors.Base.darkest`,
    `    val hintColor = if (isDark) CivTokens.DarkColors.Base.dark else CivTokens.Colors.Base.dark`,
    `    val errorColor = if (isDark) CivTokens.DarkColors.Error.default_ else CivTokens.Colors.Error.default_`,
    `    val borderColor by animateColorAsState(`,
    `        targetValue = when {`,
    `            error != null -> errorColor`,
    `            isFocused -> if (isDark) CivTokens.DarkColors.Primary.default_ else CivTokens.Colors.Primary.default_`,
    `            else -> if (isDark) CivTokens.DarkColors.Base.light else CivTokens.Colors.Base.light`,
    `        },`,
    `        label = "borderColor",`,
    `    )`,
    `    val backgroundColor = if (isDark) CivTokens.DarkColors.White.default_ else CivTokens.Colors.White.default_`,
    '',
    `    Column(`,
    `        modifier = modifier.padding(bottom = CivTokens.Spacing._4),`,
    `    ) {`,
    `        // 1. Label`,
    `        Row(`,
    `            modifier = Modifier.padding(bottom = CivTokens.Spacing._1),`,
    `        ) {`,
    `            Text(`,
    `                text = label,`,
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
    '',
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
    '',
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
    `                    // role="alert" equivalent — TalkBack announces immediately`,
    `                    .semantics {`,
    `                        liveRegion = LiveRegionMode.Assertive`,
    `                        error(error)`,
    `                    },`,
    `            )`,
    `        }`,
    '',
    `        // 4. Input`,
    `        val fieldModifier = Modifier`,
    `            .then(`,
    `                if (width.dp != null) Modifier.width(width.dp!!.dp)`,
    `                else Modifier.fillMaxWidth()`,
    `            )`,
    `            .border(`,
    `                width = if (error != null) CivTokens.Border.Width._2 else CivTokens.Border.Width.default_,`,
    `                color = borderColor,`,
    `                shape = RoundedCornerShape(CivTokens.Border.Radius.default_),`,
    `            )`,
    `            .onFocusChanged { focusState ->`,
    `                val wasFocused = isFocused`,
    `                isFocused = focusState.isFocused`,
    `                // Fire onChange when focus leaves (parallels web change event)`,
    `                if (wasFocused && !focusState.isFocused) {`,
    `                    onChange?.invoke(value)`,
    `                }`,
    `            }`,
    `            .alpha(if (isDisabled) 0.5f else 1f)`,
    '',
    `        val accessibilityModifier = Modifier.semantics {`,
    `            contentDescription = buildString {`,
    `                append(label)`,
    `                if (isRequired) append(", required")`,
    `                if (hint != null) append(". $hint")`,
    `                if (error != null) append(". Error: $error")`,
    `            }`,
    `        }`,
    '',
    `        TextField(`,
    `            value = value,`,
    `            onValueChange = { newValue ->`,
    `                onValueChange(newValue)`,
    `                onInput?.invoke(newValue)`,
    `            },`,
    `            modifier = fieldModifier.then(accessibilityModifier),`,
    `            enabled = !isDisabled,`,
    `            placeholder = placeholder?.let {`,
    `                { Text(text = it, color = hintColor) }`,
    `            },`,
    `            textStyle = TextStyle(`,
    `                fontSize = CivTokens.Typography.FontSize.base,`,
    `            ),`,
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
    `}`,
    '',
    `// MARK: - Input Type Mapping`,
    keyboardMapping,
    capitalizationMapping,
    '',
    `// MARK: - Preview`,
    '',
    `@Preview(showBackground = true, name = "${componentName} Light")`,
    `@Composable`,
    `private fun ${componentName}Preview() {`,
    `    Column(modifier = Modifier.padding(16.dp)) {`,
    `        var name by remember { mutableStateOf("Jane Doe") }`,
    `        ${componentName}(`,
    `            label = "Full name",`,
    `            value = name,`,
    `            onValueChange = { name = it },`,
    `            hint = "First and last name",`,
    `            isRequired = true,`,
    `        )`,
    '',
    `        var email by remember { mutableStateOf("") }`,
    `        ${componentName}(`,
    `            label = "Email address",`,
    `            value = email,`,
    `            onValueChange = { email = it },`,
    `            hint = "For example: name@agency.gov",`,
    `            error = if (email.isNotEmpty() && !email.contains("@")) "Enter a valid email address" else null,`,
    `            isRequired = true,`,
    `            inputType = CivInputType.Email,`,
    `        )`,
    `    }`,
    `}`,
  ];

  return lines.join('\n') + '\n';
}
