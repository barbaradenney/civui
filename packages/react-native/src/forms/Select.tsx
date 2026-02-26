import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { formStyles, OVERLAY_BACKGROUND } from '../core/styles.js';
import { buildAccessibilityLabel, buildAccessibilityState } from '../core/a11y.js';
import { colors, spacing, typography, border } from '../core/tokens.js';
import type { CivFormProps, SelectOption } from '../core/types.js';
import { useAnalytics } from '../core/useAnalytics.js';

export interface SelectProps extends CivFormProps {
  /** Available options. */
  options: SelectOption[];
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
  /** Label for the modal dismiss button. */
  doneLabel?: string;
  /** Called on input (mirrors web civ-input event). */
  onInput?: (value: string) => void;
  /** Accessibility hint for screen readers. */
  accessibilityHint?: string;
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  triggerText: {
    fontSize: typography.fontSize.base,
    color: colors.base.darkest,
    flex: 1,
  },
  placeholderText: {
    color: colors.base.light,
  },
  arrow: {
    fontSize: typography.fontSize.base,
    color: colors.base.DEFAULT,
    marginStart: spacing[2],
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: OVERLAY_BACKGROUND,
    padding: spacing[4],
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: border.radius.lg,
    maxHeight: Dimensions.get('window').height * 0.6,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: border.width[1],
    borderBottomColor: colors.base.lighter,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.base.darkest,
  },
  doneButton: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.DEFAULT,
  },
  option: {
    padding: spacing[4],
    borderBottomWidth: border.width[1],
    borderBottomColor: colors.base.lightest,
  },
  optionSelected: {
    backgroundColor: colors.primary.lightest,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: typography.fontSize.base,
    color: colors.base.darkest,
  },
  optionTextSelected: {
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.DEFAULT,
  },
});

/**
 * CivUI Select for React Native.
 *
 * Renders a trigger button that opens a modal picker.
 * Mirrors the civ-select web component API.
 */
export function Select({
  name,
  value = '',
  label,
  hint,
  error,
  required,
  disabled,
  options,
  placeholder = 'Select an option',
  doneLabel = 'Done',
  onChange,
  onInput,
  onAnalytics,
  accessibilityHint,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const { trackInteraction } = useAnalytics({ onAnalytics });

  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = useCallback(
    (option: SelectOption) => {
      if (option.disabled) return;
      onInput?.(option.value);
      onChange?.(option.value);
      trackInteraction('Select', 'change', { fieldName: name, label });
      setOpen(false);
    },
    [onChange, onInput, trackInteraction, name, label],
  );

  return (
    <View style={formStyles.container} testID={`civ-select-${name}`}>
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

      <Pressable
        style={({ pressed }) => [
          formStyles.input,
          styles.trigger,
          error ? formStyles.inputError : null,
          disabled ? formStyles.inputDisabled : null,
          focused ? formStyles.inputFocused : null,
          pressed ? { opacity: 0.7 } : null,
        ]}
        onPress={() => !disabled && setOpen(true)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={buildAccessibilityLabel({ label, hint, error, required })}
        accessibilityState={buildAccessibilityState({ disabled, expanded: open })}
        accessibilityHint={accessibilityHint}
        testID={`civ-select-${name}-trigger`}
      >
        <Text
          style={[styles.triggerText, !selectedOption ? styles.placeholderText : null]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.arrow}>{open ? '\u25B2' : '\u25BC'}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.modal} onPress={() => {}} accessibilityViewIsModal>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable onPress={() => setOpen(false)}>
                <Text style={styles.doneButton}>{doneLabel}</Text>
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.option,
                    item.value === value ? styles.optionSelected : null,
                    item.disabled ? styles.optionDisabled : null,
                  ]}
                  onPress={() => handleSelect(item)}
                  disabled={item.disabled}
                  accessibilityRole="menuitem"
                  accessibilityState={buildAccessibilityState({ selected: item.value === value, disabled: item.disabled })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value ? styles.optionTextSelected : null,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
