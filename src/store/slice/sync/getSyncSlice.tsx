import clientApi from "../../services/api/api";

const getSyncApiSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    getSyncData: builder.query({
      query: ({ id }) => ({
        url: `/api/v1/admin/device/get-sync-dates?userId=${id}`,
        method: "GET",
      }),
      // providesTags: ["getRolesDetails"],
    }),
  }),
});

export const { useGetSyncDataQuery } = getSyncApiSlice;
export const { getSyncData } = getSyncApiSlice.endpoints;
