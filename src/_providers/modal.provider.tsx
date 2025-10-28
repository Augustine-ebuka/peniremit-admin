"use client";
import { ModalContext, ModalType } from "@/_contexts/modal.context";
import { AssetInfoModalContainer } from "@/components/modals/asset-info";
import { AssetEditModalContainer } from "@/components/modals/edit-asset";
import { PromptModalContainer } from "@/components/modals/prompt";
import { useState } from "react";

export function ModalContextProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [currentlyActive, setCurrentlyActive] = useState<ModalType>(null);
    const viewAssetModal = AssetInfoModalContainer();
    const editAssetModal = AssetEditModalContainer();
    const promptModal = PromptModalContainer();

    return (
        <ModalContext.Provider
            value={{
                currentlyActive,
                assetInfo: {
                    isActive: currentlyActive === "assetInfo",
                    open: (a) => {
                        setCurrentlyActive("assetInfo");

                        viewAssetModal.toggle(a);
                    },

                    close: () => {
                        setCurrentlyActive(null);
                    },
                },

                assetEdit: {
                    isActive: currentlyActive === "assetEdit",
                    open: (a) => {
                        setCurrentlyActive("assetEdit");
                        editAssetModal.toggle(a);
                    },

                    close: () => {
                        setCurrentlyActive(null);
                    },
                },

                prompt: {
                    isActive: currentlyActive === "prompt",
                    open: (a) => {
                        setCurrentlyActive("prompt");
                        promptModal.toggle(a);
                    },

                    close: () => {
                        setCurrentlyActive(null);
                    },
                },
            }}
        >
            {children}
            <viewAssetModal.Component />
            <editAssetModal.Component />
            <promptModal.Component />
        </ModalContext.Provider>
    );
}
