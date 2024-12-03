import clientApi from "../../services/api/api";

const getCustomerSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerDetails: builder.query({
      query: ({ page, limit, search, deviceType, fromDate, toDate }) => ({
        url: `/api/v1/admin/customer?search=${search}&deviceType=${deviceType}&fromDate=${fromDate}&toDate=${toDate}&page=${page}&limit=${limit}`,
        method: "GET",
      }),
      //   providesTags: ["getRolesDetails"],
    }),
    getCustomersById: builder.query({
      query: ({ customerid }) => ({
        url: `/api/v1/admin/customer/${customerid}`,
        method: "GET",
      }),
      // providesTags: ["getRolesDetails"],
    }),
  }),
});

export const { useGetCustomerDetailsQuery, useGetCustomersByIdQuery } =
  getCustomerSlice;
export const { getCustomerDetails } = getCustomerSlice.endpoints;
