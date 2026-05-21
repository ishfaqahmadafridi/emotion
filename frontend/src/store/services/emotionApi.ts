import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface PredictionResponse {
  success: boolean;
  model: string;
  prediction: string;
  probabilities: Record<string, number>;
  confidence: number;
  execution_time_ms: number;
}

export interface MLStats {
  total_predictions: number;
  success_rate: number;
  avg_latency_ms: number;
  model_stats: {
    face: number;
    nlp: number;
    speech: number;
  };
  success_count: number;
  failed_count: number;
  daily_usage: {
    date: string;
    predictions: number;
  }[];
}

export const emotionApi = createApi({
  reducerPath: 'emotionApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api/ml/' }),
  endpoints: (builder) => ({
    getMLStats: builder.query<MLStats, void>({
      query: () => 'stats/', // make sure the path is correct in urls.py
    }),
    analyzeFace: builder.mutation<PredictionResponse, File>({
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
    analyzeText: builder.mutation<PredictionResponse, { text: string }>({
      query: (body) => ({
        url: 'predict-nlp/',
        method: 'POST',
        body,
      }),
    }),
    analyzeSpeech: builder.mutation<PredictionResponse, File>({
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

export const { useGetMLStatsQuery, useAnalyzeFaceMutation, useAnalyzeTextMutation, useAnalyzeSpeechMutation } = emotionApi;
