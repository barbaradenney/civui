import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/architecture',
        'getting-started/design-principles',
      ],
    },
    {
      type: 'category',
      label: 'Components',
      items: [
        'components/layout',
        'components/navigation',
        'components/actions',
        'components/feedback',
        'components/form-inputs',
        'components/form-patterns',
        'components/compound',
      ],
    },
    {
      type: 'category',
      label: 'MCP Server',
      items: [
        'mcp-server/overview',
        'mcp-server/tools',
        'mcp-server/workflows',
        'mcp-server/form-architecture',
        'mcp-server/va-forms',
        'mcp-server/schema-reference',
      ],
    },
  ],
};

export default sidebars;
