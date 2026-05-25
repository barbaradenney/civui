/**
 * iOS stub allowlist.
 *
 * These iOS components intentionally have an empty SwiftUI body
 * (`public var body: some View { EmptyView() }`). The schema-driven
 * prop surface keeps the cross-platform parity contract satisfied,
 * but the actual native UI implementation is deferred — see
 * `.claude/rules/audit-debt.md` ("Native platform implementation pass").
 *
 * Why this list exists: an AI agent (or eager contributor) could
 * "complete" an EmptyView body with code that compiles and passes
 * schema-parity, but ships untested SwiftUI to production. Modal
 * presentation, focus traps, keyboard insets, and scrim behaviour
 * have device-specific quirks an LLM cannot test blind. Removing an
 * entry from this list requires a human PR — that's intentional
 * friction.
 *
 * To add a new stub: scaffold the component, leave the body as
 * `EmptyView()`, and add its filename here.
 *
 * To remove a stub (i.e. you've genuinely implemented it on device):
 * implement the real SwiftUI body, run on simulator + a physical
 * device, then remove the entry from this list in the same PR.
 *
 * If you add an EmptyView body without registering here, the
 * `lint:ios-stub-allowlist` CI gate will fail with instructions.
 */
export const IOS_STUB_ALLOWLIST: ReadonlySet<string> = new Set([
  'CivAccordion.swift',
  'CivAccordionItem.swift',
  'CivActionChip.swift',
  'CivActionSheet.swift',
  'CivBackToTop.swift',
  'CivBadge.swift',
  'CivBreadcrumb.swift',
  'CivBreadcrumbItem.swift',
  'CivBulkActions.swift',
  'CivCallout.swift',
  'CivColumnVisibility.swift',
  'CivConfirmButton.swift',
  'CivCount.swift',
  'CivCountry.swift',
  'CivDataGrid.swift',
  'CivDateRangePicker.swift',
  'CivDisclosure.swift',
  'CivDrawer.swift',
  'CivFilterChip.swift',
  'CivFilterChipGroup.swift',
  'CivFormAutosave.swift',
  'CivImage.swift',
  'CivImagePreview.swift',
  'CivIncome.swift',
  'CivInputChip.swift',
  'CivInputGroup.swift',
  'CivItemizedItem.swift',
  'CivItemizedTotal.swift',
  'CivMenu.swift',
  'CivMenuItem.swift',
  'CivMetricGroup.swift',
  'CivMetricTile.swift',
  'CivModal.swift',
  'CivNav.swift',
  'CivNavItem.swift',
  'CivNotice.swift',
  'CivNumber.swift',
  'CivOnThisPage.swift',
  'CivOnThisPageItem.swift',
  'CivPagination.swift',
  'CivPartnershipHistory.swift',
  'CivPopover.swift',
  'CivProcessList.swift',
  'CivProcessListItem.swift',
  'CivReadMore.swift',
  'CivRelationship.swift',
  'CivServiceHistory.swift',
  'CivSideNav.swift',
  'CivSideNavItem.swift',
  'CivSkeleton.swift',
  'CivSpinner.swift',
  'CivTab.swift',
  'CivTabNav.swift',
  'CivTabNavItem.swift',
  'CivTabPanel.swift',
  'CivTabs.swift',
  'CivTimePicker.swift',
  'CivTimeline.swift',
  'CivTimelineItem.swift',
  'CivToggleButton.swift',
  'CivToolbar.swift',
]);
