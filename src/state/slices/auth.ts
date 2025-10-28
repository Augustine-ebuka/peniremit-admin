import { User } from "@/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthState = {
    token: string | null;
    user: User | null;
};

interface LoginPayload {
    token: string;
    user: User;
}

const initialState: AuthState = {
    token: null,
    user: null,
};

export const authSlice = createSlice({
    name: "authentication",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<LoginPayload>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
        },
        logOut: () => {
            localStorage.clear();
            return initialState;
        },
    },
});

export const { login, logOut } = authSlice.actions;
export default authSlice.reducer;
