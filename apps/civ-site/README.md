# CivUI Forms — VA Form Testing

Self-contained VA form prototypes built with [CivUI](https://github.com/barbaradenney/civui) web components.

## Forms

20 VA forms generated from the CivUI MCP server form registry. Each form is a single HTML file with:

- Intro page with process list and preparation checklist
- Task list hub with progress tracking
- Chapter pages with form fields
- Review page with summary and signature
- Confirmation page

## Quick Start

Open `index.html` in a browser, or serve locally:

```bash
npx serve .
```

## Regenerating Forms

Forms are generated using the CivUI MCP server:

```bash
cd ../civui/packages/mcp-server
node -e "
const { assembleGovForm } = require('./dist/tools/assemble-gov-form.js');
assembleGovForm('21-526EZ', { format: 'html', preview: true }).then(r => console.log(r.previewPath));
"
```

## Moving to React

When ready to migrate to a React app, regenerate with `format: 'react'`:

```bash
assembleGovForm('21-526EZ', { format: 'react' })
```

This produces TSX components with proper event wiring for CivUI web components.
