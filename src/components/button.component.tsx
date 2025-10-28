import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    disabled?: boolean;
    className?: string;
}

const ButtonComponent: React.FC<ButtonProps> = ({
    loading,
    disabled,
    className = "",
    children,
    ...buttonProps
}) => {
    return (
        <button
            className={`${className} button ${
                disabled || loading ? "cursor-not-allowed opacity-70" : ""
            }`}
            disabled={disabled || loading}
            {...buttonProps}
        >
            {loading && (
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-x-primary border-y-primary/50 rounded-full"></div>
            )}
            {!loading && children}
        </button>
    );
};

export default ButtonComponent;
