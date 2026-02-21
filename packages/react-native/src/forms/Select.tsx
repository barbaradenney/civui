import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { formStyles } from '../core/styles.js';
import { buildAccessibilityLabel } from '../core/a11y.js';
import { colors, spacing, typography, border } from '../core/tokens.js';
import type { CivdsFormProps, SelectOption } from '../core/types.js';

export interface SelectProps extends CivdsFormProps {
  /** Available options. */
  options: SelectOption[];
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
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
    marginLeft: spacing[2],
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: spacing[4],
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: border.radius.lg,
    maxHeight: '60%' as unknown as number,
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
 * CivDS Select for React Native.
 *
 * Renders a trigger button that opens a modal picker.
 * Mirrors the civds-select web component API.
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
  onChange,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = useCallback(
    (option: SelectOption) => {
      if (option.disabled) return;
      onChange?.(option.value);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <View style={formStyles.container} testID={`civds-select-${name}`}>
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

      <TouchableOpacity
        style={[
          formStyles.input,
          styles.trigger,
          error ? formStyles.inputError : null,
          disabled ? formStyles.inputDisabled : null,
          focused ? formStyles.inputFocused : null,
        ]}
        onPress={() => !disabled && setOpen(true)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        accessibilityRole="combobox"
        accessibilityLabel={buildAccessibilityLabel({ label, hint, error, required })}
        accessibilityState={{ disabled, expanded: open }}
        testID={`civds-select-${name}-trigger`}
      >
        <Text
          style={[styles.triggerText, !selectedOption ? styles.placeholderText : null]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.arrow}>{open ? '\u25B2' : '\u25BC'}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value ? styles.optionSelected : null,
                    item.disabled ? styles.optionDisabled : null,
                  ]}
                  onPress={() => handleSelect(item)}
                  disabled={item.disabled}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: item.value === value, disabled: item.disabled }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value ? styles.optionTextSelected : null,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
