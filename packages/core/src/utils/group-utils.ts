/**
 * Sync disabled state from a group to its children, preserving
 * individually-disabled children via a WeakSet.
 * Returns the updated WeakSet for the next call.
 */
export function syncGroupDisabled<T extends Element & { disabled: boolean }>(
  children: T[],
  groupDisabled: boolean,
  previouslyEnabled: WeakSet<Element>,
): WeakSet<Element> {
  if (groupDisabled) {
    children.forEach((child) => {
      if (!child.disabled) previouslyEnabled.add(child);
      child.disabled = true;
    });
    return previouslyEnabled;
  } else {
    children.forEach((child) => {
      if (previouslyEnabled.has(child)) {
        child.disabled = false;
      }
    });
    return new WeakSet();
  }
}

/**
 * Event handler that stops child events from bubbling past the group.
 * Use as: `this.addEventListener('civ-input', stopChildEvent(this))`
 */
export function stopChildEvent(host: EventTarget): (e: Event) => void {
  return (e: Event) => {
    if (e.target !== host) e.stopPropagation();
  };
}

/**
 * Sync legend property to label in willUpdate. Call from willUpdate()
 * in group components that use legend instead of label.
 */
export function syncLegendToLabel(component: { label: string; legend: string }, changed: Map<string, unknown>): void {
  if (changed.has('legend')) {
    component.label = component.legend;
  }
}
