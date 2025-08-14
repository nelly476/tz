import { items } from '../data/items.js';

const sessionStore = {
  data: [...items],
};

function getPaginatedData(offset, limit, search) {
  if (search) {
    return sessionStore.data.filter(item => item.name.includes(search)).slice(offset, offset + limit)
  }

  return sessionStore.data
    .slice(offset, offset + limit)
}

export const getItems = (req, res) => {
  let {offset, limit, search} = req.query
  offset = Number(offset)
  limit = Number(limit)

  let paginated = getPaginatedData(offset, limit, search)

    res.json(paginated)
  
}

export const updateSelection = (req, res) => {
  const {id} = req.body;

  const targetIndex = sessionStore.data.findIndex(item => item.id === id)
  const targeItem = sessionStore.data[targetIndex]
  sessionStore.data[targetIndex] = {...targeItem, isSelected: !targeItem.isSelected}

  res.json(id)
  }

export const updateSorting = (req, res) =>  {
  const {reorderedList, active, over} = req.body
  const fromIndex = sessionStore.data.findIndex(item => item.id === active.id)
  const toIndex = sessionStore.data.findIndex(item => item.id === over.id)

  const item = sessionStore.data.splice(fromIndex, 1)[0];
  sessionStore.data.splice(toIndex, 0, item);

  res.json(reorderedList)
}
