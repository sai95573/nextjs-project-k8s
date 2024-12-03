import clientApi from "../../services/api/api";

const getAllReportSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllReportDetails: builder.query({
      query: ({ type, startDate, endDate }) => ({
        // url: `/api/v1/admin/customer?search=${search}&deviceType=${deviceType}&fromDate=${fromDate}&toDate=${toDate}&page=${page}&limit=${limit}`,
        url: `/api/v1/admin/reports/download?type=${type}&startDate=${startDate}&endDate=${endDate}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAllReportDetailsQuery } = getAllReportSlice;
export const { getAllReportDetails } = getAllReportSlice.endpoints;
