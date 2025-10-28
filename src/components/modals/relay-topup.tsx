import React, { ReactNode, useState } from "react";
import ModalComponent from "../modal.component";
import { QRCode } from "react-qrcode-logo";
import { Copy, CopyCheck } from "lucide-react";
import ShortenerComponent from "../shortener.component";

interface RelayTopupProps {
    isModalOpen: boolean;
    closeModal: () => void;
    address: string;
}

const RelayTopup: React.FC<RelayTopupProps> = ({
    isModalOpen,
    closeModal,
    address,
}) => {
    return (
        <ModalComponent isOpen={isModalOpen} onClose={closeModal} noHeader>
            <div className="flex flex-col justify-start items-center p-6 overflow-scroll">
                <div className="text-center w-80 mb-5">
                    This is a BNB address. Please make sure to send only BNB
                    here
                </div>
                <div className="rounded-2xl overflow-hidden">
                    <QRCode
                        value={address}
                        qrStyle="dots"
                        size={250}
                        eyeRadius={15}
                        logoImage={"/assets/images/bnb.png"}
                        logoPaddingStyle="circle"
                        logoPadding={5}
                    />
                </div>
                <div className="pt-5 mt-5 flex gap-4 w-full">
                    <div className="border border-dark p-4 w-full text-center rounded-md truncate text-sm">
                        <ShortenerComponent value={address} shorten={false} />
                    </div>
                </div>
            </div>
        </ModalComponent>
    );
};

export default RelayTopup;
