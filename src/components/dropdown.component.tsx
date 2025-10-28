import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DropdownComponentProps<T> {
    selectedValue: T;
    setSelectedValue: (value: T) => void;
    options: T[];
    renderOption: (option: T) => React.ReactNode;
    renderIcon: () => React.ReactNode;
    className?: string;
    placeHolder?: string;
}

const DropdownComponent = <T,>({
    selectedValue,
    setSelectedValue,
    options,
    renderOption,
    renderIcon,
    className,
    placeHolder,
}: DropdownComponentProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);

    const menuRef = useRef<any>(null);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (value: T) => {
        setSelectedValue(value);
        setIsOpen(false);
    };

    return (
        <div className="relative flex items-center justify-end gap-2">
            <button
                onMouseDown={(e) => e.stopPropagation()}
                className={`flex gap-4 items-center px-4 border border-dark rounded-lg ${className ? className : ""}`}
                onClick={toggleDropdown}
            >
                {renderIcon && renderIcon()}
                <span className="text-center text-sm leading-none textneutral">
                    {selectedValue
                        ? renderOption(selectedValue)
                        : placeHolder
                          ? placeHolder
                          : "Select"}
                </span>
                {isOpen ? (
                    <ChevronUp className="text-neutral" />
                ) : (
                    <ChevronDown className="text-neutral" />
                )}
            </button>
            {isOpen && (
                <ul
                    className="absolute right-0 top-full mt-2.5 bg-primary border border-dark divide-y divide-dark rounded-lg shadow-lg overflow-hidden w-[250px] z-40"
                    ref={menuRef}
                >
                    {options.map((option, index) => (
                        <li
                            key={index}
                            className={`p-4 text-sm text-white cursor-pointer hover:bg-dark/30 ${
                                option === selectedValue ? "bg-dark/70" : ""
                            }`}
                            onClick={() => handleSelect(option)}
                        >
                            {renderOption(option)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DropdownComponent;
