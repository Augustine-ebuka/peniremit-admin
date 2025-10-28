import { Copy, CopyCheck } from "lucide-react";
import React, { FC, useState } from "react";

interface ShortenerComponentProps {
    value: string;
    startChars?: number;
    endChars?: number;
    shorten?: boolean;
    onClick?: () => void;
}

const ShortenerComponent: FC<ShortenerComponentProps> = ({
    value,
    startChars = 12,
    endChars = 10,
    shorten = true,
    onClick,
}) => {
    const [copied, setCopied] = useState(false);

    const shortenAddress = (addr: string): string => {
        if (addr.length <= startChars + endChars) return addr;
        return `${addr.slice(0, startChars)}...${addr.slice(-endChars)}`;
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };

    return (
        <div className="cursor-pointer hover:opacity-80 inline-flex items-center gap-2">
            <button onClick={() => (onClick ? onClick() : copyToClipboard())}>
                {shorten ? shortenAddress(value) : value}
            </button>
            <button
                onClick={copyToClipboard}
                title={copied ? "Copied!" : "Click to copy"}
                className="h-[14px]"
            >
                {copied ? (
                    <CopyCheck size={14} className="text-green" />
                ) : (
                    <Copy size={14} />
                )}
            </button>
        </div>
    );
};

export default ShortenerComponent;
