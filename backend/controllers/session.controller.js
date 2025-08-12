import { items } from '../data/items.js';

const sessionStore = {
  data: [],
  selectedIds: new Set(),
};

function getPaginatedData(offset, limit) {
  let data
  if (sessionStore.data.length > offset) {
    data =  sessionStore.data
  } else {
    data = [...items]
  } 

  return data
    .slice(offset, offset + limit)
    // .map(item => ({
    //   ...item,
    //   isSelected: sessionStore.selectedIds.has(item.id)
    // }));
}

export const getItems = (req, res) => {
  let {offset, limit, search} = req.query
  offset = Number(offset)
  limit = Number(limit)

  let paginated = getPaginatedData(offset, limit)
  // console.log(paginated)

  if (sessionStore.data.length <= offset) {
    sessionStore.data = [...sessionStore.data, ...paginated]
    // console.log(sessionStore.data)
  }
  res.json(paginated)
  
}

export const updateSelection = (req, res) => {
  const {id} = req.body;

  sessionStore.data = sessionStore.data.map(item => {
    if (item.id === id) {
      // console.log(item)
      return {...item, isSelected: !item.isSelected}
    } else {
      return item
    }
    
  })
  
  res.json(sessionStore.data)
}

export const updateSorting = (req, res) =>  {
  const {reorderedList, oldIndex, newIndex} = req.body

  const start = Math.min(oldIndex, newIndex);
  const end = Math.max(oldIndex, newIndex);

  const data = sessionStore.data

  sessionStore.data = reorderedList

  res.json(sessionStore.data)

}