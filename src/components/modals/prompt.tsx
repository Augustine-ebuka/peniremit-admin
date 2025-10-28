import { useState } from "react";
import ModalComponent from "../modal.component";
import { Check, Trash, Warning2 } from "iconsax-react";
import ButtonComponent from "../button.component";
import { useModalContext } from "@/_contexts/modal.context";

interface PromptModalProps {
    onConfirm: () => void;
    type?: "success" | "danger" | "warning";
    icon?: React.ReactNode;
    title: string;
    description: string;
}

export const PromptModalContainer = () => {
    const [args, setArgs] = useState<PromptModalProps>({
        onConfirm: () => {},
        type: "success",
        title: "",
        description: "",
    });
    return {
        Component: () => (
            <PromptModal
                onConfirm={args.onConfirm}
                type={args.type}
                icon={args.icon}
                title={args.title}
                description={args.description}
            />
        ),
        toggle: (t: PromptModalProps) => {
            setArgs(() => t);
        },
    };
};

const PromptModal = ({
    onConfirm,
    type = "success",
    icon,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
}: {
    onConfirm: () => void;
    type?: "success" | "danger" | "warning";
    icon?: React.ReactNode;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
}) => {
    const { prompt } = useModalContext();

    const defaultIcon =
        icon ||
        (type === "success" ? (
            <Check variant="Bold" />
        ) : type === "danger" ? (
            <Trash variant="Bold" />
        ) : type === "warning" ? (
            <Warning2 variant="Bold" />
        ) : null);

    const textColor =
        type === "success"
            ? "text-green"
            : type === "danger"
              ? "text-red"
              : type === "warning"
                ? "text-yellow"
                : "text-primary";

    const bgColor =
        type === "success"
            ? "bg-green/80 hover:bg-green"
            : type === "danger"
              ? "bg-red/80 hover:bg-red"
              : type === "warning"
                ? "bg-yellow/80 hover:bg-yellow"
                : "bg-primary hover:bg-primary/80";

    return (
        <ModalComponent
            isOpen={prompt.isActive}
            onClose={prompt.close}
            noHeader={true}
        >
            <div className="p-4 px-6 flex flex-col gap-4">
                <div className="text-center flex flex-col items-center">
                    <div
                        className={`h-24 w-24 rounded-full flex items-center justify-center ${textColor} bg-dark mb-4`}
                    >
                        {defaultIcon}
                    </div>
                    <h2 className="mb-2 text-xl">{title}</h2>
                    <div className="w-80 text-sm text-neutral-600">
                        {description}
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-full">
                        <ButtonComponent
                            onClick={prompt.close}
                            className={`mt-6 bg-primary text-neutral border-dark border hover:bg-dark/20`}
                        >
                            {cancelText}
                        </ButtonComponent>
                    </div>
                    <div className="w-full">
                        <ButtonComponent
                            onClick={() => {
                                onConfirm();
                                prompt.close();
                            }}
                            className={`mt-6 ${bgColor} text-neutral border-dark border`}
                        >
                            {confirmText}
                        </ButtonComponent>
                    </div>
                </div>
            </div>
        </ModalComponent>
    );
};
