import { apiSlice } from './apiSlice';
import { USERS_URL } from '../constants';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: 'POST',
        body: data,
      }),
    }),

    // loginGoogle: builder.mutation({
    //   query: (data) => ({
    //     url: `${USERS_URL}/auth/google`,
    //     method: 'POST',
    //     body: data,
    //   }),
    // }),

    // loginFacebook: builder.mutation({
    //   query: (data) => ({
    //     url: `${USERS_URL}/auth/facebook`,
    //     method: 'POST',
    //     body: data,
    //   }),
    // }),

    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: 'POST',
        body: data,
      }),
    }),

    logout: builder.mutation<unknown, void>({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Watches'],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useRegisterMutation } =
  userApiSlice;
