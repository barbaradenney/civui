import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  Modal,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import type { NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';
import { formStyles } from '../core/styles.js';
import { buildAccessibilityLabel, buildAccessibilityState } from '../core/a11y.js';
import { colors, spacing, typography, border } from '../core/tokens.js';
import { useAnalytics } from '../core/useAnalytics.js';
import type { AnalyticsHandler } from '../core/useAnalytics.js';
import { getMonthNames, parseISODate } from '@civui/core/date';

export interface MemorableDateProps {
  /** Base field name for form data collection. */
  name: string;
  /** Group legend text displayed above the fields. */
  legend: string;
  /** Current value in YYYY-MM-DD format. */
  value?: string;
  /** Hint text displayed below the legend. */
  hint?: string;
  /** Error message. When set, fields show error styling. */
  error?: string;
  /** Whether a value is required. */
  required?: boolean;
  /** Whether all fields are disabled. */
  disabled?: boolean;
  /** Label for the month picker (default: 'Month'). */
  monthLabel?: string;
  /** Label for the day input (default: 'Day'). */
  dayLabel?: string;
  /** Label for the year input (default: 'Year'). */
  yearLabel?: string;
  /** Locale for month names (default: 'en-US'). */
  locale?: string;
  /** Called when the value changes (mirrors web civ-change event). */
  onChange?: (value: string, parts: { month: string; day: string; year: string }) => void;
  /** Called on input (mirrors web civ-input event). */
  onInput?: (value: string, parts: { month: string; day: string; year: string }) => void;
  /** Analytics event handler. */
  onAnalytics?: AnalyticsHandler;
  /** Accessibility hint describing the expected input. */
  accessibilityHint?: string;
}

const styles = StyleSheet.create({
  legend: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.base.darkest,
    marginBottom: spacing[2],
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing[4],
    alignItems: 'flex-end',
  },
  fieldColumn: {
    flex: 0,
  },
  monthColumn: {
    width: 160,
  },
  dayColumn: {
    width: 80,
  },
  yearColumn: {
    width: 96,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.base.darkest,
    marginBottom: spacing[1],
  },
  disabled: {
    opacity: 0.5,
  },
  // Month picker trigger
  monthTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthTriggerText: {
    fontSize: typography.fontSize.base,
    color: colors.base.darkest,
    flex: 1,
  },
  monthPlaceholder: {
    color: colors.base.light,
  },
  arrow: {
    fontSize: typography.fontSize.base,
    color: colors.base.DEFAULT,
    marginStart: spacing[2],
  },
  // Month modal
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
 * CivUI Memorable Date for React Native.
 *
 * Three-field date input (month picker + day + year text inputs).
 * Mirrors the civ-memorable-date web component API.
 * Outputs value in YYYY-MM-DD format.
 */
export function MemorableDate({
  name,
  legend,
  value = '',
  hint,
  error,
  required,
  disabled,
  monthLabel = 'Month',
  dayLabel = 'Day',
  yearLabel = 'Year',
  locale = 'en-US',
  onChange,
  onInput,
  onAnalytics,
  accessibilityHint,
}: MemorableDateProps) {
  // Parse initial value into month/day/year parts
  const parseParts = useCallback((isoValue: string) => {
    if (!isoValue) return { month: '', day: '', year: '' };
    const parts = isoValue.split('-');
    if (parts.length === 3) {
      return { month: parts[0] === '00' ? '' : parts[1], day: parts[2], year: parts[0] };
    }
    return { month: '', day: '', year: '' };
  }, []);

  const initial = useMemo(() => parseParts(value), [value, parseParts]);

  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);
  const [year, setYear] = useState(initial.year);
  const [monthOpen, setMonthOpen] = useState(false);
  const [dayFocused, setDayFocused] = useState(false);
  const [yearFocused, setYearFocused] = useState(false);
  const [monthFocused, setMonthFocused] = useState(false);

  const { trackInteraction } = useAnalytics({ onAnalytics });

  // Keep a ref to the latest value for blur-based change detection
  const lastEmittedRef = useRef(value);

  // Sync from prop changes
  useEffect(() => {
    const parsed = parseParts(value);
    if (parsed.month !== month) setMonth(parsed.month);
    if (parsed.day !== day) setDay(parsed.day);
    if (parsed.year !== year) setYear(parsed.year);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const monthOptions = useMemo(() => {
    const names = getMonthNames(locale);
    return names.map((label, i) => ({
      value: String(i + 1).padStart(2, '0'),
      label,
    }));
  }, [locale]);

  const assembleValue = useCallback(
    (m: string, d: string, y: string): string => {
      if (y && m && d) {
        const assembled = `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        // Validate it is a real date
        if (!parseISODate(assembled)) return '';
        return assembled;
      }
      return '';
    },
    [],
  );

  const emitValues = useCallback(
    (m: string, d: string, y: string, fireChange: boolean) => {
      const assembled = assembleValue(m, d, y);
      const parts = { month: m, day: d, year: y };
      onInput?.(assembled, parts);
      if (fireChange) {
        onChange?.(assembled, parts);
        trackInteraction('MemorableDate', 'change', { fieldName: name, label: legend });
        lastEmittedRef.current = assembled;
      }
    },
    [assembleValue, onInput, onChange, trackInteraction, name, legend],
  );

  // Month selection
  const handleMonthSelect = useCallback(
    (monthValue: string) => {
      setMonth(monthValue);
      setMonthOpen(false);
      emitValues(monthValue, day, year, true);
    },
    [day, year, emitValues],
  );

  // Day input
  const handleDayChange = useCallback(
    (text: string) => {
      // Allow only digits, max 2 chars
      const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
      setDay(cleaned);
      emitValues(month, cleaned, year, false);
    },
    [month, year, emitValues],
  );

  const handleDayBlur = useCallback(
    (_e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setDayFocused(false);
      const assembled = assembleValue(month, day, year);
      if (assembled !== lastEmittedRef.current) {
        onChange?.(assembled, { month, day, year });
        trackInteraction('MemorableDate', 'change', { fieldName: name, label: legend });
        lastEmittedRef.current = assembled;
      }
    },
    [month, day, year, assembleValue, onChange, trackInteraction, name, legend],
  );

  // Year input
  const handleYearChange = useCallback(
    (text: string) => {
      // Allow only digits, max 4 chars
      const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
      setYear(cleaned);
      emitValues(month, day, cleaned, false);
    },
    [month, day, emitValues],
  );

  const handleYearBlur = useCallback(
    (_e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setYearFocused(false);
      const assembled = assembleValue(month, day, year);
      if (assembled !== lastEmittedRef.current) {
        onChange?.(assembled, { month, day, year });
        trackInteraction('MemorableDate', 'change', { fieldName: name, label: legend });
        lastEmittedRef.current = assembled;
      }
    },
    [month, day, year, assembleValue, onChange, trackInteraction, name, legend],
  );

  const selectedMonthOption = monthOptions.find((o) => o.value === month);

  return (
    <View
      style={[formStyles.container, disabled ? styles.disabled : null]}
      pointerEvents={disabled ? 'none' : 'auto'}
      accessibilityRole="none"
      accessibilityLabel={buildAccessibilityLabel({
        label: legend,
        hint,
        error,
        required,
      })}
      accessibilityHint={accessibilityHint}
      testID={`civ-memorable-date-${name}`}
    >
      {/* Legend */}
      <Text style={styles.legend}>
        {legend}
        {required && <Text style={formStyles.requiredIndicator}> *</Text>}
      </Text>

      {/* Hint */}
      {hint ? <Text style={formStyles.hint}>{hint}</Text> : null}

      {/* Error */}
      {error ? (
        <Text style={formStyles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      {/* Fields row: month picker, day input, year input */}
      <View style={styles.fieldRow}>
        {/* Month picker */}
        <View style={[styles.fieldColumn, styles.monthColumn]}>
          <Text style={styles.fieldLabel}>{monthLabel}</Text>
          <Pressable
            style={[
              formStyles.input,
              styles.monthTrigger,
              error ? formStyles.inputError : null,
              disabled ? formStyles.inputDisabled : null,
              monthFocused ? formStyles.inputFocused : null,
            ]}
            onPress={() => !disabled && setMonthOpen(true)}
            onFocus={() => setMonthFocused(true)}
            onBlur={() => setMonthFocused(false)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={buildAccessibilityLabel({
              label: monthLabel,
              hint: selectedMonthOption ? selectedMonthOption.label : undefined,
              error,
              required,
            })}
            accessibilityState={buildAccessibilityState({ disabled, expanded: monthOpen })}
            testID={`civ-memorable-date-${name}-month-trigger`}
          >
            <Text
              style={[
                styles.monthTriggerText,
                !selectedMonthOption ? styles.monthPlaceholder : null,
              ]}
            >
              {selectedMonthOption ? selectedMonthOption.label : `- ${monthLabel} -`}
            </Text>
            <Text style={styles.arrow}>{monthOpen ? '\u25B2' : '\u25BC'}</Text>
          </Pressable>

          <Modal
            visible={monthOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setMonthOpen(false)}
          >
            <Pressable style={styles.overlay} onPress={() => setMonthOpen(false)}>
              <Pressable style={styles.modal} onPress={() => {}} accessibilityViewIsModal>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{monthLabel}</Text>
                  <Pressable onPress={() => setMonthOpen(false)}>
                    <Text style={styles.doneButton}>Done</Text>
                  </Pressable>
                </View>
                <FlatList
                  data={monthOptions}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.option,
                        item.value === month ? styles.optionSelected : null,
                      ]}
                      onPress={() => handleMonthSelect(item.value)}
                      accessibilityRole="menuitem"
                      accessibilityState={buildAccessibilityState({
                        selected: item.value === month,
                      })}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          item.value === month ? styles.optionTextSelected : null,
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

        {/* Day input */}
        <View style={[styles.fieldColumn, styles.dayColumn]}>
          <Text style={styles.fieldLabel}>{dayLabel}</Text>
          <RNTextInput
            style={[
              formStyles.input,
              error ? formStyles.inputError : null,
              disabled ? formStyles.inputDisabled : null,
              dayFocused ? formStyles.inputFocused : null,
            ]}
            value={day}
            onChangeText={handleDayChange}
            onFocus={() => setDayFocused(true)}
            onBlur={handleDayBlur}
            placeholder="DD"
            maxLength={2}
            keyboardType="numeric"
            inputMode="numeric"
            editable={!disabled}
            accessibilityLabel={buildAccessibilityLabel({
              label: dayLabel,
              error,
              required,
            })}
            accessibilityState={buildAccessibilityState({ disabled })}
            testID={`civ-memorable-date-${name}-day`}
          />
        </View>

        {/* Year input */}
        <View style={[styles.fieldColumn, styles.yearColumn]}>
          <Text style={styles.fieldLabel}>{yearLabel}</Text>
          <RNTextInput
            style={[
              formStyles.input,
              error ? formStyles.inputError : null,
              disabled ? formStyles.inputDisabled : null,
              yearFocused ? formStyles.inputFocused : null,
            ]}
            value={year}
            onChangeText={handleYearChange}
            onFocus={() => setYearFocused(true)}
            onBlur={handleYearBlur}
            placeholder="YYYY"
            maxLength={4}
            keyboardType="numeric"
            inputMode="numeric"
            editable={!disabled}
            accessibilityLabel={buildAccessibilityLabel({
              label: yearLabel,
              error,
              required,
            })}
            accessibilityState={buildAccessibilityState({ disabled })}
            testID={`civ-memorable-date-${name}-year`}
          />
        </View>
      </View>
    </View>
  );
}
