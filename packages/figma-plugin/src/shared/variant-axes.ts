/**
 * Derive the variant matrix for a pilot component from its CivUI schema.
 *
 * Given a schema and a list of axis prop names, produce the full
 * cartesian product of axis values. Cross-multiplied with interaction
 * states from `pilot.config.ts`, this becomes the list of variants
 * Playwright must capture and Figma must materialize.
 *
 * Used in two places:
 *   - capture pipeline (Node): drives Playwright runs
 *   - Figma plugin sandbox: re-derives variant identity from manifest
 */

import type { ComponentSchema, PropDef } from '@civui/schema/types';
import type { PilotComponent, InteractionState } from '../../pilot.config.js';

export interface VariantSpec {
  axes: Record<string, string>;
  state: InteractionState;
}

export class VariantAxisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VariantAxisError';
  }
}

/**
 * Return the list of axis values for a single prop. Enum props use
 * their `values` array. Boolean props expand to `['false', 'true']`.
 * Anything else throws — only enum/boolean props make sense as axes.
 */
export function axisValuesForProp(schema: ComponentSchema, propName: string): string[] {
  const prop: PropDef | undefined = schema.props[propName];
  if (!prop) {
    throw new VariantAxisError(`Schema ${schema.name} has no prop "${propName}"`);
  }
  if (prop.type === 'enum') {
    if (!prop.values || prop.values.length === 0) {
      throw new VariantAxisError(`Enum prop ${schema.name}.${propName} has no values`);
    }
    return prop.values.filter((v) => v !== '');
  }
  if (prop.type === 'boolean') {
    return ['false', 'true'];
  }
  throw new VariantAxisError(
    `Prop ${schema.name}.${propName} is type "${prop.type}" — only enum and boolean props can be variant axes`,
  );
}

/**
 * Full variant matrix for a pilot component: cartesian product of all
 * schema axes × interaction states. `default` state is always included
 * implicitly even if not in `states`.
 */
export function variantMatrix(schema: ComponentSchema, pilot: PilotComponent): VariantSpec[] {
  const axisValues: Array<{ name: string; values: string[] }> = pilot.schemaAxes.map((name) => ({
    name,
    values: axisValuesForProp(schema, name),
  }));

  const axisCombos: Array<Record<string, string>> = axisValues.length === 0
    ? [{}]
    : axisValues.reduce<Array<Record<string, string>>>(
        (acc, axis) => acc.flatMap((row) => axis.values.map((v) => ({ ...row, [axis.name]: v }))),
        [{}],
      );

  const states: InteractionState[] = pilot.states.length === 0 ? ['default'] : pilot.states;

  return axisCombos.flatMap((axes) => states.map((state) => ({ axes, state })));
}

/**
 * Figma variant-property string. Figma combines variants in a single
 * Component Set by reading each child's `name` as a comma-separated
 * "Prop=Value, Prop=Value" list. Order is preserved; we put schema
 * axes first, then State so it lands as the right-most axis in the
 * variants panel.
 */
export function variantName(spec: VariantSpec, hasStates: boolean): string {
  const parts: string[] = [];
  for (const [name, value] of Object.entries(spec.axes)) {
    parts.push(`${capitalize(name)}=${capitalize(value)}`);
  }
  if (hasStates) {
    parts.push(`State=${capitalize(spec.state)}`);
  }
  return parts.length > 0 ? parts.join(', ') : 'Default=Default';
}

function capitalize(s: string): string {
  if (s.length === 0) return s;
  return s[0]!.toUpperCase() + s.slice(1);
}
