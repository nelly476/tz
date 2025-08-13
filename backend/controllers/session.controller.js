import { items } from '../data/items.js';

const sessionStore = {
  data: [],
  searchData: [],
  selectedIdsFromSearch: [],
};

function getPaginatedData(offset, limit, search) {
  let data

  if (search) {
    data = [...items].filter(item => item.name.includes(search)).map(item => {
      const sessionStoreItem = sessionStore.data.find(i => i.id === item.id)
      if (sessionStoreItem) {
        return sessionStoreItem
      } else {
        return item
      }
    })

  } else {
    if (sessionStore.data.length > offset) {
    data =  sessionStore.data
  } else {
    data = [...items]
  }
  }

  return data
    .slice(offset, offset + limit)
    .map(item => {
      if (sessionStore.selectedIdsFromSearch.includes(item.id)) {
        return {...item, isSelected: true}
      } else {
        return item
      }
    })
}

export const getItems = (req, res) => {
  let {offset, limit, search} = req.query
  offset = Number(offset)
  limit = Number(limit)

  let paginated = getPaginatedData(offset, limit, search)

  if (!search) {
      if (sessionStore.data.length <= offset) {
    sessionStore.data = [...sessionStore.data, ...paginated]
  }
  } else {
    if (offset === 0) {
      sessionStore.searchData = []
    }

    if (sessionStore.searchData.length <= offset) {
    sessionStore.searchData = [...sessionStore.searchData, ...paginated]
  }
  }

    res.json(paginated)
  
}

export const updateSelection = (req, res) => {
  const {id, search} = req.body;
  // console.log(search)
 
  if (search.length > 0) {
    sessionStore.searchData = sessionStore.searchData.map(item => {
      if (item.id === id) {
        return {...item, isSelected: !item.isSelected}
      } else {
        return item
      }
    })
    const indexInData = sessionStore.data.findIndex(item => item.id === id)
    if (indexInData >= 0) {
      sessionStore.data[indexInData].isSelected = !sessionStore.data[indexInData].isSelected
    } else {
      if (sessionStore.selectedIdsFromSearch.includes(id)) {
        sessionStore.selectedIdsFromSearch = sessionStore.selectedIdsFromSearch.filter(i => i !== id)
      } else {
          sessionStore.selectedIdsFromSearch = [...sessionStore.selectedIdsFromSearch, id]

      }
    }
    res.json(sessionStore.searchData) 

} else {
            // console.log(sessionStore.data)   
    sessionStore.data = sessionStore.data.map(item => {
    if (item.id === id) {
      return {...item, isSelected: !item.isSelected}
    } else {
      return item
    }
    
  })


  res.json(sessionStore.data)
}
  }

export const updateSorting = (req, res) =>  {
  const {reorderedList} = req.body

  sessionStore.data = reorderedList

  res.json(sessionStore.data)

}