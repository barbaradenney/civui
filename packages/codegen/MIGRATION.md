# Migration Guide: Hand-Written → Schema-Generated Components

This guide covers the process of migrating CivUI components from hand-written
implementations to schema-generated code.

## Strategy

The migration uses an **incremental approach** — components can be migrated one
at a time without affecting the rest of the system. The generated code is
structurally equivalent to the hand-written code for the patterns it covers.

### Migration Tiers

Components fall into three tiers based on migration complexity:

**Tier 1 — Drop-in replacement** (generated matches hand-written closely):
- `civ-text-input` — standard label → hint → error → input
- `civ-select` — label → hint → error → native select
- `civ-checkbox` — boolean control with inline label
- `civ-toggle` — switch with inline label
- `civ-fieldset` — native fieldset wrapper
- `civ-form-group` — label/hint/error wrapper
- `civ-form` — form container

**Tier 2 — Generate + augment** (generated covers structure, needs extra logic):
- `civ-textarea` — needs character count announcement debouncing
- `civ-radio-group` — needs roving tabindex keyboard navigation
- `civ-checkbox-group` — needs multi-value FormData assembly
- `civ-memorable-date` — needs three-field value assembly + date validation
- `civ-segmented-control` — needs keyboard arrow navigation

**Tier 3 — Generate scaffold only** (complex behavior beyond schema):
- `civ-combobox` — needs filtering, keyboard nav, listbox ARIA, announcements
- `civ-date-picker` — needs calendar dialog, keyboard grid nav, date math
- `civ-file-upload` — needs drag-drop, file validation, progress tracking

## Migration Steps

### 1. Verify Schema Accuracy

```bash
# Validate all schemas
pnpm --filter @civui/codegen validate

# Check structural differences
pnpm --filter @civui/codegen diff
```

### 2. Generate Fresh Output

```bash
# Generate all platforms
pnpm generate

# Or generate specific component
pnpm --filter @civui/codegen generate civ-text-input
```

### 3. Migrate a Tier 1 Component

For a simple component like `civ-fieldset`:

1. **Compare generated vs hand-written:**
   ```bash
   diff packages/forms/src/fieldset/civ-fieldset.ts \
        packages/codegen/dist/web/fieldset/civ-fieldset.generated.ts
   ```

2. **Copy generated file over hand-written:**
   ```bash
   cp packages/codegen/dist/web/fieldset/civ-fieldset.generated.ts \
      packages/forms/src/fieldset/civ-fieldset.ts
   ```

3. **Run existing tests (they should pass unchanged):**
   ```bash
   pnpm --filter @civui/inputs test -- --grep fieldset
   ```

4. **If tests pass, the migration is complete.** If not, check the diff
   output for behavioral differences that need to be added back.

### 4. Migrate a Tier 2 Component

For components with extra behavior (e.g., `civ-radio-group`):

1. **Start from the generated file** as the base.

2. **Layer in the extra behavior** from the hand-written file:
   - Keyboard navigation handlers
   - Child element management
   - Custom value assembly logic

3. **Add a `// --- Custom behavior below ---` comment** to mark where
   schema-generated code ends and custom logic begins. This helps future
   regeneration preserve the custom parts.

### 5. Keep Schemas as Source of Truth

After migration, the workflow becomes:

1. **Edit the schema** (`packages/schema/src/components/*.schema.ts`)
2. **Regenerate** (`pnpm generate`)
3. **Review diff** (`pnpm --filter @civui/codegen diff`)
4. **Merge changes** into the forms package

## Automation Opportunities

### Pre-commit Hook

Add to `.husky/pre-commit` or similar:

```bash
pnpm --filter @civui/codegen validate
```

### CI Pipeline

```yaml
- name: Validate schemas
  run: pnpm --filter @civui/codegen validate

- name: Check codegen freshness
  run: |
    pnpm generate
    pnpm --filter @civui/codegen diff
```

## Native Platform Migration

The native generators produce complete, idiomatic SwiftUI and Compose code:

- **iOS:** `packages/codegen/dist/ios/Civ*.generated.swift`
- **Android:** `packages/codegen/dist/android/Civ*.generated.kt`

These can replace the hand-written files in:
- `packages/ios/Sources/CivUI/Civ*.swift`
- `packages/android/src/main/kotlin/gov/civui/components/Civ*.kt`

The same tiered approach applies — Tier 1 components are drop-in replacements,
Tier 2/3 need additional platform-specific logic layered on top.

## FAQ

**Q: Will regeneration overwrite my custom logic?**
A: Generated files go to `packages/codegen/dist/`. They never overwrite files
in `packages/forms/src/`. You manually merge changes.

**Q: Can I add props to a schema and regenerate?**
A: Yes. Add the prop to the schema, run `pnpm generate`, and the new prop
appears in all three platform implementations.

**Q: What if I need behavior the schema can't express?**
A: Use the generated code as a starting point and add custom logic. Mark the
boundary with a comment so future regeneration can be merged cleanly.
