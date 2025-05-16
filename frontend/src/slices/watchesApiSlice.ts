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

    getPublicWatchBySlug: builder.query<IWatch, { slug: string }>({
      query: ({ slug }) => ({
        url: `${WATCHES_URL}/public-watches/${slug}`,
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

    getWatchBySlug: builder.query<IWatch, { slug: string }>({
      query: ({ slug }) => ({
        url: `${WATCHES_URL}/${slug}`,
      }),
      keepUnusedDataFor: 60,
      providesTags: ['Watch'],
    }),

    /************ Mutations *************/

    updateWatch: builder.mutation<unknown, Partial<IWatch>>({
      query: (data) => ({
        url: `${WATCHES_URL}/${data.slug}`,
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
  useGetPublicWatchBySlugQuery,
  useGetWatchesQuery,
  useGetWatchBySlugQuery,
  useCreateWatchMutation,
  useUpdateWatchMutation,
} = watchesApiSlice;
