/**
 * Plugin UI runtime. Lives inside Figma's UI iframe and communicates
 * with `src/code.ts` via `parent.postMessage`. Renders the component
 * picker and forwards user actions to the sandbox.
 */

interface ComponentRow {
  name: string;
  displayName: string;
  variantCount: number;
}

interface PluginMessage {
  type: 'components' | 'progress' | 'done' | 'error';
  components?: ComponentRow[];
  component?: string;
  done?: number;
  total?: number;
  createdSets?: number;
  createdVariants?: number;
  message?: string;
}

const $ = (id: string) => document.getElementById(id);
const listEl = $('list') as HTMLDivElement;
const emptyEl = $('empty') as HTMLDivElement;
const statusEl = $('status') as HTMLDivElement;
const syncBtn = $('sync') as HTMLButtonElement;
const cancelBtn = $('cancel') as HTMLButtonElement;
const selected = new Set<string>();

function renderList(rows: ComponentRow[]): void {
  if (rows.length === 0) {
    emptyEl.textContent = 'No components in manifest. Run `pnpm --filter @civui/figma-plugin capture` first.';
    return;
  }
  emptyEl.remove();
  listEl.innerHTML = '';
  for (const row of rows) {
    const label = document.createElement('label');
    label.className = 'row';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = true;
    selected.add(row.name);
    cb.addEventListener('change', () => {
      if (cb.checked) selected.add(row.name);
      else selected.delete(row.name);
      syncBtn.disabled = selected.size === 0;
    });
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = row.displayName;
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = `${row.variantCount} variants`;
    label.append(cb, name, count);
    listEl.appendChild(label);
  }
  syncBtn.disabled = selected.size === 0;
}

function setStatus(text: string): void {
  statusEl.textContent = text;
}

function send(msg: unknown): void {
  parent.postMessage({ pluginMessage: msg }, '*');
}

syncBtn.addEventListener('click', () => {
  syncBtn.disabled = true;
  setStatus('Syncing…');
  send({ type: 'sync', components: Array.from(selected) });
});

cancelBtn.addEventListener('click', () => send({ type: 'cancel' }));

window.addEventListener('message', (event: MessageEvent<{ pluginMessage: PluginMessage }>) => {
  const msg = event.data.pluginMessage;
  if (!msg) return;
  if (msg.type === 'components' && msg.components) {
    renderList(msg.components);
  } else if (msg.type === 'progress' && msg.component) {
    setStatus(`${msg.component}: ${msg.done}/${msg.total}`);
  } else if (msg.type === 'done') {
    setStatus(`Done — ${msg.createdSets} set${msg.createdSets === 1 ? '' : 's'} (${msg.createdVariants} variants)`);
    syncBtn.disabled = false;
  } else if (msg.type === 'error') {
    setStatus(`Error: ${msg.message}`);
    syncBtn.disabled = false;
  }
});

// Ask the sandbox for the component list on load.
send({ type: 'list-components' });
