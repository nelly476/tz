import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../lib/axios.js';

export const getItems = createAsyncThunk(
  'items/fetch',
  async ({ offset, limit = 20, search = '' }) => {
    const res = await axiosInstance.get('/items', {
      params: { offset, limit, search },
    });
    return res.data;
  }
);

export const selectItems = createAsyncThunk(
  'items/select',
  async ({ id }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/select', { id });
      return res.data; // обновлённый item, itemId
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? { message: 'Select failed', id });
    }
  }
);

export const sortItems = createAsyncThunk(
  'items/sort',
  async ({ activeId, overId}) => {
    await axiosInstance.post('/sort', { activeId, overId });
  }
);


const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    data: [],
    status: 'idle',
  },
  reducers: {
  sortLocal(state, action) {
    const { reorderedList } = action.payload;
    state.data = reorderedList;
  },
  selectLocal(state, action) {
    const {id} = action.payload;
     const targetIndex = state.data.findIndex(item => item.id === id)
    state.data[targetIndex] = {...state.data[targetIndex], isSelected: !state.data[targetIndex].isSelected}
  }
},
  extraReducers: (builder) => {
    builder
      .addCase(getItems.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getItems.fulfilled, (state, action) => {
        if (action.meta.arg.offset > 0) {
          state.data = [...state.data, ...action.payload];
        } else {
          state.data = action.payload;
        }
        state.status = 'succeeded';
      })
      .addCase(getItems.rejected, (state) => {
        state.status = 'failed';
      })

      .addCase(selectItems.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(selectItems.fulfilled, (state, action) => {
        const {item, id} = action.payload;
        
        const targetIndex = state.data.findIndex(item => item.id === id)
        state.data[targetIndex] = item  
      })
      .addCase(selectItems.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(sortItems.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sortItems.fulfilled, (state) => {
      state.status = 'succeeded';
      })
      .addCase(sortItems.rejected, (state, action) => {
        state.error = action.payload ?? action.error ?? null;
      });
  },
});

export const { sortLocal, selectLocal } = sessionSlice.actions;

export default sessionSlice.reducer;