import clientApi from "@/store/services/api/api";

const loginApiSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    postLogin: builder.mutation({
      query: (data) => ({
        url: `/api/v1/admin/login`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { usePostLoginMutation } = loginApiSlice;
export const { postLogin } = loginApiSlice.endpoints;
