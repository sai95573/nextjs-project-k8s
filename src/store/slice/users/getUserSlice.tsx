import clientApi from "../../services/api/api";

const getUsersApiSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({
        url: `/api/v1/admin/users`,
        method: "GET",
      }),
      providesTags: ["getUserDetails"],
    }),
    getUsersById: builder.query({
      query: ({ userid }) => ({
        url: `/api/v1/admin/users/${userid}`,
        method: "GET",
      }),
      // providesTags: ["getUserDetails"],
    }),
  }),
});

export const { useGetUsersQuery, useGetUsersByIdQuery } = getUsersApiSlice;
export const { getUsers } = getUsersApiSlice.endpoints;
