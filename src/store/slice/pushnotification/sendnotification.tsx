import clientApi from "@/store/services/api/api";

const pushNotificationApiSlice = clientApi.injectEndpoints({
  endpoints: (builder) => ({
    pushNotification: builder.mutation({
      query: (data) => ({
        url: `/api/v1/admin/push-notifification`,
        method: "POST",
        body: data,
      }),
      //   invalidatesTags: ["getUserDetails"],
    }),
  }),
});

export const { usePushNotificationMutation } = pushNotificationApiSlice;
export const { pushNotification } = pushNotificationApiSlice.endpoints;
