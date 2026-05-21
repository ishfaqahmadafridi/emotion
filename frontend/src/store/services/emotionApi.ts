import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const emotionApi = createApi({
  reducerPath: 'emotionApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api/ml/' }),
  endpoints: (builder) => ({
    analyzeFace: builder.mutation<{ emotion: string; confidence: number }, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: 'predict-face/',
          method: 'POST',
          body: formData,
        };
      },
    }),
    analyzeText: builder.mutation<{ emotion: string; score: number }, { text: string }>({
      query: (body) => ({
        url: 'predict-nlp/',
        method: 'POST',
        body,
      }),
    }),
    analyzeSpeech: builder.mutation<{ emotion: string; confidence: number }, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: 'predict-speech/',
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const { useAnalyzeFaceMutation, useAnalyzeTextMutation, useAnalyzeSpeechMutation } = emotionApi;
