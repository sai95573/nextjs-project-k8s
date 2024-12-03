// eslint-disable-next-line import/no-cycle, import/no-named-as-default

import { combineReducers } from "@reduxjs/toolkit";
import clientApi from "../services/api/api";

// import { exampleSlice } from '@/store/slices/example';

const MultiReducer = combineReducers({
  [clientApi.reducerPath]: clientApi.reducer,
});

export default MultiReducer;
