import React from "react";
import ModalComponent from "../modal.component";
import ButtonComponent from "../button.component";
import { Trash } from "iconsax-react";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import useToast from "@/utils/hooks/use-toast";
import axios from "axios";
import { BASE_URL, handleError } from "@/utils/app";

interface DeleteAssetProps {
    isModalOpen: boolean;
    closeModal: () => void;
    asset: string;
    refresh: () => void;
}

const DeleteAsset: React.FC<DeleteAssetProps> = ({
    asset,
    refresh,
    isModalOpen,
    closeModal,
}) => {
    const { token } = useSelector((state: RootState) => state.auth);
    const { notifySuccess, notifyError } = useToast();

    const deleteAsset = () => {
        axios
            .delete(BASE_URL + "/api/assets/" + asset, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                notifySuccess("Asset delist action was successful.");
                closeModal();
                refresh();
            })
            .catch((err) => {
                handleError(err, notifyError);
            });
    };

    return (
        <ModalComponent
            isOpen={isModalOpen}
            onClose={closeModal}
            noHeader={true}
        >
            <div className="p-4 px-6 flex flex-col gap-4">
                <div className="text-center flex flex-col items-center">
                    <div className="h-24 w-24 text-red rounded-full flex items-center justify-center bg-dark mb-4">
                        <Trash variant="Bold" />
                    </div>
                    <h2 className="mb-2 text-xl">Delete Asset</h2>
                    <div className="w-80 text-sm text-neutral-600">
                        Deleting an asset will make it unavailable for
                        Peniwallet Users and Admins.
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-full">
                        <ButtonComponent
                            onClick={closeModal}
                            className="mt-6 bg-primary text-neutral border-dark border hover:bg-dark/20"
                        >
                            Cancel
                        </ButtonComponent>
                    </div>
                    <div className="w-full">
                        <ButtonComponent
                            onClick={deleteAsset}
                            className="mt-6 bg-red/80 hover:bg-red text-neutral border-dark border"
                        >
                            Delete Asset
                        </ButtonComponent>
                    </div>
                </div>
            </div>
        </ModalComponent>
    );
};

export default DeleteAsset;
