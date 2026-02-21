import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
} from 'react-native';
import { formStyles } from '../core/styles.js';
import { buildAccessibilityLabel } from '../core/a11y.js';
import { colors, typography } from '../core/tokens.js';
import type { CivdsFormProps } from '../core/types.js';

export interface TextareaProps extends CivdsFormProps {
  /** Number of visible text lines. Defaults to 5. */
  rows?: number;
  /** Maximum character length. Shows character count when set. */
  maxLength?: number;
  /** Placeholder text. */
  placeholder?: string;
}

const styles = StyleSheet.create({
  textarea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  charCount: {
    fontSize: typography.fontSize.sm,
    color: colors.base.DEFAULT,
    marginTop: 4,
    textAlign: 'right',
  },
  charCountOver: {
    color: colors.error.DEFAULT,
    fontWeight: typography.fontWeight.bold,
  },
});

/**
 * CivDS Textarea for React Native.
 *
 * Mirrors the civds-textarea web component API.
 */
export function Textarea({
  name,
  value = '',
  label,
  hint,
  error,
  required,
  disabled,
  rows = 5,
  maxLength,
  placeholder,
  onChange,
}: TextareaProps) {
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback(
    (text: string) => {
      onChange?.(text);
    },
    [onChange],
  );

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  const charCount = value.length;
  const isOverLimit = maxLength !== undefined && charCount > maxLength;

  return (
    <View style={formStyles.container} testID={`civds-textarea-${name}`}>
      <Text style={formStyles.label}>
        {label}
        {required && <Text style={formStyles.requiredIndicator}> *</Text>}
      </Text>
      {hint ? <Text style={formStyles.hint}>{hint}</Text> : null}
      {error ? (
        <Text style={formStyles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <RNTextInput
        style={[
          formStyles.input,
          styles.textarea,
          { minHeight: rows * 20 },
          error ? formStyles.inputError : null,
          disabled ? formStyles.inputDisabled : null,
          focused ? formStyles.inputFocused : null,
        ]}
        value={value}
        onChangeText={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        editable={!disabled}
        multiline
        numberOfLines={rows}
        accessibilityLabel={buildAccessibilityLabel({ label, hint, error, required })}
        accessibilityState={{ disabled }}
        testID={`civds-textarea-${name}-input`}
      />
      {maxLength !== undefined ? (
        <Text style={[styles.charCount, isOverLimit ? styles.charCountOver : null]}>
          {charCount}/{maxLength}
        </Text>
      ) : null}
    </View>
  );
}
