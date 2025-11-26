import { useCallback, useMemo, useState } from "react";
import ActionButton from "./action-button.component";
import AssetComponent from "./asset.component";
import DelistAsset from "./modals/delist-asset";
import RelistAsset from "./modals/relist-asset";
import DeleteAsset from "./modals/delete-asset ";
import { Token } from "@/utils/types";
import { BASE_URL, formatDate } from "@/utils/app";
import { useModalContext } from "@/_contexts/modal.context";
import { Spinner } from "./icons/spinner";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import ShortenerComponent from "./shortener.component";
import { FormatNumber } from "./format-number.component";
const AssetRowComponent = ({
    asset,
    refresh,
    withFees = false,
    showPNL = false,
    index = 1,
    compact = false,
}: {
    asset: Token;
    refresh?: () => void;
    withFees?: boolean;
    index: number;
    showPNL?: boolean;
    compact?: boolean;
}) => {
    const [isDelistModalOpen, setIsDelistModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRelistModalOpen, setIsRelistModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { assetInfo, assetEdit, prompt } = useModalContext();
    const { token } = useSelector((state: RootState) => state.auth);

    const actions = [
        { key: "edit", value: "Edit Token" },
        { key: "delete", value: "Delete Token" },
    ];

    if (withFees) {
        if (asset.metadata?.removeFromFeesCalculation) {
            actions.push({ key: "+_in_fees", value: "Add to fee calculation" });
        } else {
            actions.push({
                key: "-_from_fee",
                value: "Remove from fee calculation",
            });
        }
    }

    const delist = () => {
        console.log("delist");
    };

    const marketPrice = useMemo(() => {
        return (
            Number(asset.marketdata?.price || 0) *
            Number(asset.marketdata?.circulatingSupply || 1)
        );
    }, [asset]);

    const tokenPrice = useMemo(() => {
        return asset.prices?.priceChange24H || 0;
    }, [asset.prices]);

    const toggleRemoveFromFeeCalculation = useCallback(() => {
        setIsLoading(true);
        axios
            .put(
                `${BASE_URL}/api/assets/${asset!.address}/toggle-fee-calculation`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )
            .then(() => {
                refresh && refresh();
            })
            .catch((error) => {
                console.log(error);
                alert("An error occurred");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const handleActionSelect = (key: string) => {
        switch (key) {
            case "edit":
                assetEdit.open({ token: asset, refresh });
                break;
            case "delete":
                setIsDeleteModalOpen(true);
                break;

            case "+_in_fees":
                prompt.open({
                    title: "Add to fee calculation",
                    description:
                        "Are you sure you want to add this asset to fee calculation?",
                    onConfirm: toggleRemoveFromFeeCalculation,
                });
                break;

            case "-_from_fee":
                prompt.open({
                    title: "Remove from fee calculation",
                    type: "danger",
                    description:
                        "Are you sure you want to remove this asset from fee calculation?",
                    onConfirm: toggleRemoveFromFeeCalculation,
                });
                break;
            default:
                console.log("Unknown action selected");
        }
    };

    const handleRefresh = () => {
        refresh && refresh();
    };

    return (
        <tr
            className={`text-left border-b border-dark ${asset.metadata?.removeFromFeesCalculation ? "bg-red/30" : ""}`}
        >
            <td className="py-4 px-4">{index}</td>
            <td className="py-4 px-4">
                <div className="flex">
                    <button className="p-2 cursor-pointer rounded-full hover:bg-dark/30 w-auto">
                        <AssetComponent
                            token={asset}
                            onClick={() =>
                                assetInfo.open({ token: asset, refresh })
                            }
                        />
                    </button>
                </div>
            </td>

            <td className="py-4 px-4">
                <ShortenerComponent
                    value={asset.address}
                    startChars={4}
                    endChars={4}
                />
            </td>

            {compact ? null : (
                <>
                    <td className="py-4 px-4">
                        {showPNL ? (
                            tokenPrice >= 0 ? (
                                <span className="inline-flex items-center text-green-400 pl-1 text-green">
                                    {Number(
                                        asset.prices?.priceChange24H || 0,
                                    ).toFixed(2)}
                                    %
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-red pl-1">
                                    {Number(
                                        asset.prices?.priceChange24H || 0,
                                    ).toFixed(2)}
                                    %
                                </span>
                            )
                        ) : (
                            <FormatNumber
                                value={Number(asset.market_data?.liquidity || 0)}
                                currency="$"
                            />
                        )}
                    </td>
                    {!withFees && (
                        <>
                            <td className="py-4 px-4">
                                <FormatNumber
                                    value={marketPrice}
                                    currency="$"
                                />
                            </td>
                            <td className="py-4 px-4">
                                <FormatNumber
                                    value={Number(
                                        asset.marketdata?.liquidity || 0,
                                    )}
                                    currency="$"
                                />
                            </td>
                            <td className="py-4 px-4">
                                <FormatNumber
                                    value={Number(
                                        asset.marketdata?.circulatingSupply ||
                                            0,
                                    )}
                                />
                            </td>
                        </>
                    )}

                    {withFees && (
                        <td className="py-4 px-4">
                            <FormatNumber value={Number(asset.totalFeeUsd)} />
                        </td>
                    )}
                    <td className="py-4 px-4 w-[50px]">
                        {!isLoading && (
                            <ActionButton
                                actions={actions}
                                onActionSelect={(data) =>
                                    handleActionSelect(data)
                                }
                            />
                        )}

                        {isLoading && <Spinner />}
                        <RelistAsset
                            asset={asset.address}
                            isModalOpen={isRelistModalOpen}
                            closeModal={() => setIsRelistModalOpen(false)}
                            refresh={handleRefresh}
                        />
                        {/* <EditAsset
                    asset={asset}
                    isModalOpen={isEditModalOpen}
                    closeModal={() => setIsEditModalOpen(false)}
                    refresh={handleRefresh}
                /> */}
                        <DelistAsset
                            asset={asset.address}
                            isModalOpen={isDelistModalOpen}
                            closeModal={() => setIsDelistModalOpen(false)}
                            refresh={handleRefresh}
                        />
                        <DeleteAsset
                            asset={asset.address}
                            isModalOpen={isDeleteModalOpen}
                            closeModal={() => setIsDeleteModalOpen(false)}
                            refresh={handleRefresh}
                        />
                    </td>
                </>
            )}
        </tr>
    );
};

export default AssetRowComponent;
