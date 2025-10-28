import React from "react";
import ModalComponent from "../modal.component";
import InputComponent from "../input.component";
import ButtonComponent from "../button.component";
import axios from "axios";
import { BASE_URL, handleError } from "@/utils/app";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import useToast from "@/utils/hooks/use-toast";

interface ChangeRoleProps {
    isModalOpen: boolean;
    closeModal: () => void;
    userId: string;
}

const ChangeRole: React.FC<ChangeRoleProps> = ({
    isModalOpen,
    closeModal,
    userId,
}) => {
    const roles = ["admin", "moderator"];
    const { token } = useSelector((state: RootState) => state.auth);
    const { notifySuccess, notifyError } = useToast();

    const handleChangeRole = (role: string) => {
        axios
            .post(
                BASE_URL + "/api/roles/" + userId,
                {
                    role: role,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )
            .then((res) => {
                notifySuccess("User role successfully updated.");
                closeModal();
            })
            .catch((err) => {
                handleError(err, notifyError);
            });
        closeModal();
    };

    return (
        <ModalComponent
            header="Change Role"
            isOpen={isModalOpen}
            onClose={closeModal}
        >
            <div className="flex flex-col divide-y divide-dark">
                {roles.map((role) => (
                    <button
                        className="block p-4 capitalize text-left"
                        onClick={() => handleChangeRole(role)}
                    >
                        {role}
                    </button>
                ))}
            </div>
        </ModalComponent>
    );
};

export default ChangeRole;
