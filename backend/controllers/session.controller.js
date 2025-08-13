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
      // const selectedItemFromSearch = sessionStore.selectedIdsFromSearch.find(i => i.id === item.id)
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

  console.log(offset)

  let paginated = getPaginatedData(offset, limit, search)

  if (!search) {
      if (sessionStore.data.length <= offset) {
    sessionStore.data = [...sessionStore.data, ...paginated]
    // console.log(sessionStore.data)
  }
  } else {
    if (offset === 0) {
      sessionStore.searchData = []
    }

    if (sessionStore.searchData.length <= offset) {
    sessionStore.searchData = [...sessionStore.searchData, ...paginated]
    // console.log(sessionStore.data)
  }
  }

    res.json(paginated)
  
}

export const updateSelection = (req, res) => {
  const {id, search} = req.body;
 
  if (search) {
    //  console.log(1)
    sessionStore.searchData = sessionStore.searchData.map(item => {
      // console.log(id)
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

    // console.log(sessionStore.selectedIdsFromSearch)

    res.json(sessionStore.searchData) 

} else {
             
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
  }

export const updateSorting = (req, res) =>  {
  const {reorderedList} = req.body

  sessionStore.data = reorderedList

  res.json(sessionStore.data)

}