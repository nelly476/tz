import { items } from '../data/items.js';
import { clamp, normalizeSearch, arrayMoveInPlace } from '../../frontend/src/lib/utils.js';

const sessionStore = {
  data: [...items]
};


const getFilteredData = (search) => {
  const q = normalizeSearch(search);
  const list = sessionStore.data.slice().sort((a, b) => a.order - b.order);
  if (!q) return list;
  return list.filter(item => String(item.name).toLowerCase().includes(q));
}

export const getItems = (req, res) => {
  let { offset = 0, limit = 20, search = '' } = req.query;
  offset = Number(offset);
  limit  = Number(limit);

  if (!Number.isFinite(offset) || offset < 0) offset = 0;
  if (!Number.isFinite(limit)  || limit <= 0) limit = 20;

  const filtered = getFilteredData(search);
  const total = filtered.length;

  const safeOffset = clamp(offset, 0, Math.max(0, total - 1));
  const slice = filtered.slice(safeOffset, safeOffset + limit);

  res.json({
    data: slice,
    total,
    offset: safeOffset,
    limit,
    hasMore: safeOffset + slice.length < total,
  });
};

export const updateSelection = (req, res) => {
  const { id } = req.body ?? {};
  if (!id) return res.status(400).json({ error: 'id is required' });

  const idx = sessionStore.data.findIndex(it => it.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Item not found', id });

  const curr = sessionStore.data[idx];
  const next = { ...curr, isSelected: !curr.isSelected };
  sessionStore.data[idx] = next;

  res.json(next);
};

export const updateSorting = (req, res) => {
  const { activeId, overId } = req.body ?? {};
  if (!activeId || !overId) {
    return res.status(400).json({ error: 'activeId and overId are required' });
  }
  if (activeId === overId) {
    const data = sessionStore.data.slice().sort((a, b) => a.order - b.order);
    return res.json({ data, changes: [] });
  }

  const arr = sessionStore.data.slice().sort((a, b) => a.order - b.order);

  const fromIndex = arr.findIndex(x => x.id === activeId);
  const toIndex   = arr.findIndex(x => x.id === overId);

  if (fromIndex === -1 || toIndex === -1) {
    return res.status(404).json({ error: 'Item not found', fromIndex, toIndex });
  }

  arrayMoveInPlace(arr, fromIndex, toIndex);
  const start = Math.min(fromIndex, toIndex);
  const end   = Math.max(fromIndex, toIndex);

  const changes = [];
  for (let i = start; i <= end; i++) {
    if (arr[i].order !== i) {
      arr[i] = { ...arr[i], order: i };
      changes.push({ id: arr[i].id, order: i });
    }
  }

  const byId = new Map(arr.map(it => [it.id, it]));
  sessionStore.data = sessionStore.data.map(it => byId.get(it.id) ?? it);

  res.json({
    changes,
    // data: arr,
  });
};
