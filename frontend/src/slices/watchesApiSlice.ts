import { WATCHES_URL } from '../constants';
import type { IWatch } from '../interfaces';
import { apiSlice } from './apiSlice';

export const watchesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /************ Queries *************/
    getPublicWatches: builder.query<IWatch[], void>({
      query: () => ({
        url: `${WATCHES_URL}/public-watches`,
      }),
      keepUnusedDataFor: 60,
      providesTags: ['Watches'],
    }),

    getPublicWatchById: builder.query<IWatch, { id: string }>({
      query: ({ id }) => ({
        url: `${WATCHES_URL}/public-watches/${id}`,
      }),
      keepUnusedDataFor: 60,
      providesTags: ['Watch'],
    }),

    getWatches: builder.query<IWatch[], void>({
      query: () => ({
        url: `${WATCHES_URL}`,
      }),
      keepUnusedDataFor: 60,
      providesTags: ['Watches'],
    }),

    getWatchById: builder.query<IWatch, { id: string }>({
      query: ({ id }) => ({
        url: `${WATCHES_URL}/${id}`,
      }),
      keepUnusedDataFor: 60,
      providesTags: ['Watch'],
    }),

    /************ Mutations *************/

    updateWatch: builder.mutation<unknown, Partial<IWatch>>({
      query: (data) => ({
        url: `${WATCHES_URL}/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Watches', 'Watch'],
    }),

    createWatch: builder.mutation<IWatch, IWatch>({
      query: (data) => ({
        url: `${WATCHES_URL}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Watches'],
    }),
  }),
});

export const {
  useGetPublicWatchesQuery,
  useGetPublicWatchByIdQuery,
  useGetWatchesQuery,
  useGetWatchByIdQuery,
  useCreateWatchMutation,
  useUpdateWatchMutation,
} = watchesApiSlice;
