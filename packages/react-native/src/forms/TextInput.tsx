import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
} from 'react-native';
import type { TextInputProps as RNTextInputProps, NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';
import { formStyles } from '../core/styles.js';
import { buildAccessibilityLabel, buildAccessibilityState } from '../core/a11y.js';
import type { CivFormProps } from '../core/types.js';
import { useAnalytics } from '../core/useAnalytics.js';

export interface TextInputProps extends CivFormProps {
  /** Input type — maps to RN keyboardType/secureTextEntry. */
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url';
  /** Placeholder text. */
  placeholder?: string;
  /** Maximum character length. */
  maxLength?: number;
  /** Input mode — maps directly to RN inputMode. */
  inputMode?: RNTextInputProps['inputMode'];
  /** Additional TextInput props passed through. */
  textInputProps?: Partial<RNTextInputProps>;
  /** Called on input (mirrors web civ-input event). */
  onInput?: (value: string) => void;
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
  inputMode,
  onChange,
  onInput,
  onAnalytics,
  textInputProps,
}: TextInputProps) {
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

  const handleFocus = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setFocused(true);
      dirtyRef.current = false;
      textInputProps?.onFocus?.(e);
    },
    [textInputProps],
  );

  const handleBlur = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setFocused(false);
      if (dirtyRef.current) {
        trackInteraction('TextInput', 'change', { fieldName: name, label });
        dirtyRef.current = false;
      }
      textInputProps?.onBlur?.(e);
    },
    [textInputProps, trackInteraction, name, label],
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
        inputMode={inputMode}
        autoCapitalize={type === 'email' || type === 'url' ? 'none' : 'sentences'}
        accessibilityLabel={buildAccessibilityLabel({ label, hint, error, required })}
        accessibilityState={buildAccessibilityState({ disabled })}
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
