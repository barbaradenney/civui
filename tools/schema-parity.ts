#!/usr/bin/env npx tsx
/**
 * CivUI Schema Parity Check
 *
 * Validates that the canonical Lit web implementation of each component
 * matches the platform-neutral schema in `@civui/schema`. Schemas are
 * the contract that contractors / new platform implementations are
 * expected to satisfy — this tool fails the build when the Lit source
 * drifts from the schema.
 *
 * Coverage grows incrementally as schemas are synced and added —
 * extend `COVERED_COMPONENTS` below to include a component once
 * its schema matches the Lit source.
 *
 * Usage:
 *   npx tsx tools/schema-parity.ts          # report drift, exit 1 on any drift
 *   npx tsx tools/schema-parity.ts --strict # also fail on missing schemas
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const ROOT = join(import.meta.dirname, '..');

/** True when the module is run directly (CLI), false when imported by tests. */
function isCliInvocation(): boolean {
  const argv = process.argv[1];
  if (!argv) return false;
  try {
    return import.meta.url === pathToFileURL(argv).href;
  } catch {
    return false;
  }
}

interface SchemaProp {
  name: string;
  type: string;
  default?: string | number | boolean;
  attribute?: string;
  /** Web-specific prop that the platform parity check should skip */
  webOnly?: boolean;
}

interface LitProp {
  name: string;
  type: string;
  default?: string;
  attribute?: string;
}

interface ComponentEvent {
  name: string;
  /** Sorted list of keys in the event detail object (e.g. ['value'] for {value: '...'}) */
  detailKeys: string[];
  /**
   * True when at least one dispatch site uses a non-inline detail
   * (e.g. `dispatch(this, 'civ-input', detail)` with a variable, or
   * a spread inside the literal). The shape is unknowable from
   * source, so the diff skips detail-key comparison for this event.
   */
  detailUnknown?: boolean;
}

interface ComponentSpec {
  /** Schema file name without extension (e.g. "civ-text-input") */
  name: string;
  /** Path to the canonical Lit source, relative to repo root */
  source: string;
  /** Whether this component extends a boolean form base (checkbox/toggle) — adds checked/description as inherited props */
  isBoolean?: boolean;
  /** Optional path to the iOS SwiftUI struct (relative to repo root). When set, platform parity validates prop coverage */
  ios?: string;
  /** Optional path to the Android Compose function */
  android?: string;
  /** Optional path to the Drupal SDC `<name>.component.yml` */
  drupal?: string;
}

const COVERED_COMPONENTS: ComponentSpec[] = [
  { name: 'civ-text-input',        source: 'packages/inputs/src/text-input/civ-text-input.ts',                                        ios: 'packages/ios/Sources/CivUI/CivTextInput.swift',        android: 'packages/android/src/main/kotlin/gov/civui/components/CivTextInput.kt',        drupal: 'packages/drupal/civui/components/text-input/text-input.component.yml' },
  { name: 'civ-checkbox',          source: 'packages/controls/src/checkbox/civ-checkbox.ts',           isBoolean: true,                ios: 'packages/ios/Sources/CivUI/CivCheckbox.swift',         android: 'packages/android/src/main/kotlin/gov/civui/components/CivCheckbox.kt',         drupal: 'packages/drupal/civui/components/checkbox/checkbox.component.yml' },
  { name: 'civ-radio-group',       source: 'packages/controls/src/radio/civ-radio-group.ts',                                          ios: 'packages/ios/Sources/CivUI/CivRadio.swift',                                                                                                drupal: 'packages/drupal/civui/components/radio-group/radio-group.component.yml' },
  { name: 'civ-radio',             source: 'packages/controls/src/radio/civ-radio.ts',                                                ios: 'packages/ios/Sources/CivUI/CivRadio.swift',            android: 'packages/android/src/main/kotlin/gov/civui/components/CivRadio.kt',            drupal: 'packages/drupal/civui/components/radio/radio.component.yml' },
  { name: 'civ-yes-no',            source: 'packages/inputs/src/yes-no/civ-yes-no.ts',                                                ios: 'packages/ios/Sources/CivUI/CivYesNo.swift',            android: 'packages/android/src/main/kotlin/gov/civui/components/CivYesNo.kt',            drupal: 'packages/drupal/civui/components/yes-no/yes-no.component.yml' },
  { name: 'civ-checkbox-group',    source: 'packages/controls/src/checkbox/civ-checkbox-group.ts',                                    ios: 'packages/ios/Sources/CivUI/CivCheckboxGroup.swift',    android: 'packages/android/src/main/kotlin/gov/civui/components/CivCheckboxGroup.kt',    drupal: 'packages/drupal/civui/components/checkbox-group/checkbox-group.component.yml' },
  { name: 'civ-combobox',          source: 'packages/inputs/src/combobox/civ-combobox.ts',                                            ios: 'packages/ios/Sources/CivUI/CivCombobox.swift',         android: 'packages/android/src/main/kotlin/gov/civui/components/CivCombobox.kt',         drupal: 'packages/drupal/civui/components/combobox/combobox.component.yml' },
  { name: 'civ-date-picker',       source: 'packages/inputs/src/date-picker/civ-date-picker.ts',                                      ios: 'packages/ios/Sources/CivUI/CivDatePicker.swift',       android: 'packages/android/src/main/kotlin/gov/civui/components/CivDatePicker.kt',       drupal: 'packages/drupal/civui/components/date-picker/date-picker.component.yml' },
  { name: 'civ-file-upload',       source: 'packages/inputs/src/file-upload/civ-file-upload.ts',                                      ios: 'packages/ios/Sources/CivUI/CivFileUpload.swift',       android: 'packages/android/src/main/kotlin/gov/civui/components/CivFileUpload.kt',       drupal: 'packages/drupal/civui/components/file-upload/file-upload.component.yml' },
  { name: 'civ-memorable-date',    source: 'packages/inputs/src/date-input/civ-memorable-date.ts',                                    ios: 'packages/ios/Sources/CivUI/CivMemorableDate.swift',    android: 'packages/android/src/main/kotlin/gov/civui/components/CivMemorableDate.kt',    drupal: 'packages/drupal/civui/components/memorable-date/memorable-date.component.yml' },
  { name: 'civ-time-picker',       source: 'packages/inputs/src/time-picker/civ-time-picker.ts',                                      ios: 'packages/ios/Sources/CivUI/CivTimePicker.swift',       android: 'packages/android/src/main/kotlin/gov/civui/components/CivTimePicker.kt',       drupal: 'packages/drupal/civui/components/time-picker/time-picker.component.yml' },
  { name: 'civ-segmented-control', source: 'packages/controls/src/segmented-control/civ-segmented-control.ts',                       ios: 'packages/ios/Sources/CivUI/CivSegmentedControl.swift', android: 'packages/android/src/main/kotlin/gov/civui/components/CivSegmentedControl.kt', drupal: 'packages/drupal/civui/components/segmented-control/segmented-control.component.yml' },
  { name: 'civ-segment',           source: 'packages/controls/src/segmented-control/civ-segment.ts',                                  ios: 'packages/ios/Sources/CivUI/CivSegmentedControl.swift', android: 'packages/android/src/main/kotlin/gov/civui/components/CivSegmentedControl.kt' },
  { name: 'civ-select',            source: 'packages/inputs/src/select/civ-select.ts',                                                ios: 'packages/ios/Sources/CivUI/CivSelect.swift',           android: 'packages/android/src/main/kotlin/gov/civui/components/CivSelect.kt',           drupal: 'packages/drupal/civui/components/select/select.component.yml' },
  { name: 'civ-textarea',          source: 'packages/inputs/src/textarea/civ-textarea.ts',                                            ios: 'packages/ios/Sources/CivUI/CivTextarea.swift',         android: 'packages/android/src/main/kotlin/gov/civui/components/CivTextarea.kt',         drupal: 'packages/drupal/civui/components/textarea/textarea.component.yml' },
  { name: 'civ-number',            source: 'packages/inputs/src/number/civ-number.ts',                                                ios: 'packages/ios/Sources/CivUI/CivNumber.swift',           android: 'packages/android/src/main/kotlin/gov/civui/components/CivNumber.kt',           drupal: 'packages/drupal/civui/components/number/number.component.yml' },
  { name: 'civ-toggle',            source: 'packages/inputs/src/toggle/civ-toggle.ts',                 isBoolean: true,                ios: 'packages/ios/Sources/CivUI/CivToggle.swift',           android: 'packages/android/src/main/kotlin/gov/civui/components/CivToggle.kt',           drupal: 'packages/drupal/civui/components/toggle/toggle.component.yml' },
  { name: 'civ-address',           source: 'packages/compound/src/address/civ-address.ts',                                            ios: 'packages/ios/Sources/CivUI/CivAddress.swift',          android: 'packages/android/src/main/kotlin/gov/civui/components/CivAddress.kt',          drupal: 'packages/drupal/civui/components/address/address.component.yml' },
  { name: 'civ-repeater',          source: 'packages/form-patterns/src/repeater/civ-repeater.ts',                                     ios: 'packages/ios/Sources/CivUI/CivRepeater.swift',         android: 'packages/android/src/main/kotlin/gov/civui/components/CivRepeater.kt',         drupal: 'packages/drupal/civui/components/repeater/repeater.component.yml' },
  { name: 'civ-name',              source: 'packages/compound/src/name/civ-name.ts',                                                  ios: 'packages/ios/Sources/CivUI/CivName.swift',             android: 'packages/android/src/main/kotlin/gov/civui/components/CivName.kt',             drupal: 'packages/drupal/civui/components/name/name.component.yml' },
  { name: 'civ-direct-deposit',    source: 'packages/compound/src/direct-deposit/civ-direct-deposit.ts',                              ios: 'packages/ios/Sources/CivUI/CivDirectDeposit.swift',    android: 'packages/android/src/main/kotlin/gov/civui/components/CivDirectDeposit.kt',    drupal: 'packages/drupal/civui/components/direct-deposit/direct-deposit.component.yml' },
  { name: 'civ-signature',         source: 'packages/compound/src/signature/civ-signature.ts',                                        ios: 'packages/ios/Sources/CivUI/CivSignature.swift',        android: 'packages/android/src/main/kotlin/gov/civui/components/CivSignature.kt',        drupal: 'packages/drupal/civui/components/signature/signature.component.yml' },
  { name: 'civ-form-step',         source: 'packages/form-patterns/src/form-step/civ-form-step.ts',                                   ios: 'packages/ios/Sources/CivUI/CivFormStep.swift',         android: 'packages/android/src/main/kotlin/gov/civui/components/CivFormStep.kt',         drupal: 'packages/drupal/civui/components/form-step/form-step.component.yml' },
  { name: 'civ-progress-steps',    source: 'packages/form-patterns/src/progress/civ-progress-steps.ts',                               ios: 'packages/ios/Sources/CivUI/CivProgressSteps.swift',    android: 'packages/android/src/main/kotlin/gov/civui/components/CivProgressSteps.kt' },
  { name: 'civ-progress-percent',  source: 'packages/form-patterns/src/progress/civ-progress-percent.ts',                             ios: 'packages/ios/Sources/CivUI/CivProgressPercent.swift',  android: 'packages/android/src/main/kotlin/gov/civui/components/CivProgressPercent.kt',  drupal: 'packages/drupal/civui/components/progress-percent/progress-percent.component.yml' },
  { name: 'civ-race-ethnicity',    source: 'packages/compound/src/race-ethnicity/civ-race-ethnicity.ts',                              ios: 'packages/ios/Sources/CivUI/CivRaceEthnicity.swift',    android: 'packages/android/src/main/kotlin/gov/civui/components/CivRaceEthnicity.kt',    drupal: 'packages/drupal/civui/components/race-ethnicity/race-ethnicity.component.yml' },
  { name: 'civ-partnership-history',  source: 'packages/compound/src/partnership-history/civ-partnership-history.ts',                          ios: 'packages/ios/Sources/CivUI/CivPartnershipHistory.swift',  android: 'packages/android/src/main/kotlin/gov/civui/components/CivPartnershipHistory.kt',  drupal: 'packages/drupal/civui/components/partnership-history/partnership-history.component.yml' },
  { name: 'civ-relationship',      source: 'packages/compound/src/relationship/civ-relationship.ts',                                  ios: 'packages/ios/Sources/CivUI/CivRelationship.swift',     android: 'packages/android/src/main/kotlin/gov/civui/components/CivRelationship.kt',     drupal: 'packages/drupal/civui/components/relationship/relationship.component.yml' },
  { name: 'civ-service-history',   source: 'packages/compound/src/service-history/civ-service-history.ts',                            ios: 'packages/ios/Sources/CivUI/CivServiceHistory.swift',   android: 'packages/android/src/main/kotlin/gov/civui/components/CivServiceHistory.kt',   drupal: 'packages/drupal/civui/components/service-history/service-history.component.yml' },
  { name: 'civ-filterable-list',   source: 'packages/layout/src/filterable-list/civ-filterable-list.ts',                                ios: 'packages/ios/Sources/CivUI/CivFilterableList.swift',   android: 'packages/android/src/main/kotlin/gov/civui/components/CivFilterableList.kt',   drupal: 'packages/drupal/civui/components/filterable-list/filterable-list.component.yml' },
  { name: 'civ-support-resources', source: 'packages/form-patterns/src/support-resources/civ-support-resources.ts',                    ios: 'packages/ios/Sources/CivUI/CivSupportResources.swift', android: 'packages/android/src/main/kotlin/gov/civui/components/CivSupportResources.kt', drupal: 'packages/drupal/civui/components/support-resources/support-resources.component.yml' },
  { name: 'civ-date-range-picker', source: 'packages/inputs/src/date-range-picker/civ-date-range-picker.ts',                          ios: 'packages/ios/Sources/CivUI/CivDateRangePicker.swift', android: 'packages/android/src/main/kotlin/gov/civui/components/CivDateRangePicker.kt', drupal: 'packages/drupal/civui/components/date-range-picker/date-range-picker.component.yml' },
  { name: 'civ-progress-header',   source: 'packages/form-patterns/src/progress/civ-progress-header.ts',                              ios: 'packages/ios/Sources/CivUI/CivProgressHeader.swift', android: 'packages/android/src/main/kotlin/gov/civui/components/CivProgressHeader.kt', drupal: 'packages/drupal/civui/components/progress-header/progress-header.component.yml' },
  { name: 'civ-data-field',        source: 'packages/form-patterns/src/data-field/civ-data-field.ts',                                  ios: 'packages/ios/Sources/CivUI/CivDataField.swift',     android: 'packages/android/src/main/kotlin/gov/civui/components/CivDataField.kt',     drupal: 'packages/drupal/civui/components/data-field/data-field.component.yml' },
  { name: 'civ-conditional',       source: 'packages/form-patterns/src/conditional/civ-conditional.ts',                                ios: 'packages/ios/Sources/CivUI/CivConditional.swift',   android: 'packages/android/src/main/kotlin/gov/civui/components/CivConditional.kt',   drupal: 'packages/drupal/civui/components/conditional/conditional.component.yml' },
  { name: 'civ-summary',           source: 'packages/form-patterns/src/summary/civ-summary.ts',                                        ios: 'packages/ios/Sources/CivUI/CivSummary.swift',       android: 'packages/android/src/main/kotlin/gov/civui/components/CivSummary.kt',       drupal: 'packages/drupal/civui/components/summary/summary.component.yml' },
  { name: 'civ-modal',             source: 'packages/overlays/src/modal/civ-modal.ts',                                                ios: 'packages/ios/Sources/CivUI/CivModal.swift',         android: 'packages/android/src/main/kotlin/gov/civui/components/CivModal.kt',         drupal: 'packages/drupal/civui/components/modal/modal.component.yml' },
  { name: 'civ-action-sheet',      source: 'packages/overlays/src/action-sheet/civ-action-sheet.ts',                                  ios: 'packages/ios/Sources/CivUI/CivActionSheet.swift',   android: 'packages/android/src/main/kotlin/gov/civui/components/CivActionSheet.kt',   drupal: 'packages/drupal/civui/components/action-sheet/action-sheet.component.yml' },
  { name: 'civ-alert',             source: 'packages/feedback/src/alert/civ-alert.ts',                                                ios: 'packages/ios/Sources/CivUI/CivAlert.swift',         android: 'packages/android/src/main/kotlin/gov/civui/components/CivAlert.kt',         drupal: 'packages/drupal/civui/components/alert/alert.component.yml' },
  { name: 'civ-badge',             source: 'packages/feedback/src/badge/civ-badge.ts',                                                ios: 'packages/ios/Sources/CivUI/CivBadge.swift',         android: 'packages/android/src/main/kotlin/gov/civui/components/CivBadge.kt',         drupal: 'packages/drupal/civui/components/badge/badge.component.yml' },
  { name: 'civ-count',             source: 'packages/feedback/src/count/civ-count.ts',                                                ios: 'packages/ios/Sources/CivUI/CivCount.swift',         android: 'packages/android/src/main/kotlin/gov/civui/components/CivCount.kt',         drupal: 'packages/drupal/civui/components/count/count.component.yml' },
  { name: 'civ-card',              source: 'packages/layout/src/card/civ-card.ts',                                                    ios: 'packages/ios/Sources/CivUI/CivCard.swift',          android: 'packages/android/src/main/kotlin/gov/civui/components/CivCard.kt',          drupal: 'packages/drupal/civui/components/card/card.component.yml' },
  { name: 'civ-divider',           source: 'packages/layout/src/divider/civ-divider.ts',                                              ios: 'packages/ios/Sources/CivUI/CivDivider.swift',       android: 'packages/android/src/main/kotlin/gov/civui/components/CivDivider.kt',       drupal: 'packages/drupal/civui/components/divider/divider.component.yml' },
  { name: 'civ-disclosure',        source: 'packages/layout/src/disclosure/civ-disclosure.ts',                                        ios: 'packages/ios/Sources/CivUI/CivDisclosure.swift',    android: 'packages/android/src/main/kotlin/gov/civui/components/CivDisclosure.kt',    drupal: 'packages/drupal/civui/components/disclosure/disclosure.component.yml' },
  { name: 'civ-tag',               source: 'packages/layout/src/tag/civ-tag.ts',                                                      ios: 'packages/ios/Sources/CivUI/CivTag.swift',           android: 'packages/android/src/main/kotlin/gov/civui/components/CivTag.kt',           drupal: 'packages/drupal/civui/components/tag/tag.component.yml' },
  { name: 'civ-list',              source: 'packages/layout/src/list/civ-list.ts',                                                    ios: 'packages/ios/Sources/CivUI/CivList.swift',          android: 'packages/android/src/main/kotlin/gov/civui/components/CivList.kt',          drupal: 'packages/drupal/civui/components/list/list.component.yml' },
  { name: 'civ-list-item',         source: 'packages/layout/src/list/civ-list-item.ts',                                               ios: 'packages/ios/Sources/CivUI/CivList.swift',          android: 'packages/android/src/main/kotlin/gov/civui/components/CivList.kt',          drupal: 'packages/drupal/civui/components/list-item/list-item.component.yml' },
  { name: 'civ-page-header',       source: 'packages/layout/src/page-header/civ-page-header.ts',                                      ios: 'packages/ios/Sources/CivUI/CivPageHeader.swift',    android: 'packages/android/src/main/kotlin/gov/civui/components/CivPageHeader.kt',    drupal: 'packages/drupal/civui/components/page-header/page-header.component.yml' },
  { name: 'civ-section-intro',     source: 'packages/form-patterns/src/section-intro/civ-section-intro.ts',                           ios: 'packages/ios/Sources/CivUI/CivSectionIntro.swift',  android: 'packages/android/src/main/kotlin/gov/civui/components/CivSectionIntro.kt',  drupal: 'packages/drupal/civui/components/section-intro/section-intro.component.yml' },
  { name: 'civ-button',            source: 'packages/actions/src/button/civ-button.ts',                                               ios: 'packages/ios/Sources/CivUI/CivButton.swift',        android: 'packages/android/src/main/kotlin/gov/civui/components/CivButton.kt',        drupal: 'packages/drupal/civui/components/button/button.component.yml' },
  { name: 'civ-link',              source: 'packages/actions/src/link/civ-link.ts',                                                ios: 'packages/ios/Sources/CivUI/CivLink.swift',          android: 'packages/android/src/main/kotlin/gov/civui/components/CivLink.kt',          drupal: 'packages/drupal/civui/components/link/link.component.yml' },
  { name: 'civ-link-card',         source: 'packages/actions/src/link-card/civ-link-card.ts',                                      ios: 'packages/ios/Sources/CivUI/CivLinkCard.swift',      android: 'packages/android/src/main/kotlin/gov/civui/components/CivLinkCard.kt',      drupal: 'packages/drupal/civui/components/link-card/link-card.component.yml' },
  { name: 'civ-skip-link',         source: 'packages/actions/src/skip-link/civ-skip-link.ts',                                      ios: 'packages/ios/Sources/CivUI/CivSkipLink.swift',      android: 'packages/android/src/main/kotlin/gov/civui/components/CivSkipLink.kt',      drupal: 'packages/drupal/civui/components/skip-link/skip-link.component.yml' },
  { name: 'civ-action-button',     source: 'packages/actions/src/action-button/civ-action-button.ts',                                 ios: 'packages/ios/Sources/CivUI/CivActionButton.swift',  android: 'packages/android/src/main/kotlin/gov/civui/components/CivActionButton.kt',  drupal: 'packages/drupal/civui/components/action-button/action-button.component.yml' },
  // civ-button-group is bundled into CivActionButton on iOS — no separate Swift file.
  { name: 'civ-button-group',      source: 'packages/layout/src/button-group/civ-button-group.ts',                                                                                                              android: 'packages/android/src/main/kotlin/gov/civui/components/CivButtonGroup.kt',   drupal: 'packages/drupal/civui/components/button-group/button-group.component.yml' },
  { name: 'civ-icon',              source: 'packages/core/src/icon/civ-icon.ts',                                                      ios: 'packages/ios/Sources/CivUI/CivIcon.swift',          android: 'packages/android/src/main/kotlin/gov/civui/components/CivIcon.kt',          drupal: 'packages/drupal/civui/components/icon/icon.component.yml' },
  { name: 'civ-filter-chip',       source: 'packages/actions/src/filter-chip/civ-filter-chip.ts',                                     ios: 'packages/ios/Sources/CivUI/CivFilterChip.swift',    android: 'packages/android/src/main/kotlin/gov/civui/components/CivFilterChip.kt',    drupal: 'packages/drupal/civui/components/filter-chip/filter-chip.component.yml' },
  { name: 'civ-filter-chip-group', source: 'packages/actions/src/filter-chip-group/civ-filter-chip-group.ts',                         ios: 'packages/ios/Sources/CivUI/CivFilterChipGroup.swift', android: 'packages/android/src/main/kotlin/gov/civui/components/CivFilterChipGroup.kt', drupal: 'packages/drupal/civui/components/filter-chip-group/filter-chip-group.component.yml' },
];

// Inherited props / events live in tools/lib/inherited.ts so the parity
// check, the Drupal SDC sync, and (potentially) other tooling all agree
// on the same source of truth. Adding a new framework-level prop edits
// one file; consumers re-import.
import {
  INHERITED_FORM_PROPS,
  INHERITED_BOOLEAN_PROPS,
  INHERITED_FORM_EVENTS,
  BASE_DISPATCHED_EVENTS,
} from './lib/inherited.js';

/**
 * Walk source from `openIndex` (which points at the opening `{`) and
 * return the content between the matching braces, plus the position
 * just after the closing `}`. Tracks string literals and the three
 * bracket pairs so nested objects, generics, and array literals are
 * handled correctly. Returns null if no balanced match.
 */
function extractBraceBlock(src: string, openIndex: number): { body: string; endIndex: number } | null {
  if (src[openIndex] !== '{') return null;
  let depth = 0;
  let stringChar: string | null = null;
  for (let i = openIndex; i < src.length; i++) {
    const ch = src[i];
    if (stringChar) {
      if (ch === '\\') { i++; continue; } // skip escaped char
      if (ch === stringChar) stringChar = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { stringChar = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return { body: src.slice(openIndex + 1, i), endIndex: i + 1 };
    }
  }
  return null;
}

export function parseLitPropsFromSource(src: string, isBoolean: boolean): LitProp[] {
  const props: LitProp[] = [];
  // The previous regex used `[^}]*` for the @property options, which broke
  // on any nested brace (multi-line objects, converter literals, default-
  // value object initializers). Walk the source, find each `@property(`
  // occurrence, extract the parenthesized options block via brace-depth
  // scanning, then parse the prop name + default off the rest of the
  // declaration line.
  const headerRegex = /@property\s*\(\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = headerRegex.exec(src)) !== null) {
    const openBrace = m.index + m[0].length - 1; // position of `{`
    const block = extractBraceBlock(src, openBrace);
    if (!block) continue;
    // After the options, expect `})` then optional whitespace and the
    // property declaration: `<modifiers> <name>[?!]?[: Type][= default]`.
    let after = block.endIndex;
    if (src[after] !== ')') continue;
    after++; // skip `)`
    // Skip whitespace and modifiers (`public`, `private`, `protected`,
    // `override`, `readonly`, `static`, `accessor`, plus decorators).
    const declRegex = /\s*(?:(?:public|private|protected|override|readonly|static|accessor|declare)\s+|@\w+\s*)*(\w+)([?!])?(?:\s*:\s*[^=;\n{]+)?(?:\s*=\s*([^;\n]+))?/y;
    declRegex.lastIndex = after;
    const declMatch = declRegex.exec(src);
    if (!declMatch) continue;
    const name = declMatch[1];
    const dflt = declMatch[3]?.trim();
    const skip = INHERITED_FORM_PROPS.has(name) || (isBoolean && INHERITED_BOOLEAN_PROPS.has(name));
    if (skip) continue;
    const typeMatch = block.body.match(/type:\s*(\w+)/);
    const attrMatch = block.body.match(/attribute:\s*['"]([^'"]+)['"]/);
    props.push({
      name,
      type: typeMatch ? typeMatch[1].toLowerCase() : 'string',
      default: dflt,
      attribute: attrMatch ? attrMatch[1] : undefined,
    });
  }
  return props;
}

function parseLitProps(filePath: string, isBoolean: boolean): LitProp[] {
  return parseLitPropsFromSource(readFileSync(filePath, 'utf-8'), isBoolean);
}

/**
 * Walk the source for `dispatch(this, '<name>', { detail-keys })` calls
 * and collect a deduped list. Detail-key parsing is shallow — picks up
 * the top-level keys of the literal object passed as the third arg —
 * which is the surface contract a consumer relies on.
 */
export function parseLitEventsFromSource(src: string): ComponentEvent[] {
  const eventsByName = new Map<string, { keys: Set<string>; unknown: boolean }>();

  function record(name: string, detailArg: string | undefined): void {
    if (INHERITED_FORM_EVENTS.has(name)) return;
    if (!eventsByName.has(name)) eventsByName.set(name, { keys: new Set(), unknown: false });
    const entry = eventsByName.get(name)!;
    const arg = detailArg?.trim();
    if (!arg) return;
    if (!arg.startsWith('{')) {
      entry.unknown = true;
      return;
    }
    const body = arg.replace(/^\{/, '').replace(/\}$/, '');
    // Split on top-level commas only — nested objects (`meta: { ... }`)
    // and arrays (`items: [1, 2, 3]`) and string-literal commas
    // (`label: 'a, b'`) shouldn't fragment.
    for (const piece of splitTopLevelCommas(body)) {
      const trimmed = piece.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('...')) {
        entry.unknown = true;
        continue;
      }
      const keyMatch = trimmed.match(/^(?:['"]([\w-]+)['"]|(\w+))/);
      if (!keyMatch) continue;
      const key = keyMatch[1] ?? keyMatch[2];
      if (key) entry.keys.add(key);
    }
  }

  function splitTopLevelCommas(s: string): string[] {
    const out: string[] = [];
    let depth = 0;
    let stringChar: string | null = null;
    let start = 0;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (stringChar) {
        if (ch === '\\') { i++; continue; }
        if (ch === stringChar) stringChar = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { stringChar = ch; continue; }
      if (ch === '{' || ch === '[' || ch === '(') depth++;
      else if (ch === '}' || ch === ']' || ch === ')') depth--;
      else if (ch === ',' && depth === 0) {
        out.push(s.slice(start, i));
        start = i + 1;
      }
    }
    out.push(s.slice(start));
    return out;
  }

  // Pattern 1: dispatch(this, 'name', { ... })  — preferred helper. The
  // detail block (if present) is extracted via brace-depth scanning so
  // nested-object literals don't truncate the match.
  const dispatchHeader = /dispatch\(\s*this\s*,\s*['"]([\w-]+)['"]\s*(,)?/g;
  let m: RegExpExecArray | null;
  while ((m = dispatchHeader.exec(src)) !== null) {
    const name = m[1];
    if (!m[2]) {
      // No second arg — fire with no detail.
      record(name, undefined);
      continue;
    }
    // Skip whitespace after the comma, then either match a `{...}` literal
    // (extract via brace depth) or fall back to "unknown shape" if the arg
    // is a variable or spread.
    let i = m.index + m[0].length;
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] === '{') {
      const block = extractBraceBlock(src, i);
      if (block) record(name, '{' + block.body + '}');
      else record(name, undefined);
    } else {
      record(name, src.slice(i, i + 1)); // non-`{` first char triggers "unknown" branch
    }
  }

  // Pattern 2: this.dispatchEvent(new CustomEvent('name', { detail: {...}, ... }))
  // The init object is captured via brace-depth scanning, then `detail:`
  // is found inside it (also via brace-depth) so nested literals don't
  // truncate the detail-keys list.
  const customEventHeader = /this\.dispatchEvent\(\s*new\s+CustomEvent\(\s*['"]([\w-]+)['"]\s*(,)?/g;
  while ((m = customEventHeader.exec(src)) !== null) {
    const name = m[1];
    if (!m[2]) {
      record(name, undefined);
      continue;
    }
    let i = m.index + m[0].length;
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] !== '{') {
      record(name, src.slice(i, i + 1));
      continue;
    }
    const init = extractBraceBlock(src, i);
    if (!init) { record(name, undefined); continue; }
    // Find `detail:` at top level of the init body.
    const detailIdx = init.body.search(/(^|[\s,{])detail\s*:/);
    if (detailIdx < 0) { record(name, undefined); continue; }
    const colonIdx = init.body.indexOf(':', detailIdx);
    let j = colonIdx + 1;
    while (j < init.body.length && /\s/.test(init.body[j])) j++;
    if (init.body[j] !== '{') { record(name, init.body.slice(j, j + 1)); continue; }
    const detail = extractBraceBlock(init.body, j);
    if (!detail) { record(name, undefined); continue; }
    record(name, '{' + detail.body + '}');
  }

  return [...eventsByName.entries()].map(([name, entry]) => ({
    name,
    detailKeys: [...entry.keys].sort(),
    detailUnknown: entry.unknown,
  }));
}

function parseLitEvents(filePath: string): ComponentEvent[] {
  return parseLitEventsFromSource(readFileSync(filePath, 'utf-8'));
}

/**
 * iOS uses Swift naming conventions, particularly an `is` prefix for
 * boolean props (`required` → `isRequired`, `tile` → `isTile`, etc.).
 * For each schema prop, also accept the `isXxx` variant — false-positive
 * collisions are vanishingly rare for well-named props.
 */
/**
 * Native platforms use Swift/Kotlin camelCase for HTML-attribute-derived
 * props that the schema and Lit keep all-lowercase (matching the HTML
 * attribute spec). Translate `maxlength` → `maxLength`, etc.
 */
const HTML_ATTR_TO_NATIVE_CAMEL: Record<string, string> = {
  maxlength: 'maxLength',
  minlength: 'minLength',
  inputmode: 'inputMode',
  autocomplete: 'autocomplete', // already camel-friendly
};

export function iosPropAlternatives(name: string): string[] {
  const alternatives = [name, `is${name[0].toUpperCase()}${name.slice(1)}`];
  // iOS also commonly maps `type` → `inputType` and `name` → `formName`,
  // since `type` shadows Swift's metatype keyword and `name` collides
  // with View's accessibility name.
  if (name === 'type') alternatives.push('inputType');
  if (name === 'name') alternatives.push('formName');
  if (HTML_ATTR_TO_NATIVE_CAMEL[name]) alternatives.push(HTML_ATTR_TO_NATIVE_CAMEL[name]);
  return alternatives;
}

/**
 * Android Compose largely follows Lit's prop names verbatim, but a few
 * collide with reserved/builtin keywords and get renamed.
 */
export function androidPropAlternatives(name: string): string[] {
  const alternatives = [name];
  if (name === 'type') alternatives.push('inputType');
  if (HTML_ATTR_TO_NATIVE_CAMEL[name]) alternatives.push(HTML_ATTR_TO_NATIVE_CAMEL[name]);
  return alternatives;
}

export interface NativeProp {
  name: string;
  /** The raw type expression as written in the source (e.g. "Bool", "@Binding<String>", "LinkCardVariant", "[String]") */
  type: string;
}

export function parseSwiftPropNamesFromSource(src: string): string[] {
  return parseSwiftPropsFromSource(src).map((p) => p.name);
}

/**
 * Extract `public var name: Type` and `public let name: Type` declarations
 * from a Swift source file. Walks line by line so the type extraction is
 * straightforward — the type starts after the colon and runs until the
 * next `=`, `{`, or end-of-line. Computed properties (which write
 * `var name: Type { get { ... } }`) are filtered out by checking what
 * character ends the declaration line — `{` means computed.
 */
export function parseSwiftPropsFromSource(src: string): NativeProp[] {
  const props: NativeProp[] = [];
  const seen = new Set<string>();
  // Match a single declaration: optional decorators (`@Foo`), bare modifiers
  // (`final`, `nonisolated`), and access-level modifiers with optional
  // setter qualifier (`public`, `public private(set)`, `internal(set)`),
  // followed by `var|let`, name, type. Anchored to line start so we don't
  // catch matches inside larger expressions.
  const declRegex = /^[ \t]*(?:(?:@\w+(?:\([^)]*\))?[ \t]+)|(?:(?:final|nonisolated|static|class|override|weak|unowned|lazy|dynamic)[ \t]+))*public(?:[ \t]+(?:private|fileprivate|internal)\([ \t]*set[ \t]*\))?[ \t]+(?:var|let)\s+(\w+)\s*:\s*(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = declRegex.exec(src)) !== null) {
    const name = m[1];
    if (seen.has(name)) continue;
    const rest = m[2];
    // The type runs until the first top-level `=` (default value) or `{`
    // (computed property body). If it ends with `{`, this is a computed
    // property — skip it.
    const stop = findTypeEnd(rest);
    if (stop.kind === 'computed') continue;
    seen.add(name);
    props.push({ name, type: rest.slice(0, stop.index).trim() });
  }
  return props;
}

/**
 * Walk a Swift type-expression-plus-rest string and find where the type
 * ends — at the first top-level `=` (returns `default`) or `{` (returns
 * `computed`), or end of string (returns `eol`). Tracks `<>`, `()`, and
 * `[]` depth so generics and tuple types don't break the scan.
 */
function findTypeEnd(s: string): { kind: 'default' | 'computed' | 'eol'; index: number } {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(' || ch === '[' || ch === '<') depth++;
    else if (ch === ')' || ch === ']' || ch === '>') depth--;
    else if (ch === '=' && depth === 0 && s[i + 1] !== '=') return { kind: 'default', index: i };
    else if (ch === '{' && depth === 0) return { kind: 'computed', index: i };
  }
  return { kind: 'eol', index: s.length };
}

function parseSwiftPropNames(filePath: string): string[] {
  return parseSwiftPropNamesFromSource(readFileSync(filePath, 'utf-8'));
}

function parseSwiftProps(filePath: string): NativeProp[] {
  return parseSwiftPropsFromSource(readFileSync(filePath, 'utf-8'));
}

export function parseKotlinPropNamesFromSource(src: string, displayName: string): string[] {
  return parseKotlinPropsFromSource(src, displayName).map((p) => p.name);
}

/**
 * Extract `name: Type` parameter declarations from the matching @Composable
 * function. Captures the type expression up to the next `=` or top-level
 * comma — covers basic types, optionals (`String?`), generics
 * (`List<String>`), and lambda types (`(String) -> Unit`).
 */
export function parseKotlinPropsFromSource(src: string, displayName: string): NativeProp[] {
  // Strip `// …` line comments and `/* … */` block comments before parsing.
  // Without this, a comment inside the parameter list (e.g. grouping
  // related props with `// Route mode props`) leaks into the next
  // parameter's name and the parser silently drops it.
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  // Find the @Composable function signature for the matching component.
  // Pattern: `fun CivXxx(\n  param1: Type,\n  param2: Type,...)`
  const fnStart = stripped.search(new RegExp(`fun\\s+${displayName}\\s*\\(`));
  if (fnStart < 0) return [];
  // Walk forward and capture the parameter list up to the matching `)`.
  // Skip only the FIRST `(` (the function-signature opener); all
  // subsequent parens — including those inside lambda / generic type
  // literals like `(AddressValue) -> Unit` — are part of the body.
  let depth = 0;
  let body = '';
  for (let i = fnStart; i < stripped.length; i++) {
    const ch = stripped[i];
    if (ch === '(') {
      depth++;
      if (depth === 1) continue; // skip the signature-opening paren only
    } else if (ch === ')') {
      depth--;
      if (depth === 0) break;
    }
    if (depth >= 1) body += ch;
  }
  const props: NativeProp[] = [];
  const seen = new Set<string>();
  // Each parameter is `name: Type[ = default]`, separated by commas at the
  // top level. Track paren/brace depth for nested lambda types like
  // `(AddressValue) -> Unit`. Skip generic-angle tracking — the `>` in
  // function-arrow syntax `->` would unbalance it, and Kotlin generic
  // type literals with multiple commas at the parameter top level are
  // rare enough that we accept the simpler walker.
  let paramStart = 0;
  let parenDepth = 0;
  for (let i = 0; i <= body.length; i++) {
    const ch = body[i];
    if (ch === '(' || ch === '{' || ch === '[') parenDepth++;
    else if (ch === ')' || ch === '}' || ch === ']') parenDepth--;
    if ((ch === ',' && parenDepth === 0) || i === body.length) {
      const piece = body.slice(paramStart, i).trim();
      paramStart = i + 1;
      const colonIdx = piece.indexOf(':');
      if (colonIdx < 0) continue;
      // Kotlin escapes reserved words like `when` and `is` with backticks
      // in parameter declarations. Strip them so the bare identifier
      // matches the schema prop name.
      const name = piece.slice(0, colonIdx).trim().replace(/^`(.+)`$/, '$1');
      if (!name || !/^[a-zA-Z_]\w*$/.test(name)) continue;
      if (seen.has(name)) continue;
      seen.add(name);
      // Type runs from after the colon to the next `=` (default value
      // separator) or end-of-piece.
      const rest = piece.slice(colonIdx + 1);
      const eqIdx = findTopLevelEquals(rest);
      const type = (eqIdx >= 0 ? rest.slice(0, eqIdx) : rest).trim();
      props.push({ name, type });
    }
  }
  return props;
}

/**
 * Find the position of the top-level `=` separator (the parameter-default
 * marker) in a Kotlin parameter piece. Tracks `()`, `[]`, and `{}` depth —
 * deliberately does NOT track `<>` because the lambda arrow `->` is
 * ambiguous with a generic close, and Kotlin generic types in parameter
 * lists rarely have a top-level `=` inside them.
 *
 * Skips `==` / `!=` / `<=` / `>=` / `=>` to avoid false matches inside
 * default-value expressions. Idiomatic Kotlin always surrounds the
 * parameter-default `=` with whitespace, so we use that as the
 * disambiguator for the rare `Foo<Bar>= default` case (no-space close-
 * generic followed by default) — the operator characters never appear
 * with whitespace in the parameter-default position.
 */
function findTopLevelEquals(s: string): number {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(' || ch === '{' || ch === '[') depth++;
    else if (ch === ')' || ch === '}' || ch === ']') depth--;
    if (ch === '=' && depth === 0) {
      const next = s[i + 1];
      const prev = s[i - 1];
      // Skip equality / arrow operators.
      if (next === '=' || next === '>') continue; // ==, =>
      if (prev === '=' || prev === '!') continue; // == (already advancing past first `=`), !=
      // `<=` / `>=` are operators ONLY when the relational operand starts
      // immediately. The parameter-default `=` is idiomatically separated
      // by whitespace; require that to disambiguate `Foo<Bar>= default`
      // (default marker, prev=`>` close-generic) from `a >= b` (operator).
      if ((prev === '<' || prev === '>') && prev !== ' ') {
        // Only skip if the `=` looks like part of a comparison operator —
        // i.e. there's no whitespace separating the param-type from `=`,
        // AND no whitespace between `=` and the next character. A Kotlin
        // formatter writes `param: Foo<Bar> = default` (spaces) for the
        // default and `a >= b` (spaces) for comparison, so the no-space
        // form is exclusively the operator case in real source.
        const hasSpaceAfter = next === ' ' || next === '\n' || next === '\t';
        if (!hasSpaceAfter) continue;
      }
      return i;
    }
  }
  return -1;
}

function parseKotlinPropNames(filePath: string, displayName: string): string[] {
  return parseKotlinPropNamesFromSource(readFileSync(filePath, 'utf-8'), displayName);
}

function parseKotlinProps(filePath: string, displayName: string): NativeProp[] {
  return parseKotlinPropsFromSource(readFileSync(filePath, 'utf-8'), displayName);
}

/**
 * Categorize a native (Swift / Kotlin) type expression into one of the
 * schema's PropDef types. Returns `unknown` for custom types (PascalCase
 * identifiers like `LinkCardVariant`) — those are accepted for string /
 * enum schema props on the assumption they're enum-like, but rejected
 * for boolean / number / array (those should use built-ins).
 *
 * The categorization is deliberately forgiving — false positives on
 * type-drift would be more painful than missing a real one.
 */
export function categorizeNativeType(rawType: string): 'boolean' | 'number' | 'string-or-enum' | 'array' | 'unknown' | 'callback' {
  const t = rawType.trim()
    // Strip trailing optionality / nullability markers (Swift `?`, Kotlin `?`).
    .replace(/\?+$/, '')
    // Unwrap `Binding<X>` / `@Binding ... X` — schema cares about the wrapped
    // value type. The Swift parser strips the @Binding decorator already, but
    // a generic `Binding<X>` form would still wrap.
    .replace(/^Binding<(.+)>$/, '$1')
    .trim();

  // Lambda / function types are callbacks, not schema props — should be
  // filtered out by the caller (they don't appear in schema.props at all).
  if (/->\s*\w/.test(t)) return 'callback';

  // Built-in scalars.
  if (/^Bool(ean)?$/.test(t)) return 'boolean';
  if (/^(Int|Int8|Int16|Int32|Int64|UInt|UInt8|UInt16|UInt32|UInt64|Long|ULong|Short|UShort|Byte|UByte|Double|Float|CGFloat|Number)$/.test(t)) return 'number';
  if (/^String$/.test(t)) return 'string-or-enum';

  // Array forms.
  if (/^\[.+\]$/.test(t)) return 'array'; // Swift [String]
  if (/^(List|Array|Set|MutableList)<.+>$/.test(t)) return 'array';

  // PascalCase identifiers — likely a custom enum or struct. Treat as
  // string-or-enum for matching purposes (variants are commonly modeled
  // as native enums on iOS/Android).
  if (/^[A-Z][a-zA-Z0-9_]*$/.test(t)) return 'unknown';

  return 'unknown';
}

/** Map a schema PropDef.type to the native-type categories that satisfy it. */
function expectedNativeCategories(schemaType: string): Array<'boolean' | 'number' | 'string-or-enum' | 'array' | 'unknown'> {
  switch (schemaType) {
    case 'boolean': return ['boolean'];
    case 'number': return ['number'];
    case 'string': return ['string-or-enum', 'unknown'];
    case 'enum': return ['string-or-enum', 'unknown'];
    case 'array': return ['array', 'unknown']; // typed arrays of structs surface as `[SummarySectionData]` etc.
    default: return ['string-or-enum', 'unknown'];
  }
}

export function camelToSnake(name: string): string {
  return name.replace(/([A-Z]+)/g, '_$1').replace(/^_/, '').toLowerCase();
}

export interface DrupalProp {
  name: string;
  /** YAML type token: 'string' | 'boolean' | 'integer' | 'array' (or undefined when the SDC omits type) */
  type?: string;
}

/**
 * Parse the props.properties block of a Drupal SDC YAML, capturing each
 * prop name AND its declared type. The type drives the cross-platform
 * type-drift check (a `boolean` schema prop must surface in Drupal as
 * `type: boolean`, etc.).
 *
 * Only the FIRST `properties:` block (the immediate child of top-level
 * `props:`) is captured. Nested `properties:` blocks under `slots:`,
 * `libraryOverrides:`, or array `items:` are ignored.
 */
export function parseDrupalPropsFromYaml(src: string): DrupalProp[] {
  const lines = src.split('\n');
  const props: DrupalProp[] = [];
  // 'before-props': haven't seen the top-level `props:` line yet.
  // 'in-props': inside the props: block, looking for `properties:` child.
  // 'in-properties': capturing prop entries.
  // 'done': captured the first properties block, ignore everything after.
  let state: 'before-props' | 'in-props' | 'in-properties' | 'done' = 'before-props';
  let propsIndent = 0;
  let baseIndent = 0;
  let currentName: string | null = null;
  let currentIndent = 0;
  let pendingType: string | undefined;
  function flush(): void {
    if (currentName) props.push({ name: currentName, type: pendingType });
    currentName = null;
    pendingType = undefined;
  }
  for (const line of lines) {
    if (state === 'done') break;
    const m = line.match(/^(\s*)([\w-]+)\s*:(.*)$/);
    if (!m) continue;
    const indent = m[1].length;
    const key = m[2];
    if (state === 'before-props') {
      if (key === 'props' && indent === 0) {
        state = 'in-props';
        propsIndent = indent;
      }
      continue;
    }
    if (state === 'in-props') {
      // Dedented out of `props:` without finding `properties:` — stop.
      if (indent <= propsIndent) { state = 'done'; break; }
      if (key === 'properties' && indent === propsIndent + 2) {
        state = 'in-properties';
        baseIndent = indent;
      }
      continue;
    }
    // state === 'in-properties'
    if (indent <= baseIndent) {
      flush();
      state = 'done';
      break;
    }
    if (indent === baseIndent + 2) {
      flush();
      currentName = key;
      currentIndent = indent;
    } else if (currentName && key === 'type' && indent > currentIndent) {
      pendingType = m[3].trim();
    }
  }
  flush();
  return props;
}

export function parseDrupalPropNamesFromYaml(src: string): string[] {
  return parseDrupalPropsFromYaml(src).map((p) => p.name);
}

function parseDrupalPropNames(yamlPath: string): string[] {
  return parseDrupalPropNamesFromYaml(readFileSync(yamlPath, 'utf-8'));
}

function parseDrupalProps(yamlPath: string): DrupalProp[] {
  return parseDrupalPropsFromYaml(readFileSync(yamlPath, 'utf-8'));
}

/**
 * Map a schema PropDef.type to the Drupal SDC YAML `type:` token that
 * sync-drupal-sdc.ts emits when synthesizing missing props. Drift from
 * this mapping flags as a type mismatch — usually means the SDC was
 * hand-edited or the schema's type changed without a re-sync.
 */
export function expectedDrupalType(schemaType: string): string {
  switch (schemaType) {
    case 'number': return 'integer';
    case 'enum': return 'string';
    case 'boolean': return 'boolean';
    case 'array': return 'array';
    default: return 'string';
  }
}

async function loadSchema(name: string): Promise<any | null> {
  const path = join(ROOT, 'packages/schema/src/components', `${name}.schema.ts`);
  if (!existsSync(path)) return null;
  const mod = await import(pathToFileURL(path).href);
  return mod.default ?? mod;
}

function schemaPropsFrom(schema: any, isBoolean: boolean): SchemaProp[] {
  const props: SchemaProp[] = [];
  for (const [propName, def] of Object.entries(schema.props ?? {}) as [string, any][]) {
    // Match what parseLitProps skips so the diff is symmetric. Schemas
    // are allowed to declare inherited props for documentation, but the
    // parity check only compares component-specific surface.
    const skip =
      INHERITED_FORM_PROPS.has(propName) ||
      (isBoolean && INHERITED_BOOLEAN_PROPS.has(propName));
    if (skip) continue;
    props.push({
      name: propName,
      type: def.type,
      default: def.default,
      attribute: def.attribute,
      webOnly: def.webOnly,
    });
  }
  return props;
}

function schemaEventsFrom(schema: any): ComponentEvent[] {
  const events: ComponentEvent[] = [];
  for (const [evtName, def] of Object.entries(schema.events ?? {}) as [string, any][]) {
    if (INHERITED_FORM_EVENTS.has(evtName)) continue;
    const detailKeys = Object.keys(def.detail ?? {}).sort();
    events.push({ name: evtName, detailKeys });
  }
  return events;
}

interface PropDrift {
  /** Props declared in source but missing from schema */
  missingFromSchema: string[];
  /** Props declared in schema but no longer present in source */
  removedFromSource: string[];
  /** Props where the type / default / attribute differs */
  mismatched: Array<{ name: string; field: string; schema: unknown; source: unknown }>;
}

/**
 * Schemas use 'string' for both required and optional string props,
 * but Lit @property({ type: String }) is the source of truth for the
 * type token. We normalize a few common variants here so we don't
 * report cosmetic differences.
 */
export function normalizeType(type: string): string {
  const lower = type.toLowerCase();
  if (lower === 'string' || lower === 'enum') return 'string-or-enum';
  if (lower === 'array') return 'array';
  return lower;
}

function diffProps(schema: SchemaProp[], lit: LitProp[]): PropDrift {
  const schemaByName = new Map(schema.map((p) => [p.name, p]));
  const litByName = new Map(lit.map((p) => [p.name, p]));

  const missingFromSchema: string[] = [];
  const removedFromSource: string[] = [];
  const mismatched: PropDrift['mismatched'] = [];

  for (const litProp of lit) {
    if (!schemaByName.has(litProp.name)) {
      missingFromSchema.push(litProp.name);
      continue;
    }
    const schemaProp = schemaByName.get(litProp.name)!;
    if (normalizeType(schemaProp.type) !== normalizeType(litProp.type)) {
      mismatched.push({
        name: litProp.name,
        field: 'type',
        schema: schemaProp.type,
        source: litProp.type,
      });
    }
    if ((schemaProp.attribute ?? undefined) !== (litProp.attribute ?? undefined)) {
      mismatched.push({
        name: litProp.name,
        field: 'attribute',
        schema: schemaProp.attribute,
        source: litProp.attribute,
      });
    }
  }

  for (const schemaProp of schema) {
    if (!litByName.has(schemaProp.name)) {
      removedFromSource.push(schemaProp.name);
    }
  }

  return { missingFromSchema, removedFromSource, mismatched };
}

interface EventDrift {
  missingFromSchema: string[];
  removedFromSource: string[];
  detailMismatches: Array<{ name: string; schema: string[]; source: string[] }>;
}

function diffEvents(schema: ComponentEvent[], lit: ComponentEvent[]): EventDrift {
  const schemaByName = new Map(schema.map((e) => [e.name, e]));
  const litByName = new Map(lit.map((e) => [e.name, e]));

  const missingFromSchema: string[] = [];
  const removedFromSource: string[] = [];
  const detailMismatches: EventDrift['detailMismatches'] = [];

  for (const litEvent of lit) {
    const schemaEvent = schemaByName.get(litEvent.name);
    if (!schemaEvent) {
      missingFromSchema.push(litEvent.name);
      continue;
    }
    // Skip detail-key comparison when the source dispatches with a
    // variable / spread — we can't know the shape statically.
    if (litEvent.detailUnknown) continue;
    // Detail-key drift only flags when source dispatches a key that
    // the schema doesn't document. The reverse (schema declares a key
    // that source never dispatches) is checked below in case it's a
    // typo on the schema side.
    const litKeys = new Set(litEvent.detailKeys);
    const schemaKeys = new Set(schemaEvent.detailKeys);
    const sourceOnly = [...litKeys].filter((k) => !schemaKeys.has(k));
    const schemaOnly = [...schemaKeys].filter((k) => !litKeys.has(k));
    if (sourceOnly.length > 0 || schemaOnly.length > 0) {
      detailMismatches.push({
        name: litEvent.name,
        schema: schemaEvent.detailKeys,
        source: litEvent.detailKeys,
      });
    }
  }

  for (const schemaEvent of schema) {
    if (litByName.has(schemaEvent.name)) continue;
    // The base class fires these through _handleInput/_handleChange
    // helpers — subclasses that delegate don't dispatch explicitly.
    if (BASE_DISPATCHED_EVENTS.has(schemaEvent.name)) continue;
    removedFromSource.push(schemaEvent.name);
  }

  return { missingFromSchema, removedFromSource, detailMismatches };
}

interface PlatformDrift {
  platform: 'ios' | 'android' | 'drupal';
  /** Schema-declared props missing from this platform's source */
  missing: string[];
  /** Schema-declared props whose type differs from what the platform declares */
  typeMismatches?: Array<{ name: string; expected: string; got: string }>;
}

/**
 * For each schema prop that resolves to a native prop, check that the
 * native type's category is one of the categories satisfying the schema
 * type. Built-in scalar mismatches (Bool ↔ String) are flagged; custom
 * PascalCase types are accepted for string / enum schema props (variants
 * commonly map to native enums) and array schema props (typed arrays of
 * struct types).
 */
function collectNativeTypeMismatches(
  schemaProps: SchemaProp[],
  resolveName: (propName: string) => string | undefined,
  nativeByName: Map<string, NativeProp>,
): Array<{ name: string; expected: string; got: string }> {
  const mismatches: Array<{ name: string; expected: string; got: string }> = [];
  for (const sp of schemaProps) {
    const nativeName = resolveName(sp.name);
    if (!nativeName) continue;
    const nativeProp = nativeByName.get(nativeName);
    if (!nativeProp) continue;
    const nativeCategory = categorizeNativeType(nativeProp.type);
    if (nativeCategory === 'callback') continue; // Lambda params aren't schema props
    const expected = expectedNativeCategories(sp.type);
    if (!expected.includes(nativeCategory)) {
      mismatches.push({
        name: sp.name,
        expected: `${sp.type} (one of: ${expected.join(', ')})`,
        got: `${nativeProp.type} (${nativeCategory})`,
      });
    }
  }
  return mismatches;
}

function checkPlatformParity(
  /** Schema props in cross-platform-applicable form. Includes name + canonical schema type so platform diffs can flag both shape and naming drift. */
  schemaProps: SchemaProp[],
  spec: ComponentSpec,
  /** Map from schema prop name → schema's `attribute` override, when set. */
  schemaAttributes: Map<string, string> = new Map(),
): PlatformDrift[] {
  const schemaPropNames = schemaProps.map((p) => p.name);
  const drifts: PlatformDrift[] = [];

  if (spec.ios) {
    const path = join(ROOT, spec.ios);
    if (existsSync(path)) {
      const iosProps = parseSwiftProps(path);
      const iosByName = new Map(iosProps.map((p) => [p.name, p]));
      const iosNames = new Set(iosProps.map((p) => p.name));
      function resolveIosName(propName: string): string | undefined {
        const alts = iosPropAlternatives(propName);
        return alts.find((alt) => iosNames.has(alt));
      }
      const missing = schemaPropNames.filter((p) => !resolveIosName(p));
      const typeMismatches = collectNativeTypeMismatches(schemaProps, resolveIosName, iosByName);
      if (missing.length > 0 || typeMismatches.length > 0) {
        drifts.push({ platform: 'ios', missing, typeMismatches: typeMismatches.length > 0 ? typeMismatches : undefined });
      }
    }
  }

  if (spec.android) {
    const path = join(ROOT, spec.android);
    if (existsSync(path)) {
      // Android function name follows the iOS struct name (CivXxx) per the
      // codegen scaffold output. Derive it from the kebab-case schema name.
      const display = 'Civ' + spec.name
        .replace(/^civ-/, '')
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join('');
      const androidProps = parseKotlinProps(path, display);
      const androidByName = new Map(androidProps.map((p) => [p.name, p]));
      const androidNames = new Set(androidProps.map((p) => p.name));
      function resolveAndroidName(propName: string): string | undefined {
        const alts = androidPropAlternatives(propName);
        return alts.find((alt) => androidNames.has(alt));
      }
      const missing = schemaPropNames.filter((p) => !resolveAndroidName(p));
      const typeMismatches = collectNativeTypeMismatches(schemaProps, resolveAndroidName, androidByName);
      if (missing.length > 0 || typeMismatches.length > 0) {
        drifts.push({ platform: 'android', missing, typeMismatches: typeMismatches.length > 0 ? typeMismatches : undefined });
      }
    }
  }

  if (spec.drupal) {
    const path = join(ROOT, spec.drupal);
    if (existsSync(path)) {
      const drupalProps = parseDrupalProps(path);
      const drupalByName = new Map(drupalProps.map((p) => [p.name, p]));
      const drupalNames = new Set(drupalProps.map((p) => p.name));
      // Drupal SDCs mirror the Lit HTML attribute (with `-` → `_`). When
      // the schema declares `attribute: 'foo-bar'`, that's the source of
      // truth — `validateType` with attribute `validate` lives in Drupal
      // as `validate`, not `validate_type`.
      function resolveDrupalKey(propName: string): string | undefined {
        const candidates = [propName, camelToSnake(propName)];
        const attr = schemaAttributes.get(propName);
        if (attr) candidates.push(attr.replace(/-/g, '_'));
        return candidates.find((c) => drupalNames.has(c));
      }
      const missing = schemaPropNames.filter((p) => !resolveDrupalKey(p));
      const typeMismatches: NonNullable<PlatformDrift['typeMismatches']> = [];
      for (const sp of schemaProps) {
        const drupalKey = resolveDrupalKey(sp.name);
        if (!drupalKey) continue;
        const drupalProp = drupalByName.get(drupalKey);
        if (!drupalProp || drupalProp.type === undefined) continue;
        const expected = expectedDrupalType(sp.type);
        if (drupalProp.type !== expected) {
          typeMismatches.push({ name: sp.name, expected, got: drupalProp.type });
        }
      }
      if (missing.length > 0 || typeMismatches.length > 0) {
        drifts.push({ platform: 'drupal', missing, typeMismatches: typeMismatches.length > 0 ? typeMismatches : undefined });
      }
    }
  }

  return drifts;
}

// ---------------------------------------------------------------------------
// Structured report shape (consumed by --json output and AI agents)
// ---------------------------------------------------------------------------

interface DriftItem {
  /** Stable identifier for the kind of drift — useful for routing fixes */
  kind:
    | 'missing-source-file'
    | 'missing-schema-file'
    | 'prop-missing-from-schema'
    | 'prop-removed-from-source'
    | 'prop-mismatch'
    | 'event-missing-from-schema'
    | 'event-removed-from-source'
    | 'event-detail-mismatch'
    | 'platform-prop-missing'
    | 'platform-type-mismatch';
  message: string;
  /** Optional concrete-fix suggestion (set when --explain is passed) */
  fix?: string;
  /** Optional contextual data — prop name, platform, types, etc. */
  data?: Record<string, unknown>;
}

interface ComponentReport {
  name: string;
  status: 'in-sync' | 'drift';
  drift: DriftItem[];
  /** Counts for human-readable summary */
  propCount: number;
  eventCount: number;
}

interface DriftReport {
  components: ComponentReport[];
  summary: {
    total: number;
    inSync: number;
    litDriftCount: number;
    platformDriftCount: number;
  };
}

function fixForKind(item: Omit<DriftItem, 'fix'>, componentName: string): string {
  const d = item.data ?? {};
  switch (item.kind) {
    case 'prop-missing-from-schema':
      return `Add a prop to packages/schema/src/components/${componentName}.schema.ts: \`${d.prop}: { type: '...', description: '...', default: '...' }\` — match the Lit @property declaration.`;
    case 'prop-removed-from-source':
      return `Remove \`${d.prop}\` from the schema, OR re-add it to the Lit source if its removal was unintended.`;
    case 'prop-mismatch':
      return `Reconcile \`${d.prop}.${d.field}\`: schema=${JSON.stringify(d.schemaValue)}, source=${JSON.stringify(d.sourceValue)}. Update whichever is wrong.`;
    case 'event-missing-from-schema':
      return `Add \`${d.event}\` to the schema's \`events\` map with the dispatched detail keys, OR remove the dispatch call.`;
    case 'event-removed-from-source':
      return `Remove \`${d.event}\` from the schema's \`events\` map (or restore the dispatch call in the Lit source).`;
    case 'event-detail-mismatch':
      return `\`${d.event}\` detail keys diverge — schema declares ${JSON.stringify(d.schemaKeys)}, source dispatches ${JSON.stringify(d.sourceKeys)}. Update one to match.`;
    case 'platform-prop-missing': {
      const platform = d.platform as string;
      const prop = d.prop as string;
      if (platform === 'drupal') return `Run \`pnpm sync:drupal\` to auto-add \`${prop}\` to the SDC YAML — the regenerator pulls from the schema.`;
      return `Either (1) add \`${prop}\` to the ${platform} source (matching the schema's type), OR (2) mark the prop \`webOnly: true\` in the schema if it's a web-specific concept (HTML attribute, JS-only callback, Tailwind sizing). See AGENTS.md for the decision tree.`;
    }
    case 'platform-type-mismatch': {
      const platform = d.platform as string;
      const expected = d.expected as string;
      if (platform === 'drupal') return `Edit packages/drupal/civui/components/${componentName.replace(/^civ-/, '')}/${componentName.replace(/^civ-/, '')}.component.yml — change \`type:\` of \`${d.prop}\` to match schema (expected ${expected}).`;
      return `Either fix the ${platform} type for \`${d.prop}\` to match the schema (categorized as ${expected}), OR mark the prop \`webOnly: true\` in the schema if the wire format genuinely differs per platform.`;
    }
    case 'missing-source-file':
      return `The Lit source file ${d.path} doesn't exist. Either create it or remove the COVERED_COMPONENTS entry.`;
    case 'missing-schema-file':
      return `Create a schema at ${d.path}. Use \`pnpm scaffold:component ${componentName}\` to bootstrap.`;
    default:
      return '';
  }
}

async function buildReport(strict: boolean, explain: boolean): Promise<DriftReport> {
  const components: ComponentReport[] = [];

  for (const spec of COVERED_COMPONENTS) {
    const drift: DriftItem[] = [];
    const sourcePath = join(ROOT, spec.source);
    if (!existsSync(sourcePath)) {
      drift.push({ kind: 'missing-source-file', message: `source file not found: ${spec.source}`, data: { path: spec.source } });
      components.push({ name: spec.name, status: 'drift', drift, propCount: 0, eventCount: 0 });
      continue;
    }
    const schemaPath = join(ROOT, 'packages/schema/src/components', `${spec.name}.schema.ts`);
    if (!existsSync(schemaPath)) {
      const item: DriftItem = { kind: 'missing-schema-file', message: `no schema at ${schemaPath}`, data: { path: schemaPath } };
      const status = strict ? 'drift' : 'in-sync'; // matches old behavior: warning unless --strict
      if (status === 'drift') drift.push(item);
      components.push({ name: spec.name, status, drift, propCount: 0, eventCount: 0 });
      continue;
    }
    const schema = await loadSchema(spec.name);
    const schemaProps = schemaPropsFrom(schema, !!spec.isBoolean);
    const schemaEvents = schemaEventsFrom(schema);
    const litProps = parseLitProps(sourcePath, !!spec.isBoolean);
    const litEvents = parseLitEvents(sourcePath);
    const propResult = diffProps(schemaProps, litProps);
    const eventResult = diffEvents(schemaEvents, litEvents);

    for (const prop of propResult.missingFromSchema) {
      drift.push({ kind: 'prop-missing-from-schema', message: `prop in source but missing from schema: ${prop}`, data: { prop } });
    }
    for (const prop of propResult.removedFromSource) {
      drift.push({ kind: 'prop-removed-from-source', message: `prop in schema but no longer in source: ${prop}`, data: { prop } });
    }
    for (const m of propResult.mismatched) {
      drift.push({ kind: 'prop-mismatch', message: `${m.name}.${m.field} differs: schema=${JSON.stringify(m.schema)}, source=${JSON.stringify(m.source)}`, data: { prop: m.name, field: m.field, schemaValue: m.schema, sourceValue: m.source } });
    }
    for (const event of eventResult.missingFromSchema) {
      drift.push({ kind: 'event-missing-from-schema', message: `event fired in source but missing from schema: ${event}`, data: { event } });
    }
    for (const event of eventResult.removedFromSource) {
      drift.push({ kind: 'event-removed-from-source', message: `event declared in schema but never dispatched: ${event}`, data: { event } });
    }
    for (const m of eventResult.detailMismatches) {
      drift.push({ kind: 'event-detail-mismatch', message: `${m.name} detail keys differ: schema=${JSON.stringify(m.schema)}, source=${JSON.stringify(m.source)}`, data: { event: m.name, schemaKeys: m.schema, sourceKeys: m.source } });
    }

    const crossPlatformProps = schemaProps.filter((p) => !p.webOnly);
    const schemaAttributes = new Map<string, string>();
    for (const p of crossPlatformProps) {
      if (p.attribute) schemaAttributes.set(p.name, p.attribute);
    }
    const platformDrifts = checkPlatformParity(crossPlatformProps, spec, schemaAttributes);
    for (const pd of platformDrifts) {
      for (const prop of pd.missing) {
        drift.push({ kind: 'platform-prop-missing', message: `${pd.platform}: missing schema prop ${prop}`, data: { platform: pd.platform, prop } });
      }
      if (pd.typeMismatches) {
        for (const tm of pd.typeMismatches) {
          drift.push({ kind: 'platform-type-mismatch', message: `${pd.platform}: ${tm.name} type mismatch — schema expects ${tm.expected}, ${pd.platform} declares ${tm.got}`, data: { platform: pd.platform, prop: tm.name, expected: tm.expected, got: tm.got } });
        }
      }
    }

    if (explain) {
      for (const item of drift) {
        item.fix = fixForKind(item, spec.name);
      }
    }

    components.push({
      name: spec.name,
      status: drift.length > 0 ? 'drift' : 'in-sync',
      drift,
      propCount: litProps.length,
      eventCount: litEvents.length,
    });
  }

  let litDriftCount = 0;
  let platformDriftCount = 0;
  for (const c of components) {
    const hasLitDrift = c.drift.some((d) => !d.kind.startsWith('platform-'));
    const hasPlatformDrift = c.drift.some((d) => d.kind.startsWith('platform-'));
    if (hasLitDrift) litDriftCount++;
    if (hasPlatformDrift) platformDriftCount++;
  }
  return {
    components,
    summary: {
      total: COVERED_COMPONENTS.length,
      inSync: components.filter((c) => c.status === 'in-sync').length,
      litDriftCount,
      platformDriftCount,
    },
  };
}

function renderTextReport(report: DriftReport, enforcePlatforms: boolean, explain: boolean): boolean {
  let exitFailure = false;
  for (const c of report.components) {
    if (c.status === 'in-sync' && c.drift.length === 0) {
      console.log(`✓  ${c.name} (${c.propCount} props, ${c.eventCount} events in sync across all platforms)`);
      continue;
    }
    const hasLitDrift = c.drift.some((d) => !d.kind.startsWith('platform-'));
    console.log(`${hasLitDrift ? '✗' : '⚠'}  ${c.name}`);
    for (const item of c.drift) {
      console.log(`   ${item.message}`);
      if (explain && item.fix) console.log(`     → fix: ${item.fix}`);
    }
  }
  const { litDriftCount, platformDriftCount } = report.summary;
  if (litDriftCount > 0 || (enforcePlatforms && platformDriftCount > 0)) {
    if (litDriftCount > 0) console.log(`\n${litDriftCount} component(s) have Lit ↔ schema drift.`);
    if (platformDriftCount > 0) {
      const verb = enforcePlatforms ? 'have' : 'have informational';
      console.log(`${platformDriftCount} component(s) ${verb} platform parity gaps (run with --platforms to fail the build).`);
    }
    exitFailure = true;
  } else {
    console.log(`\n${report.summary.total}/${report.summary.total} components match their schema.`);
  }
  return exitFailure;
}

async function main(): Promise<void> {
  const strict = process.argv.includes('--strict');
  // Platforms check is opt-in (informational by default). When --platforms
  // is passed, drift on ios/android/drupal also fails the build.
  const enforcePlatforms = process.argv.includes('--platforms');
  // --json: emit a structured DriftReport for tooling / AI agent consumption.
  // --explain: include a concrete `fix` suggestion on every drift item.
  const json = process.argv.includes('--json');
  const explain = process.argv.includes('--explain');

  const report = await buildReport(strict, explain || json);

  if (json) {
    console.log(JSON.stringify(report, null, 2));
    const platformFailure = enforcePlatforms && report.summary.platformDriftCount > 0;
    if (report.summary.litDriftCount > 0 || platformFailure) process.exit(1);
    return;
  }

  const failure = renderTextReport(report, enforcePlatforms, explain);
  if (failure) process.exit(1);
}

if (isCliInvocation()) {
  main().catch((err) => {
    console.error(err);
    process.exit(2);
  });
}
