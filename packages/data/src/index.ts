// Side-effect imports ensure custom elements are registered.
import './pagination/civ-pagination.js';
import './data-grid/civ-data-grid.js';
import './toolbar/civ-toolbar.js';
import './bulk-actions/civ-bulk-actions.js';
import './filterable-list/civ-filterable-list.js';
import './column-visibility/civ-column-visibility.js';
import './metric-tile/civ-metric-tile.js';
import './metric-group/civ-metric-group.js';
import './itemized-total/civ-itemized-total.js';
import './itemized-total/civ-itemized-item.js';

// Pagination
export { CivPagination } from './pagination/index.js';

// Data Grid
export { CivDataGrid } from './data-grid/index.js';
export type {
  GridColumn,
  GridRow,
  GridRowAction,
  GridSortDirection,
  GridResponsiveMode,
  GridSelectionMode,
  GridCellAlign,
} from './data-grid/index.js';

// Toolbar
export { CivToolbar } from './toolbar/index.js';

// Bulk Actions
export { CivBulkActions } from './bulk-actions/index.js';

// Filterable List
export { CivFilterableList } from './filterable-list/index.js';

// Column Visibility
export { CivColumnVisibility } from './column-visibility/index.js';

// Metric Tile
export { CivMetricTile } from './metric-tile/index.js';
export type { MetricTrend, MetricIntent } from './metric-tile/index.js';

// Metric Group
export { CivMetricGroup } from './metric-group/index.js';

// Itemized Total
export { CivItemizedTotal, CivItemizedItem } from './itemized-total/index.js';
export type { ItemizedIntent } from './itemized-total/index.js';

// Export utility (no custom element — pure function)
export { gridExport } from './export/index.js';
export type { GridExportOptions } from './export/index.js';
