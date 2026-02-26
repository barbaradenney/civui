import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { formStyles } from '../core/styles.js';
import { buildAccessibilityLabel, buildAccessibilityState } from '../core/a11y.js';
import { colors, spacing, typography, border } from '../core/tokens.js';
import type { CivFormProps } from '../core/types.js';
import { useAnalytics } from '../core/useAnalytics.js';
import {
  parseISODate,
  toISODateString,
  formatDate,
  formatDateLong,
  generateCalendarMonth,
  getDayOfWeekHeaders,
  getMonthNames,
  isSameDay,
  isDateDisabled,
  isMonthDisabled,
  type DateConstraints,
} from '@civui/core/date';

export interface DatePickerProps extends CivFormProps {
  /** Minimum selectable date in YYYY-MM-DD format. */
  min?: string;
  /** Maximum selectable date in YYYY-MM-DD format. */
  max?: string;
  /** Locale for date formatting (default: en-US). */
  locale?: string;
  /** Day the week starts on (0=Sunday, 1=Monday). */
  weekStartsOn?: number;
  /** Custom function to disable specific dates. */
  isDateDisabled?: (date: Date) => boolean;
  /** Placeholder text for the trigger. */
  placeholder?: string;
  /** Called on input (mirrors web civ-input event). */
  onInput?: (value: string) => void;
  /** Accessibility hint for screen readers. */
  accessibilityHint?: string;
  /** Accessible label for the trigger when no date is selected. */
  chooseDateLabel?: string;
  /** Accessible label for the trigger when a date is selected. Uses {date} placeholder. */
  selectedDateLabel?: string;
  /** Title shown in the calendar dialog header. */
  dialogLabel?: string;
  /** Accessible label for the previous month button. */
  previousMonthLabel?: string;
  /** Accessible label for the next month button. */
  nextMonthLabel?: string;
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
  calendarIcon: {
    fontSize: typography.fontSize.lg,
    color: colors.base.DEFAULT,
    marginStart: spacing[2],
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
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: border.width[1],
    borderBottomColor: colors.base.lighter,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.base.darkest,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  navButton: {
    padding: spacing[2],
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: typography.fontSize.lg,
    color: colors.primary.DEFAULT,
    fontWeight: typography.fontWeight.bold,
  },
  monthYearText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.base.darkest,
  },
  grid: {
    padding: spacing[2],
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayHeader: {
    width: 44,
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.base.dark,
    paddingVertical: spacing[1],
  },
  dayCell: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: border.radius.full,
  },
  dayCellText: {
    fontSize: typography.fontSize.sm,
    color: colors.base.darkest,
  },
  dayOutOfMonth: {
    opacity: 0.3,
  },
  dayDisabled: {
    opacity: 0.3,
  },
  daySelected: {
    backgroundColor: colors.primary.DEFAULT,
  },
  daySelectedText: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  dayToday: {
    borderWidth: border.width[2],
    borderColor: colors.primary.DEFAULT,
  },
  doneButton: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.DEFAULT,
  },
});

/**
 * CivUI Date Picker for React Native.
 *
 * Renders a trigger button that opens a modal calendar grid.
 * Mirrors the civ-date-picker web component API.
 */
export function DatePicker({
  name,
  value = '',
  label,
  hint,
  error,
  required,
  disabled,
  min,
  max,
  locale = 'en-US',
  weekStartsOn = 0,
  isDateDisabled: customIsDisabled,
  placeholder = 'Select a date',
  onChange,
  onInput,
  onAnalytics,
  accessibilityHint,
  chooseDateLabel = 'Choose date',
  selectedDateLabel = 'Choose date, selected date is {date}',
  dialogLabel = 'Choose Date',
  previousMonthLabel = 'Previous month',
  nextMonthLabel = 'Next month',
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(() => {
    const parsed = value ? parseISODate(value) : null;
    return parsed ? parsed.getMonth() : new Date().getMonth();
  });
  const [displayYear, setDisplayYear] = useState(() => {
    const parsed = value ? parseISODate(value) : null;
    return parsed ? parsed.getFullYear() : new Date().getFullYear();
  });

  const { trackInteraction } = useAnalytics({ onAnalytics });

  const constraints: DateConstraints = useMemo(
    () => ({ min, max, isDateDisabled: customIsDisabled }),
    [min, max, customIsDisabled],
  );

  const selectedDate = useMemo(
    () => (value ? parseISODate(value) : null),
    [value],
  );

  const displayText = selectedDate
    ? formatDate(selectedDate, locale)
    : '';

  const cal = useMemo(
    () => generateCalendarMonth(displayYear, displayMonth, { weekStartsOn }),
    [displayYear, displayMonth, weekStartsOn],
  );

  const headers = useMemo(
    () => getDayOfWeekHeaders(locale, weekStartsOn),
    [locale, weekStartsOn],
  );

  const monthNames = useMemo(() => getMonthNames(locale), [locale]);

  const handleSelect = useCallback(
    (date: Date) => {
      if (isDateDisabled(date, constraints)) return;
      const iso = toISODateString(date);
      onInput?.(iso);
      onChange?.(iso);
      trackInteraction('DatePicker', 'change', { fieldName: name, label });
      setOpen(false);
    },
    [onChange, onInput, trackInteraction, name, label, constraints],
  );

  const prevMonth = useCallback(() => {
    setDisplayMonth((m) => {
      if (m === 0) {
        setDisplayYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setDisplayMonth((m) => {
      if (m === 11) {
        setDisplayYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const prevDisabled = isMonthDisabled(
    displayMonth === 0 ? displayYear - 1 : displayYear,
    displayMonth === 0 ? 11 : displayMonth - 1,
    constraints,
  );

  const nextDisabled = isMonthDisabled(
    displayMonth === 11 ? displayYear + 1 : displayYear,
    displayMonth === 11 ? 0 : displayMonth + 1,
    constraints,
  );

  const handleOpen = useCallback(() => {
    if (disabled) return;
    if (selectedDate) {
      setDisplayMonth(selectedDate.getMonth());
      setDisplayYear(selectedDate.getFullYear());
    }
    setOpen(true);
  }, [disabled, selectedDate]);

  return (
    <View style={formStyles.container} testID={`civ-date-picker-${name}`}>
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
        accessibilityRole="button"
        accessibilityLabel={buildAccessibilityLabel({
          label: selectedDate
            ? selectedDateLabel.replace('{date}', displayText)
            : chooseDateLabel,
          hint,
          error,
          required,
        })}
        accessibilityState={buildAccessibilityState({ disabled, expanded: open })}
        accessibilityHint={accessibilityHint}
        testID={`civ-date-picker-${name}-trigger`}
      >
        <Text
          style={[styles.triggerText, !selectedDate ? styles.placeholderText : null]}
        >
          {selectedDate ? displayText : placeholder}
        </Text>
        <Text style={styles.calendarIcon}>{'\uD83D\uDCC5'}</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.modal} onPress={() => {}} accessibilityViewIsModal>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{dialogLabel}</Text>
              <Pressable onPress={() => setOpen(false)}>
                <Text style={styles.doneButton}>Done</Text>
              </Pressable>
            </View>

            <View style={styles.navRow}>
              <Pressable
                style={[styles.navButton, prevDisabled ? styles.navButtonDisabled : null]}
                onPress={prevMonth}
                disabled={prevDisabled}
                accessibilityRole="button"
                accessibilityLabel={previousMonthLabel}
              >
                <Text style={styles.navButtonText}>{'\u25C0'}</Text>
              </Pressable>
              <Text style={styles.monthYearText}>
                {monthNames[displayMonth]} {displayYear}
              </Text>
              <Pressable
                style={[styles.navButton, nextDisabled ? styles.navButtonDisabled : null]}
                onPress={nextMonth}
                disabled={nextDisabled}
                accessibilityRole="button"
                accessibilityLabel={nextMonthLabel}
              >
                <Text style={styles.navButtonText}>{'\u25B6'}</Text>
              </Pressable>
            </View>

            <View style={styles.grid}>
              <View style={styles.weekRow}>
                {headers.map((h) => (
                  <Text key={h.short} style={styles.dayHeader}>
                    {h.short}
                  </Text>
                ))}
              </View>
              {cal.weeks.map((week, wi) => (
                <View key={wi} style={styles.weekRow}>
                  {week.map((day) => {
                    const dayDisabled =
                      !day.inCurrentMonth || isDateDisabled(day.date, constraints);
                    const selected = selectedDate
                      ? isSameDay(day.date, selectedDate)
                      : false;

                    return (
                      <Pressable
                        key={toISODateString(day.date)}
                        style={[
                          styles.dayCell,
                          !day.inCurrentMonth ? styles.dayOutOfMonth : null,
                          dayDisabled ? styles.dayDisabled : null,
                          selected ? styles.daySelected : null,
                          day.isToday && !selected ? styles.dayToday : null,
                        ]}
                        onPress={() => handleSelect(day.date)}
                        disabled={dayDisabled}
                        accessibilityRole="button"
                        accessibilityLabel={formatDateLong(day.date, locale)}
                        accessibilityState={buildAccessibilityState({
                          selected,
                          disabled: dayDisabled,
                        })}
                      >
                        <Text
                          style={[
                            styles.dayCellText,
                            selected ? styles.daySelectedText : null,
                          ]}
                        >
                          {day.day}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
