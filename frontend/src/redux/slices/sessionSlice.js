// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { axiosInstance } from '../../lib/axios.js';

// export const getItems = createAsyncThunk(
//   'items/fetch',
//   async ({ offset, limit = 20, search = '' }) => {
//     const res = await axiosInstance.get('/items', {
//       params: { offset, limit, search },
//     });
//     return res.data;
//   }
// );

// export const selectItems = createAsyncThunk('items/select', async ({id}) => {
//   await axiosInstance.post('/select', { id });
//   // return res.data; 
// });

// export const sortItems = createAsyncThunk(
//   'items/sort',
//   async ({ active, over}) => {
//     await axiosInstance.post('/sort', { active, over });
//   }
// );


// const sessionSlice = createSlice({
//   name: 'session',
//   initialState: {
//     data: [],
//     status: 'idle',
//   },
//   reducers: {
//   moveLocal(state, action) {
//     const { reorderedList } = action.payload;
//     state.data = reorderedList;
//   },
//   selectLocal(state, action) {
//     const {id} = action.payload;
//      const targetIndex = state.data.findIndex(item => item.id === id)
//     state.data[targetIndex] = {...state.data[targetIndex], isSelected: !state.data[targetIndex].isSelected}
//   }
// },
//   extraReducers: (builder) => {
//     builder
//       .addCase(getItems.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(getItems.fulfilled, (state, action) => {
//         if (action.meta.arg.offset > 0) {
//           state.data = [...state.data, ...action.payload];
//         } else {
//           state.data = action.payload;
//         }
//         state.status = 'succeeded';
//       })
//       .addCase(getItems.rejected, (state) => {
//         state.status = 'failed';
//       })

//       .addCase(selectItems.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(selectItems.fulfilled, (state) => {
//         state.status = 'succeeded';
//       })
//       .addCase(selectItems.rejected, (state) => {
//         state.status = 'failed';
//       })

//       .addCase(sortItems.fulfilled, (state) => {
//       state.status = 'succeeded';

// });
//   },
// });

// export const { moveLocal, selectLocal } = sessionSlice.actions;

// export default sessionSlice.reducer;

// src/redux/slices/sessionSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../lib/axios.js';


export const getItems = createAsyncThunk(
  'items/fetch',
  async ({ offset = 0, limit = 20, search = '' }, { signal, rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/items', { params: { offset, limit, search }, signal });
      return res.data; // { data, total, offset, limit, hasMore }
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? { message: 'Fetch failed' });
    }
  }
);

export const selectItems = createAsyncThunk(
  'items/select',
  async ({ id }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/select', { id });
      return res.data; // обновлённый item
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? { message: 'Select failed', id });
    }
  }
);

export const sortItems = createAsyncThunk(
  'items/sort',
  async ({ activeId, overId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/sort', { activeId, overId });
      return res.data; // { changes }
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? { message: 'Sort failed' });
    }
  }
);


const initialState = {
  data: [],             
  total: 0,
  hasMore: false,
  listStatus: 'idle',  
  isSorting: false,
  selectPendingById: {},
  error: null,
};

function moveById(arr, activeId, overId) {
  const copy = arr.slice();
  const from = copy.findIndex(x => x.id === activeId);
  const to   = copy.findIndex(x => x.id === overId);
  if (from < 0 || to < 0 || from === to) return copy;
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);

  return copy.map((it, i) => ({ ...it, order: typeof it.order === 'number' ? i : it.order }));
}

function applyOrderChanges(arr, changes) {
  if (!Array.isArray(changes) || !changes.length) return arr;
  const byId = new Map(arr.map(it => [it.id, { ...it }]));
  for (const { id, order } of changes) {
    const it = byId.get(id);
    if (it) it.order = order;
  }
  const next = Array.from(byId.values());
  next.sort((a, b) => {
    const ao = typeof a.order === 'number' ? a.order : 0;
    const bo = typeof b.order === 'number' ? b.order : 0;
    return ao - bo;
  });
  return next;
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // оптимистичный локальный перенос 
    moveLocal(state, action) {
      const { activeId, overId, reorderedList } = action.payload || {};
      if (Array.isArray(reorderedList)) {
        state.data = reorderedList;
      } else if (activeId && overId) {
        state.data = moveById(state.data, activeId, overId);
      }
    },
    // оптимистичный toggle select
    selectLocal(state, action) {
      const { id } = action.payload || {};
      const i = state.data.findIndex(x => x.id === id);
      if (i !== -1) state.data[i].isSelected = !state.data[i].isSelected;
    },
    // сброс ошибок
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getItems.pending, (state, action) => {
        // если это первая страница — показываем загрузку списка
        if (!action.meta.arg || (action.meta.arg && action.meta.arg.offset === 0)) {
          state.listStatus = 'loading';
        }
        state.error = null;
      })
      .addCase(getItems.fulfilled, (state, action) => {
        const { data = [], total = 0, hasMore = false } = action.payload || {};
        const offset = action.meta.arg?.offset ?? 0;

        if (offset > 0) {
          // на случай дублей 
          const existingIds = new Set(state.data.map(x => x.id));
          state.data = [...state.data, ...data.filter(x => !existingIds.has(x.id))];
        } else {
          state.data = data;
        }

        if (state.data.length && typeof state.data[0].order === 'number') {
          state.data.sort((a, b) => a.order - b.order);
        }

        state.total = total;
        state.hasMore = hasMore;
        state.listStatus = 'succeeded';
      })
      .addCase(getItems.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.error = action.payload ?? action.error ?? null;
      })

      .addCase(selectItems.pending, (state, action) => {
        const id = action.meta.arg?.id;
        if (id) state.selectPendingById[id] = true;
        state.error = null;
      })
      .addCase(selectItems.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated && updated.id != null) {
          const i = state.data.findIndex(x => x.id === updated.id);
          if (i !== -1) state.data[i] = { ...state.data[i], ...updated };
        }
        const id = updated?.id ?? action.meta.arg?.id;
        if (id) state.selectPendingById[id] = false;
      })
      .addCase(selectItems.rejected, (state, action) => {
        const id = action.meta.arg?.id;
        if (id) state.selectPendingById[id] = false;
        state.error = action.payload ?? action.error ?? null;
      })

      .addCase(sortItems.pending, (state) => {
        state.isSorting = true;
        state.error = null;
      })
      .addCase(sortItems.fulfilled, (state, action) => {
        const payload = action.payload || {};
        (Array.isArray(payload.changes)) 
        state.data = applyOrderChanges(state.data, payload.changes);
        
        state.isSorting = false;
      })
      .addCase(sortItems.rejected, (state, action) => {
        state.isSorting = false;
        state.error = action.payload ?? action.error ?? null;
      });
  },
});

export const { moveLocal, selectLocal, clearError } = sessionSlice.actions;
export default sessionSlice.reducer;
