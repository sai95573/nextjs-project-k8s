import clientApi from "@/store/services/api/api";

const deviceTypeApiSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    deviceType: builder.query({
      query: ({ deviceType }) => ({
        url: `/api/v1/admin/device/type?deviceType=${deviceType}`,
        method: "GET",
      }),
      //   invalidatesTags: ["getUserDetails"],
    }),
  }),
});

export const { useDeviceTypeQuery } = deviceTypeApiSlice;
export const { deviceType } = deviceTypeApiSlice.endpoints;
