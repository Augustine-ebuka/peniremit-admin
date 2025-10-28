import { X } from "lucide-react";
import React, { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

interface Action {
    label: string;
    onClick?: () => void;
    icon: ReactNode;
}

interface ModalComponentProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    header?: string;
    noHeader?: boolean;
    supplementaryActions?: Action[];
}

const ModalComponent: FC<ModalComponentProps> = ({
    isOpen,
    onClose,
    children,
    header,
    noHeader = false,
    supplementaryActions,
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const actions = useMemo(
        () => [
            ...(supplementaryActions || []),
            {
                label: "Close",
                onClick: onClose,
                icon: <X />,
            },
        ],
        [supplementaryActions],
    );

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
        } else {
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 300); // Match this with your animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isAnimating && !isOpen) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />
            <div
                className={`bg-primary border border-dark rounded-lg shadow-xl m-4 max-w-xl w-full max-h-[80%] overflow-auto transition-all duration-300 relative ${
                    isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
                }`}
            >
                {noHeader ? (
                    <div className="absolute right-3 top-3 shrink-0 gap-x-[10px] flex w-full max-w-[50%]  justify-end">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.onClick}
                                className="hover:bg-dark/50 p-2 rounded-full border border-dark"
                            >
                                {action.icon}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex p-4 gap-3 items-center justify-between border-b border-dark sticky top-0 bg-primary z-10">
                        <div className="w-4/5">
                            <h2 className="truncate font-semibold text-xl">
                                {header || "Alert"}
                            </h2>
                        </div>
                        {/* <button
                            onClick={onClose}
                            className="hover:bg-dark/50 p-2 rounded-lg shrink-0"
                        >
                            <X />
                        </button> */}
                        <div className="shrink-0 gap-x-[10px] flex w-full max-w-[50%]  justify-end">
                            {actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={action.onClick}
                                    className="hover:bg-dark/50 p-2 rounded-full border border-dark"
                                >
                                    {action.icon}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div>{children}</div>
            </div>
        </div>,
        document.body,
    );
};

export default ModalComponent;
