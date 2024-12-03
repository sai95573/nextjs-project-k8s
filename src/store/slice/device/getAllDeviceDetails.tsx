import clientApi from "../../services/api/api";

const getDeviceSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeviceDetails: builder.query({
      query: ({ limit, page, deviceId }) => ({
        url: `/api/v1/admin/device?deviceId=${deviceId}&page=${page}&limit=${limit}`,

        method: "GET",
      }),
      //   providesTags: ["getRolesDetails"],
    }),
    getFullDeviceDetails: builder.query({
      query: ({}) => ({
        url: `/api/v1/admin/device`,
        method: "GET",
      }),
      //   providesTags: ["getRolesDetails"],
    }),
    getDeviceById: builder.query({
      query: ({ userId, deviceId }) => ({
        url: `/api/v1/admin/device/details?page=1&limit=10&userId=${userId}&deviceId=${deviceId}`,
        method: "GET",
      }),
      //   providesTags: ["getRolesDetails"],
    }),
  }),
});

export const {
  useGetDeviceDetailsQuery,
  useGetFullDeviceDetailsQuery,
  useGetDeviceByIdQuery,
} = getDeviceSlice;
export const { getDeviceDetails } = getDeviceSlice.endpoints;
