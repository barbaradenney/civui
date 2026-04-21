---
title: Overview
sidebar_position: 1
sidebar_label: Overview
---

# CivUI MCP Server

The CivUI MCP (Model Context Protocol) server exposes the full power of the CivUI design system to AI tools. It provides 80 tools that let LLMs generate, validate, and transform accessible government forms using CivUI web components.

## What It Does

The MCP server acts as a bridge between AI assistants and the CivUI component library. It enables:

- **Form generation** from schemas, PDFs, or existing HTML
- **VA.gov form assembly** from 20 pre-built form definitions
- **Accessibility validation** against Section 508 and WCAG 2.1 AA
- **Test generation** (unit, e2e, a11y, Storybook stories)
- **Content checking** (plain language, reading level, i18n extraction)
- **Workflow UI generation** (multi-actor review, delegation, audit trails)

## The 3-Tier System

Tools are organized into three tiers to manage context window usage:

| Tier | Count | When Registered | Purpose |
|------|-------|-----------------|---------|
| **Essential** | 13 | Always | Core tools every LLM needs — form generation, parsing, validation |
| **Advanced** | ~25 | Standard + All modes | Feature generators, workflow tools, advanced validation |
| **Internal** | ~42 | All mode only | Composed by other tools; hidden from direct LLM use |

Control the tier with the `CIV_MCP_TIER` environment variable:

| Value | Tools Available |
|-------|---------------|
| `essential` | ~13 essential tools only |
| `standard` | Essential + advanced (~38 tools) |
| `all` (default) | All 80 tools |

## Setup

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "civui": {
      "command": "npx",
      "args": ["@civui/mcp-server"],
      "env": {
        "CIV_MCP_TIER": "standard"
      }
    }
  }
}
```

### Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "civui": {
      "command": "npx",
      "args": ["@civui/mcp-server"],
      "env": {
        "CIV_MCP_TIER": "all"
      }
    }
  }
}
```

### Local Development

If you have the monorepo checked out:

```json
{
  "mcpServers": {
    "civui": {
      "command": "node",
      "args": ["./packages/mcp-server/dist/index.js"],
      "env": {
        "CIV_MCP_TIER": "all"
      }
    }
  }
}
```

## MCP Resources

The server also exposes read-only resources for reference:

| Resource URI | Description |
|-------------|-------------|
| `civui://catalog` | Full component catalog with props, events, HTML examples |
| `civui://schema-reference` | Complete FormSchema specification |
| `civui://gov-patterns` | Government design patterns (Section 508, plain language) |
| `civui://templates` | Pre-built form templates |
| `civui://decision-tree` | Which component to use when |
| `civui://tailwind` | CivUI Tailwind classes and design tokens |

## Quick Example

Generate a complete VA disability form in one call:

```
assemble_gov_form({ formNumber: "21-526EZ", format: "html" })
```

Or convert an existing PDF:

```
parse_pdf_form({ pdf: "<base64>" })  →  FormSchema
generate_civui_form({ schema })      →  Accessible HTML
validate_form({ html })              →  508 compliance check
```
