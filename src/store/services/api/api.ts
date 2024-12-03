/* eslint-disable consistent-return */
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

const getBaseQuery = () => {
  const baseQuery = fetchBaseQuery({ baseUrl: "/", mode: "cors" });
  const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
  > = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    if (result.error && result.error.status === 401) {
      await baseQuery(
        {
          url: "/api",
          method: "POST",
        },
        api,
        extraOptions,
      );
      result = await baseQuery(args, api, extraOptions);
    }
    return result;
  };
  return baseQueryWithReauth;
};
//testing
const clientApi = createApi({
  reducerPath: "clientApi",
  tagTypes: ["getRolesDetails", "getUserDetails"],

  baseQuery: getBaseQuery(),
  endpoints: () => ({}),
});

export default clientApi;
