import clientApi from "@/store/services/api/api";

const deleteUserApiSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    deleteUser: builder.mutation({
      query: ({ userId }) => ({
        url: `/api/v1/admin/users?id=${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["getUserDetails"],
    }),
  }),
});

export const { useDeleteUserMutation } = deleteUserApiSlice;
export const { deleteUser } = deleteUserApiSlice.endpoints;
