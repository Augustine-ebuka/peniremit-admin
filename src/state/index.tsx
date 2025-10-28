import { Provider } from "react-redux";
import { persistor, store } from "@/state/store";
import React from "react";
import { PersistGate } from "redux-persist/integration/react";

export function ReduxProvider({ children }: { children: any }) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    );
}
