import { configureStore } from '@reduxjs/toolkit';
import { emotionApi } from './services/emotionApi';

export const store = configureStore({
  reducer: {
    [emotionApi.reducerPath]: emotionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(emotionApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
