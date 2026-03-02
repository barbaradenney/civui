/**
 * Workflow patterns documentation resource.
 * Registered as civui://workflow-patterns.
 */

export const WORKFLOW_PATTERNS = `# CivUI Workflow Patterns

Documentation for multi-actor workflows, delegation, feedback, and case-style forms
in government applications.

---

## 1. Multi-Actor Government Forms

Government forms often pass between multiple people over weeks or months.
A benefits application starts with the applicant, moves to a reviewer,
and may require approval from a supervisor. Immigration petitions involve
petitioners, beneficiaries, attorneys, and adjudicators.

**When to use workflows:**
- Forms that require review or approval before processing
- Multi-step processes with handoffs between actors
- Applications that may be returned for revision
- Cases that need an audit trail of all actions taken

**Real-world examples:**
- Immigration petitions (I-130, I-485) — petitioner, attorney, USCIS adjudicator
- VA disability claims (21-526EZ) — veteran, VSO representative, rater, reviewer
- Building permits — property owner, contractor, plan reviewer, building official
- Benefits applications — applicant, caseworker, eligibility reviewer, approver

---

## 2. Actors

An actor is anyone who interacts with the form during its lifecycle.

\`\`\`json
{
  "actors": [
    { "id": "applicant", "label": "Applicant", "description": "Person submitting the form" },
    { "id": "reviewer", "label": "Reviewer", "description": "Staff member who reviews submissions" },
    { "id": "approver", "label": "Approver", "description": "Manager who makes final decision" }
  ]
}
\`\`\`

**Common actor IDs:**
- \`applicant\` — person filling out the form
- \`representative\` — attorney or authorized rep filling on behalf of applicant
- \`reviewer\` — first-level review staff
- \`approver\` — final decision-maker
- \`inspector\` — field inspector (building permits)
- \`caseworker\` — assigned case manager

---

## 3. Workflow State Machine

A workflow defines states and the transitions between them.

### Schema structure

\`\`\`json
{
  "workflow": {
    "initialState": "draft",
    "states": [
      { "id": "draft", "label": "Draft", "editableBy": ["applicant"] },
      { "id": "submitted", "label": "Submitted", "editableBy": [] },
      { "id": "under-review", "label": "Under Review", "editableBy": ["reviewer"], "allowsFeedback": true },
      { "id": "needs-revision", "label": "Needs Revision", "editableBy": ["applicant"] },
      { "id": "approved", "label": "Approved", "terminal": true },
      { "id": "denied", "label": "Denied", "terminal": true }
    ],
    "transitions": [
      { "from": "draft", "to": "submitted", "actor": "applicant", "label": "Submit for Review", "requiresAllSectionsComplete": true },
      { "from": "submitted", "to": "under-review", "actor": "reviewer", "label": "Begin Review" },
      { "from": "under-review", "to": "needs-revision", "actor": "reviewer", "label": "Request Revision", "requiresComment": true },
      { "from": "under-review", "to": "approved", "actor": "approver", "label": "Approve", "confirmationMessage": "Are you sure you want to approve this application?" },
      { "from": "under-review", "to": "denied", "actor": "approver", "label": "Deny", "requiresComment": true },
      { "from": "needs-revision", "to": "submitted", "actor": "applicant", "label": "Re-submit" }
    ]
  }
}
\`\`\`

### Common workflow patterns

**Simple (submit → approve):**
\`draft → submitted → approved/denied\`

**Review with revision loop:**
\`draft → submitted → under-review → needs-revision → re-submitted → approved/denied\`

**Multi-level review:**
\`draft → submitted → first-review → second-review → approved/denied\`

### State properties

| Property | Type | Description |
|----------|------|-------------|
| \`id\` | string | Unique state identifier |
| \`label\` | string | Human-readable name shown in UI |
| \`editableBy\` | string[] | Actor IDs who can edit fields in this state |
| \`visibleTo\` | string[] | Actor IDs who can see the form (omit for all) |
| \`allowsFeedback\` | boolean | Whether actors can leave comments |
| \`terminal\` | boolean | Final state with no outgoing transitions |

### Transition properties

| Property | Type | Description |
|----------|------|-------------|
| \`from\` | string | Source state ID |
| \`to\` | string | Target state ID |
| \`actor\` | string | Actor ID who triggers the transition |
| \`label\` | string | Button text shown in UI |
| \`requiresComment\` | boolean | Must provide reason for transition |
| \`requiresAllSectionsComplete\` | boolean | All required fields must be filled |
| \`confirmationMessage\` | string | Confirmation dialog text |

---

## 4. Section Locking

Control which sections each actor can edit in each workflow state.

### Permission resolution

1. Check \`section.visibleTo\` — if set, actor must be listed to see the section
2. Check \`state.visibleTo\` — if set, actor must be listed to see anything
3. Check \`section.editableBy\` — if set, actor must be listed to edit
4. Check \`state.editableBy\` — if set, actor must be listed to edit
5. Check \`section.phase\` — section is active only in the matching state

**Result per (state, actor, section):**
- \`editable\` — actor can see and modify the section
- \`readonly\` — actor can see but not modify the section
- \`hidden\` — actor cannot see the section

\`\`\`json
{
  "sections": [
    {
      "heading": "Personal information",
      "editableBy": ["applicant"],
      "fields": [{ "type": "text", "name": "full-name", "label": "Full name" }]
    },
    {
      "heading": "Reviewer notes",
      "editableBy": ["reviewer"],
      "visibleTo": ["reviewer", "approver"],
      "phase": "under-review",
      "fields": [{ "type": "textarea", "name": "review-notes", "label": "Notes" }]
    }
  ]
}
\`\`\`

---

## 5. Data Attributes

Generated HTML uses these data attributes for JavaScript integration:

| Attribute | Element | Values |
|-----------|---------|--------|
| \`data-civ-workflow-status\` | Status banner container | — |
| \`data-civ-workflow-state\` | Current state display | State ID |
| \`data-civ-workflow-action\` | Transition button | Target state ID |
| \`data-civ-workflow-actions\` | Button container | — |
| \`data-civ-audit-trail\` | Audit trail list | — |
| \`data-civ-section-progress\` | Progress nav | — |
| \`data-civ-feedback-panel\` | Feedback panel | Target name |
| \`data-civ-feedback-trigger\` | Toggle feedback button | Target name |
| \`data-civ-lock-state\` | Lockable container | State ID |
| \`data-civ-lock-actor\` | Lockable container | Actor ID |

---

## 6. Delegation / Representative Forms

When someone fills a form on behalf of another person (attorney, caseworker,
family member), the form needs delegation support.

### Delegation types

\`\`\`json
{
  "delegation": {
    "types": [
      { "id": "power-of-attorney", "label": "Attorney (G-28)", "requiresDocumentation": true },
      { "id": "authorized-representative", "label": "Authorized representative" },
      { "id": "caseworker", "label": "Caseworker" }
    ],
    "attestation": {
      "text": "I certify under penalty of perjury that I am authorized to represent the applicant.",
      "signatureType": "typed-signature"
    },
    "subjectLabel": "Beneficiary",
    "representativeLabel": "Attorney",
    "requiresConsentUpload": true,
    "requiresAuthorizationNumber": true
  }
}
\`\`\`

### Attestation types

| Type | Rendered as |
|------|-------------|
| \`checkbox\` | Checkbox with attestation text as label |
| \`typed-signature\` | Text input for full legal name |
| \`wet-signature\` | File upload for scanned signature |

### Section separation

The delegation tool generates:
1. **Representative information** section — name, org, contact, type-specific fields
2. **Attestation** section — certification statement + signature
3. **Consent upload** section (if configured) — document upload for authorization proof

---

## 7. Feedback / Comments

Allow reviewers to leave comments on form sections or individual fields.

\`\`\`json
{
  "feedback": {
    "granularity": "section",
    "allowAttachments": false,
    "requiresResolution": true
  }
}
\`\`\`

### Granularity

- \`section\` — one comment thread per section (default)
- \`field\` — comment threads on individual fields

### Resolution flow

When \`requiresResolution\` is true:
1. Reviewer leaves comments on sections/fields
2. Form transitions to "needs revision" state
3. Applicant must address and resolve all comments
4. Unresolved comment count shown in banner
5. Cannot re-submit until all comments resolved

---

## 8. Audit Trail

Every state transition and significant action should be recorded.

\`\`\`json
{
  "entries": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "actor": "applicant",
      "action": "submitted",
      "stateFrom": "draft",
      "stateTo": "submitted"
    },
    {
      "timestamp": "2024-01-18T14:22:00Z",
      "actor": "reviewer",
      "action": "requested revision",
      "stateFrom": "under-review",
      "stateTo": "needs-revision",
      "details": "Missing proof of income documentation"
    }
  ]
}
\`\`\`

The audit trail renders as a chronological timeline with:
- Timestamp for each entry
- Actor badge (resolved from schema actors)
- Action description
- State transition arrow (from → to)
- Optional details text

---

## 9. Section Progress

Track completion status across form sections for long multi-section forms.

The progress tracker:
- Lists all sections with completion indicators
- Calculates percentage from required fields with values
- Provides anchor links to jump to sections
- Updates dynamically as fields are filled

**Statuses:**
- \`complete\` — all required fields have values
- \`incomplete\` — some required fields have values
- \`not-started\` — no required fields have values

---

## 10. Real-World Examples

### I-130 Petition for Alien Relative

- **Actors:** petitioner, attorney, USCIS adjudicator
- **Workflow:** draft → submitted → initial-review → interview-scheduled → approved/denied
- **Delegation:** power-of-attorney (G-28 form), typed-signature attestation
- **Sections:** petitioner info (editable by petitioner), beneficiary info, relationship evidence, attorney info

### VA 21-526EZ Disability Compensation

- **Actors:** veteran, VSO representative, VA rater
- **Workflow:** draft → submitted → development → rating → decision
- **Delegation:** VSO representative (VA Form 21-22)
- **Sections:** personal info, service history, disabilities (repeatable), treatment records
- **Feedback:** section-level with resolution required

### Building Permit Application

- **Actors:** property-owner, contractor, plan-reviewer, building-official
- **Workflow:** draft → submitted → plan-review → approved → inspection → closed
- **Delegation:** contractor acts as representative for property owner
- **Sections:** property info, project scope, contractor info (delegation), plans/drawings, inspector notes (phase: inspection)

---

## 11. Anti-Patterns

- **Circular workflows** — avoid transitions that create infinite loops without terminal states
- **Too many states** — keep to 4-8 states; more indicates the process should be split
- **Missing audit trail** — every transition should be logged for accountability
- **Unbounded feedback** — always set a resolution requirement so comments get addressed
- **Editing terminal states** — never allow edits in approved/denied states
- **Hidden required fields** — if a section is hidden from an actor, don't make its fields required for that actor
- **Missing confirmation** — destructive transitions (deny, reject) should always have \`confirmationMessage\`
`;
