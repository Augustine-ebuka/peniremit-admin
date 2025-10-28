import ActionButton from "@/components/action-button.component";
import DropdownComponent from "@/components/dropdown.component";
import { BSCIcon } from "@/components/icons/chains/bsc";
import ImageComponent from "@/components/image.component";
import { logOut } from "@/state/slices/auth";
import { RootState } from "@/state/store";
import { ChevronDown } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

type SupportedChains = "BSC";
type Chain = {
    key: SupportedChains;
    value: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
};
const TopLayout = () => {
    const chains = useMemo(
        () => [
            {
                key: "BSC" as const,
                value: "Binance Smart Chain",
                icon: BSCIcon,
            },
        ],
        [],
    );
    const { user, token } = useSelector((state: RootState) => state.auth);
    const [selectedChain, setSelectedChain] = useState<Chain>(chains[0]);
    const dispatch = useDispatch();
    const actions = [{ key: "logout", value: "Logout" }];

    const handleAction = (action: string) => {
        switch (action) {
            case "logout":
                dispatch(logOut());
                break;
            default:
                console.log("Unknown action selected");
        }
    };

    const handleChainChange = useCallback(
        (chain: Chain) => {
            setSelectedChain(chain);
        },
        [chains],
    );

    return (
        <>
            <div className="border-b border-dark fixed top-0 w-full z-10 bg-primary h-20">
                <div className="px-8 py-4 flex justify-between">
                    <div className="flex items-center">
                        <img
                            src="/assets/images/peniwallet.png"
                            alt="Logo"
                            className="w-36"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <DropdownComponent
                            options={chains}
                            renderIcon={() => <></>}
                            renderOption={(option) => (
                                <div className="flex items-center gap-2">
                                    <option.icon />
                                    <span>{option.value}</span>
                                </div>
                            )}
                            className="py-[8px] mb-[8px]"
                            selectedValue={selectedChain}
                            setSelectedValue={(data) => handleChainChange(data)}
                            placeHolder="type"
                        />
                        <div className="flex text-left items-center gap-2 md:gap-4 rounded-xl border hover:bg-dark/20 border-dark pl-1 shrink-0 mb-2">
                            <ImageComponent
                                src={user?.avatarUrl || ""}
                                alt={user?.username || ""}
                                className="rounded-full w-10 h-10"
                            />
                            <span className="hidden md:inline-block">
                                {user?.username}
                            </span>
                            <ActionButton
                                actions={actions}
                                onActionSelect={(action) =>
                                    handleAction(action)
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-20"></div>
        </>
    );
};

export default TopLayout;
