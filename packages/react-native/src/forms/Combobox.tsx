import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput as RNTextInput,
} from 'react-native';
import { formStyles } from '../core/styles.js';
import { buildAccessibilityLabel, buildAccessibilityState } from '../core/a11y.js';
import { colors, spacing, typography, border } from '../core/tokens.js';
import type { CivFormProps, ComboboxOption } from '../core/types.js';
import { useAnalytics } from '../core/useAnalytics.js';

export interface ComboboxProps extends CivFormProps {
  /** Available options. */
  options: ComboboxOption[];
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
  /** Text shown when no options match the filter. */
  noResultsText?: string;
  /** Placeholder text for the filter input. */
  filterPlaceholder?: string;
  /** Called on input (mirrors web civ-input event). */
  onInput?: (value: string) => void;
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
    maxHeight: '70%' as unknown as number,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: spacing[4],
    borderBottomWidth: border.width[1],
    borderBottomColor: colors.base.lighter,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.base.darkest,
    marginBottom: spacing[2],
  },
  filterInput: {
    borderWidth: border.width[1],
    borderColor: colors.base.lighter,
    borderRadius: border.radius.DEFAULT,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    fontSize: typography.fontSize.base,
    color: colors.base.darkest,
  },
  doneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
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
  noResults: {
    padding: spacing[4],
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: typography.fontSize.base,
    color: colors.base.DEFAULT,
  },
});

/**
 * CivUI Combobox for React Native.
 *
 * Like Select but with a filter input for searching options.
 * Mirrors the civ-combobox web component API.
 */
export function Combobox({
  name,
  value = '',
  label,
  hint,
  error,
  required,
  disabled,
  options,
  placeholder = 'Select an option',
  noResultsText = 'No results found',
  filterPlaceholder = 'Search...',
  onChange,
  onInput,
  onAnalytics,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [filter, setFilter] = useState('');
  const { trackInteraction } = useAnalytics({ onAnalytics });

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = useMemo(
    () =>
      filter
        ? options.filter((o) => o.label.toLowerCase().includes(filter.toLowerCase()))
        : options,
    [options, filter],
  );

  const handleSelect = useCallback(
    (option: ComboboxOption) => {
      if (option.disabled) return;
      onInput?.(option.value);
      onChange?.(option.value);
      trackInteraction('Combobox', 'change', { fieldName: name, label });
      setFilter('');
      setOpen(false);
    },
    [onChange, onInput, trackInteraction, name, label],
  );

  const handleOpen = useCallback(() => {
    if (!disabled) {
      setFilter('');
      setOpen(true);
    }
  }, [disabled]);

  return (
    <View style={formStyles.container} testID={`civ-combobox-${name}`}>
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
        onPress={handleOpen}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        accessibilityRole="combobox"
        accessibilityLabel={buildAccessibilityLabel({ label, hint, error, required })}
        accessibilityState={buildAccessibilityState({ disabled, expanded: open })}
        testID={`civ-combobox-${name}-trigger`}
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
              <View style={styles.doneRow}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={() => setOpen(false)}>
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <RNTextInput
                style={styles.filterInput}
                value={filter}
                onChangeText={setFilter}
                placeholder={filterPlaceholder}
                autoFocus
                testID={`civ-combobox-${name}-filter`}
              />
            </View>
            {filteredOptions.length === 0 ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>{noResultsText}</Text>
              </View>
            ) : (
              <FlatList
                data={filteredOptions}
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
                    accessibilityState={buildAccessibilityState({
                      selected: item.value === value,
                      disabled: item.disabled,
                    })}
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
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
