import clientApi from "@/store/services/api/api";

const updateUserApiSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    updateUser: builder.mutation({
      query: (data) => ({
        url: `/api/v1/admin/users`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["getUserDetails"],
    }),
  }),
});

export const { useUpdateUserMutation } = updateUserApiSlice;
export const { updateUser } = updateUserApiSlice.endpoints;
