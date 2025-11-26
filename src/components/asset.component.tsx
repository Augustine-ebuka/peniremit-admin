import React from "react";
import ImageComponent from "./image.component";
import { Token } from "@/utils/types";

const AssetComponent = ({
    token,
    onClick,
}: {
    token: Token;
    onClick: (token: Token) => void;
}) => {
    const t: any = token as any;
    const src = t?.logoUrl || t?.metadata?.logo_url || t?.metadata?.logoUrl || "";
    const alt = t?.symbol || t?.name || "";

    return (
        <div
            className="font-light text-neutral flex flex-row items-center text-sm cursor-pointer"
            onClick={() => onClick(token)}
        >
            <ImageComponent
                className="flex-shrink-0 h-10 w-10 rounded-full"
                src={src}
                alt={alt}
            />
            <div className="flex flex-col">
                <p className="text-white text-sm px-2 ">{token?.name}</p>
                {true && (
                    <p className="text-neutral-400 text-xs px-2 text-left">
                        {token?.symbol}
                    </p>
                )}
            </div>
        </div>
    );
};

export default AssetComponent;
