import React from "react";
import ModalComponent from "../modal.component";
import { Notification } from "@/utils/types";

interface NotificationInfoProps {
    isModalOpen: boolean;
    closeModal: () => void;
    notification: Notification;
}

const NotificationInfo: React.FC<NotificationInfoProps> = ({
    isModalOpen,
    closeModal,
    notification,
}) => {
    return (
        <ModalComponent
            header="Notification Details"
            isOpen={isModalOpen}
            onClose={closeModal}
        >
            <div className="p-4 flex flex-col gap-4">
                <div className="text-left  mt-4">
                    <div className="block text-base font-medium text-[#C1C4D6] text-opacity-50">
                        Subject:
                    </div>
                    <div className="block text-base font-medium text-[#C1C4D6]">
                        {notification.subject}
                    </div>
                </div>

                <div className="text-left  mt-4">
                    <div className="block text-base font-medium text-[#C1C4D6] text-opacity-50">
                        Content:
                    </div>
                    <div className="block text-base pb-6 font-medium text-[#C1C4D6]">
                        {notification.body}
                    </div>
                </div>
            </div>
        </ModalComponent>
    );
};

export default NotificationInfo;
