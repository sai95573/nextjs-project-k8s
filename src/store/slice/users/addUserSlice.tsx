import clientApi from "@/store/services/api/api";

const addUserApiSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    addUser: builder.mutation({
      query: (data) => ({
        url: `/api/v1/admin/users`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["getUserDetails"],
    }),
  }),
});

export const { useAddUserMutation } = addUserApiSlice;
export const { addUser } = addUserApiSlice.endpoints;
