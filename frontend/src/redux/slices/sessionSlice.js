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

export const selectItems = createAsyncThunk('items/select', async ({id, search}) => {
  const res = await axiosInstance.post('/select', { id, search });
  return res.data; 
});

export const sortItems = createAsyncThunk(
  'items/sort',
  async ({ reorderedList}) => {
    const res = await axiosInstance.post('/sort', { reorderedList });
    return res.data; 
  }
);


const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    data: [],
    status: 'idle',
  },
  reducers: {},
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
        state.status = 'succeeded';
        state.data = action.payload
        
      })
      .addCase(selectItems.rejected, (state) => {
        state.status = 'failed';
      })

 .addCase(sortItems.fulfilled, (state, action) => {
  state.status = 'succeeded';

  state.data = action.payload

});
  },
});

export default sessionSlice.reducer;
