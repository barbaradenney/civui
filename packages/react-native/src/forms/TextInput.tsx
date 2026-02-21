import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
} from 'react-native';
import type { TextInputProps as RNTextInputProps, NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';
import { formStyles } from '../core/styles.js';
import { buildAccessibilityLabel } from '../core/a11y.js';
import type { CivFormProps } from '../core/types.js';

export interface TextInputProps extends CivFormProps {
  /** Input type — maps to RN keyboardType/secureTextEntry. */
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url';
  /** Placeholder text. */
  placeholder?: string;
  /** Maximum character length. */
  maxLength?: number;
  /** Additional TextInput props passed through. */
  textInputProps?: Partial<RNTextInputProps>;
}

/**
 * CivUI TextInput for React Native.
 *
 * Mirrors the civ-text-input web component API.
 */
export function TextInput({
  name,
  value = '',
  label,
  hint,
  error,
  required,
  disabled,
  type = 'text',
  placeholder,
  maxLength,
  onChange,
  textInputProps,
}: TextInputProps) {
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback(
    (text: string) => {
      onChange?.(text);
    },
    [onChange],
  );

  const handleFocus = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setFocused(true);
      textInputProps?.onFocus?.(e);
    },
    [textInputProps],
  );

  const handleBlur = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setFocused(false);
      textInputProps?.onBlur?.(e);
    },
    [textInputProps],
  );

  const keyboardType = getKeyboardType(type);
  const secureTextEntry = type === 'password';

  return (
    <View style={formStyles.container} testID={`civ-text-input-${name}`}>
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
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={type === 'email' || type === 'url' ? 'none' : 'sentences'}
        accessibilityLabel={buildAccessibilityLabel({ label, hint, error, required })}
        accessibilityState={{ disabled }}
        testID={`civ-text-input-${name}-input`}
        {...textInputProps}
      />
    </View>
  );
}

function getKeyboardType(type: string): RNTextInputProps['keyboardType'] {
  switch (type) {
    case 'email':
      return 'email-address';
    case 'tel':
      return 'phone-pad';
    case 'number':
      return 'numeric';
    case 'url':
      return 'url';
    default:
      return 'default';
  }
}
