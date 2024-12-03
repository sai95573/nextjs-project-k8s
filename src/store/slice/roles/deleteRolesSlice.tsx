import clientApi from "@/store/services/api/api";

const deleteRolesApiSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    deleteRles: builder.mutation({
      query: ({ roleId }) => ({
        url: `/api/v1/admin/role/${roleId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["getRolesDetails"],
    }),
  }),
});

export const { useDeleteRlesMutation } = deleteRolesApiSlice;
export const { deleteRles } = deleteRolesApiSlice.endpoints;
