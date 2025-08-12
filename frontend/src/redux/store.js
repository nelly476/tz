import { configureStore } from '@reduxjs/toolkit';
import sessionSlice from "../redux/slices/sessionSlice";

export const store = configureStore({
  reducer: {
    sessionSlice: sessionSlice
  }
});
