import clientApi from "@/store/services/api/api";

const updateRolesApiSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    updateRoles: builder.mutation({
      query: (data) => ({
        url: `/api/v1/admin/role`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["getRolesDetails"],
    }),
  }),
});

export const { useUpdateRolesMutation } = updateRolesApiSlice;
export const { updateRoles } = updateRolesApiSlice.endpoints;

// import clientApi from "@/store/services/api/api";

// const updateRolesApiSlice = clientApi.injectEndpoints({
//   endpoints: (builder) => ({
//     updateRoles: builder.mutation({
//       query: ({ id, name, permission, status }) => ({
//         url: `/api/v1/admin/role/${id}`,
//         method: "PUT",

//         body: JSON.stringify({
//           name,
//           permission,
//           status,
//         }),
//       }),
//       invalidatesTags: ["getRolesDetails"],
//     }),
//   }),
// });

// export const { useUpdateRolesMutation } = updateRolesApiSlice;
// export const { updateRoles } = updateRolesApiSlice.endpoints;
