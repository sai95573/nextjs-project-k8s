import clientApi from "../../services/api/api";

const getRolesApiSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    getRolestable: builder.query({
      query: () => ({
        url: `/api/v1/admin/role`,
        method: "GET",
      }),
      providesTags: ["getRolesDetails"],
    }),
    getRolesById: builder.query({
      query: ({ roleId }) => ({
        url: `/api/v1/admin/role/${roleId}`,
        method: "GET",
      }),
      providesTags: ["getRolesDetails"],
    }),
  }),
});

export const { useGetRolestableQuery, useGetRolesByIdQuery } = getRolesApiSlice;
export const { getRolestable } = getRolesApiSlice.endpoints;
