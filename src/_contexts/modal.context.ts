import { Token } from "@/utils/types";
import { createContext, useContext } from "react";

export type ModalType = "assetInfo" | "assetEdit" | "prompt" | null;

type ModalContext = {
    currentlyActive: ModalType;
    assetInfo: {
        isActive: boolean;
        open: (t: { token: Token; refresh?: () => void }) => void;
        close: () => void;
    };
    assetEdit: {
        isActive: boolean;
        open: (t: { token: Token; refresh?: () => void }) => void;
        close: () => void;
    };

    prompt: {
        isActive: boolean;
        open: (t: {
            title: string;
            description: string;
            onConfirm: () => void;
            type?: "success" | "danger" | "warning";
            icon?: React.ReactNode;
        }) => void;
        close: () => void;
    };
};

export const ModalContext = createContext<ModalContext>({
    currentlyActive: null,
    assetInfo: {
        isActive: false,
        open: () => {},
        close: () => {},
    },
    assetEdit: {
        isActive: false,
        open: () => {},
        close: () => {},
    },

    prompt: {
        isActive: false,
        open: () => {},
        close: () => {},
    },
});

export function useModalContext() {
    return useContext(ModalContext);
}
