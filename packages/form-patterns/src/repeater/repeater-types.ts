/** Arbitrary row object held by the host in route mode. The repeater never mutates it. */
export type RepeaterRow = Record<string, unknown>;

/** Function that turns a row into the visible summary text on its card. */
export type RepeaterRowSummary = (row: RepeaterRow, index: number) => string;

/** Repeater display mode. */
export type RepeaterMode = 'inline' | 'form-steps' | 'route';
