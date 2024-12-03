"use client";

import { persistor, store } from "@/store/store";
// import { store } from "@/store";
// // import store from "@/store";
// import React from "react";
// import { Provider } from "react-redux";

// const ReactReduxProvider = ({ children }: { children: React.ReactNode }) => {
//   return <Provider store={store()}>{children}</Provider>;
// };

// export default ReactReduxProvider;

// import store from "@/store";
import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

const ReactReduxProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default ReactReduxProvider;
