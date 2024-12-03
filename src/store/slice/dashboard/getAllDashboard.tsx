import clientApi from "../../services/api/api";

const getDashboardSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardDetails: builder.query({
      query: ({ type, startDate, endDate, userId }) => ({
        url: `/api/v1/admin/reports?type=${type}&startDate=${startDate}&endDate=${endDate}&userId=${userId}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0, // Do not cache the data
    }),
  }),
});

export const { useGetDashboardDetailsQuery } = getDashboardSlice;
export const { getDashboardDetails } = getDashboardSlice.endpoints;
