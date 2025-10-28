import React, { useState, useRef, useEffect } from "react";
import { Ellipsis } from "lucide-react";

interface DropdownPosition {
    top: number;
    left: number;
}

interface Action {
    key: string;
    value: string;
}

interface ActionButtonProps {
    actions: Action[];
    onActionSelect: (key: string) => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
    actions,
    onActionSelect,
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const toggleDropdown = (): void => {
        setIsOpen(!isOpen);
    };

    const handleActionClick = (key: string): void => {
        onActionSelect(key);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex">
            <div className="relative">
                <button
                    ref={buttonRef}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="p-3 rounded-lg hover:bg-dark/30"
                    onClick={toggleDropdown}
                >
                    <Ellipsis />
                </button>
                {isOpen && (
                    <div
                        ref={dropdownRef}
                        className="absolute z-20 bg-primary border border-dark divide-y divide-dark rounded-lg shadow-lg overflow-hidden w-60 flex flex-col right-0 mt-3"
                    >
                        {actions.map((action) => (
                            <button
                                key={action.key}
                                className="p-4 text-sm text-white cursor-pointer hover:bg-dark/30 text-left capitalize"
                                onClick={() => handleActionClick(action.key)}
                            >
                                {action.value}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActionButton;
