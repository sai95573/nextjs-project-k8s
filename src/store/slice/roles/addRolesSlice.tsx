import clientApi from "@/store/services/api/api";

const addRolesApiSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    addRoles: builder.mutation({
      query: (data) => ({
        url: `/api/v1/admin/role`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["getRolesDetails"],
    }),
  }),
});

export const { useAddRolesMutation } = addRolesApiSlice;
export const { addRoles } = addRolesApiSlice.endpoints;
