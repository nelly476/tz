import { items } from '../data/items.js';
import { normalizeSearch } from '../lib/utils.js';

const sessionStore = {
  data: [...items],
};


function getPaginatedData(offset, limit, search) {
  if (search) {
    const q = normalizeSearch(search)
    return sessionStore.data.filter(item => item.name.includes(q)).slice(offset, offset + limit)
  }

  return sessionStore.data
    .slice(offset, offset + limit)
}

export const getItems = (req, res) => {
  let {offset, limit, search} = req.query
  offset = Number(offset)
  limit = Number(limit)

  if (!Number.isFinite(offset) || offset < 0) offset = 0;
  if (!Number.isFinite(limit)  || limit <= 0) limit = 20;

  let paginated = getPaginatedData(offset, limit, search)

  res.status(200).json(paginated)
  
}


export const updateSelection = (req, res) => {
  const { id } = req.body ?? {};
  if (!id) return res.status(400).json({ error: 'id is required' });

  const targetIndex = sessionStore.data.findIndex(item => item.id === id)
  if (targetIndex === -1) return res.status(404).json({ error: 'Item not found', id });

  const targeItem = sessionStore.data[targetIndex]
  sessionStore.data[targetIndex] = {...targeItem, isSelected: !targeItem.isSelected}

  res.status(200).json({item: sessionStore.data[targetIndex], id})
  }

export const updateSorting = (req, res) =>  {
    const { activeId, overId } = req.body ?? {};
  if (!activeId || !overId) {
    return res.status(400).json({ error: 'activeId and overId are required' });
  }

  const fromIndex = sessionStore.data.findIndex(item => item.id === activeId)
  const toIndex = sessionStore.data.findIndex(item => item.id === overId)

    if (fromIndex === -1 || toIndex === -1) {
    return res.status(404).json({ error: 'Item not found', fromIndex, toIndex });
  }

  const item = sessionStore.data.splice(fromIndex, 1)[0];
  sessionStore.data.splice(toIndex, 0, item);

  res.status(200).json({message: "Reordered successfully"})
}
