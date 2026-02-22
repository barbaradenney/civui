import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
} from 'react-native';
import { formStyles } from '../core/styles.js';
import { buildAccessibilityLabel, buildAccessibilityState } from '../core/a11y.js';
import { colors, typography } from '../core/tokens.js';
import type { CivFormProps } from '../core/types.js';
import { useAnalytics } from '../core/useAnalytics.js';

export interface TextareaProps extends CivFormProps {
  /** Number of visible text lines. Defaults to 5. */
  rows?: number;
  /** Maximum character length. Shows character count when set. */
  maxLength?: number;
  /** Placeholder text. */
  placeholder?: string;
  /** Called on input (mirrors web civ-input event). */
  onInput?: (value: string) => void;
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
 * CivUI Textarea for React Native.
 *
 * Mirrors the civ-textarea web component API.
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
  onInput,
  onAnalytics,
}: TextareaProps) {
  const [focused, setFocused] = useState(false);
  const { trackInteraction } = useAnalytics({ onAnalytics });
  const dirtyRef = useRef(false);

  const handleChange = useCallback(
    (text: string) => {
      dirtyRef.current = true;
      onInput?.(text);
      onChange?.(text);
    },
    [onChange, onInput],
  );

  const handleFocus = useCallback(() => {
    setFocused(true);
    dirtyRef.current = false;
  }, []);
  const handleBlur = useCallback(() => {
    setFocused(false);
    if (dirtyRef.current) {
      trackInteraction('Textarea', 'change', { fieldName: name, label });
      dirtyRef.current = false;
    }
  }, [trackInteraction, name, label]);

  const remaining = maxLength !== undefined ? maxLength - value.length : undefined;
  const isOverLimit = remaining !== undefined && remaining < 0;

  return (
    <View style={formStyles.container} testID={`civ-textarea-${name}`}>
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
        accessibilityState={buildAccessibilityState({ disabled })}
        testID={`civ-textarea-${name}-input`}
      />
      {remaining !== undefined ? (
        <Text
          style={[styles.charCount, isOverLimit ? styles.charCountOver : null]}
          accessibilityLiveRegion="polite"
        >
          {isOverLimit
            ? `${Math.abs(remaining)} characters over limit`
            : `${remaining} characters remaining`}
        </Text>
      ) : null}
    </View>
  );
}
