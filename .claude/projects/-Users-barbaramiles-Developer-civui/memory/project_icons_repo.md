---
name: Icons repo extraction
description: Plan to extract icon library and builder tool into a separate @civui/icons repo
type: project
---

Extract the icon library (icon definitions + builder tool) into a separate `@civui/icons` repo.

**Why:** Allow other projects (React, vanilla JS, native apps) to consume icon definitions without pulling in Lit. Makes the icon builder a first-class hosted tool.

**How to apply:**
- New repo with icon data (JSON format, no Lit dependency) + builder tool (`tools/icon-builder.html`)
- Publish as `@civui/icons` package
- `civ-icon.ts` stays in `@civui/core` as the renderer, importing from the new package
- Builder tool can be hosted standalone (e.g., `icons.civui.dev`)
- Current files: `packages/core/src/icon/icon-library.ts`, `packages/core/src/icon/civ-icon.ts`, `tools/icon-builder.html`
