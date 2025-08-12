
import { items } from '../data/items.js';

// В памяти: хранение состояний по sessionId
const sessionStore = {
  data: [],
  selectedIds: [],
};

export const getFilteredSortedItems = (sessionId, search = '', offset = 0, limit = 20) => {
  const session = sessionStore[sessionId] || {
    selectedIds: [],
    sortedIds: [],
  };

  let result = [...allItems];

  // Поиск
  if (search) {
    const lower = search.toLowerCase();
    result = result.filter(item => item.name.toLowerCase().includes(lower));
  }

  // Сортировка
  // if (session.sortedIds.length > 0) {
  //   result.sort((a, b) => {
  //     return session.sortedIds.indexOf(a.id) - session.sortedIds.indexOf(b.id);
  //   });
  // }

  // Пагинация
  const paginated = result.slice(offset, offset + limit);

  return {
    items: paginated,
    total: result.length,
    selectedIds: session.selectedIds
  };
}

export const getItems = (req, res) => {
  
  // const sessionId = req.query.sessionId;
  // const search = req.query.search || '';
  // const offset = parseInt(req.query.offset || '0');
  // const limit = parseInt(req.query.limit || '20');

  // if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  // const data = getFilteredSortedItems(sessionId, search, offset, limit);
  // res.json(data);
  const {offset} = req.query
  const limit = 20

  const paginated = items.slice(offset, offset + limit);
  sessionStore.data = paginated 

  res.json(sessionStore.data)

}

export const updateSelection = (req, res) => {
  // const { sessionId, selectedIds } = req.body;
  // if (!sessionId || !Array.isArray(selectedIds)) {
  //   return res.status(400).json({ error: 'Invalid input' });
  // }

  // sessionStore[sessionId] = sessionStore[sessionId] || {};
  // sessionStore[sessionId].selectedIds = selectedIds;
  // res.json({ status: 'ok' });
  const {selectedIds, cancelSelectionIds} = req.body;

  if (selectedIds) {
    sessionStore.data = sessionStore.data.map(item => {
    if (selectedIds.includes(item.id)) {
      
      return {...item, selected: true}
    } return item
  })
  }

  if (cancelSelectionIds) {
     sessionStore.data = sessionStore.data.map(item => {
    if (cancelSelectionIds.includes(item.id)) {
      
      return {...item, selected: false}
    } return item
  })
  }

  res.json(sessionStore.data)

}

export const updateSorting = (req, res) =>  {
  const { sessionId, sortedIds } = req.body;
  if (!sessionId || !Array.isArray(sortedIds)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  sessionStore[sessionId] = sessionStore[sessionId] || {};
  sessionStore[sessionId].sortedIds = sortedIds;
  res.json({ status: 'ok' });
}

