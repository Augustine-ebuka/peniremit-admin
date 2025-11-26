import { Transaction } from "@/utils/types";
import ShortenerComponent from "./shortener.component";
import AssetComponent from "./asset.component";
import TransactionInfo from "./modals/transaction-info";
import icons from "@/components/icon.components";
import { useMemo, useState } from "react";
import { formatTime, formatDate } from "@/utils/app";
import { useModalContext } from "@/_contexts/modal.context";
import { useFetchToken } from "@/utils/hooks/use-fetch-token";
import toast from "react-hot-toast";

const TransactionRow = ({
    transaction,
    refresh,
}: {
    transaction: any;
    refresh?: () => void;
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { fetchTokenByAddress, loading: fetchingToken } = useFetchToken();
    const symbol = "";
    const { assetInfo } = useModalContext();

    const isSwap = useMemo(() => {
        return (
            transaction.transaction_type === "swap" ||
            !!transaction.meta_data?.token_out
        );
    }, [transaction]);

    // Handle different API response shapes for swap vs transfer
    const getAmount = () => {
        if (isSwap) {
            // Swap: use amount_in from meta_data
            return Number(transaction.meta_data?.amount_in || 0).toFixed(5);
        } else {
            // Transfer/Spray/Guest: use received_amount from meta_data
            return Number(transaction.meta_data?.received_amount || 0).toFixed(5);
        }
    };

    const getAmountUsd = () => {
        if (isSwap) {
            // Swap: use amount_in_usd from meta_data
            return Number(transaction.meta_data?.amount_in_usd || 0).toFixed(2);
        } else {
            // Transfer/Spray/Guest: use received_amount_usd from meta_data
            return Number(transaction.meta_data?.received_amount_usd || 0).toFixed(2);
        }
    };

    const fee = Number(transaction.fee).toFixed(5);
    const feeUsd = Number(transaction.meta_data?.fee_usd || 0).toFixed(2);
    const amount = getAmount();
    const amountUsd = getAmountUsd();

    const handleAssetClick = async (tokenAddress: string) => {
        if (!tokenAddress) {
            toast.error("Invalid token address");
            return;
        }
        const tokenData = await fetchTokenByAddress(tokenAddress);
        if (tokenData) {
            assetInfo.open({ token: tokenData, refresh });
        } else {
            toast.error("Failed to load token information");
        }
    };

    return (
        <tr className="text-left border-b border-dark">
            <td className="py-4 px-4">
                <ShortenerComponent
                    onClick={() => setIsModalOpen(true)}
                    value={transaction.hash}
                />
                <TransactionInfo
                    transaction={transaction}
                    isModalOpen={isModalOpen}
                    closeModal={() => setIsModalOpen(false)}
                />
            </td>
            <td className="py-4 px-4 min-w-64">
                <div
                    className={`grid items-center gap-3 ${isSwap ? "grid-cols-[1fr_min-content_1fr]" : ""}`}
                >
                    <div
                        onClick={() =>
                            handleAssetClick(
                                transaction.meta_data?.token_in ||
                                    transaction.token,
                            )
                        }
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <ShortenerComponent
                            value={
                                transaction.meta_data?.token_in ||
                                transaction.token
                            }
                            startChars={8}
                            endChars={6}
                        />
                    </div>

                    {isSwap && (
                        <>
                            <span className="text-neutral-600 flex items-center justify-center">
                                <icons.exchange size={20} />
                            </span>
                            <div
                                onClick={() =>
                                    handleAssetClick(
                                        transaction.meta_data?.token_out,
                                    )
                                }
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <ShortenerComponent
                                    value={transaction.meta_data?.token_out}
                                    startChars={8}
                                    endChars={6}
                                />
                            </div>
                        </>
                    )}
                </div>
            </td>
            <td className="py-4 px-4">
                <div>
                    <p>
                        {amount} {symbol}
                    </p>
                    <p className="text-xs text-neutral-600">${amountUsd}</p>
                </div>
            </td>
            <td className="py-4 px-4">
                <div>
                    <p>
                        {Number(transaction.fee).toFixed(5)} {symbol}
                    </p>
                    <p className="text-xs text-neutral-600">${feeUsd}</p>
                </div>
            </td>
            <td className="py-4 px-4 capitalize">
                {transaction.transaction_type}
            </td>
            <td className="py-4 px-4">
                {formatDate(transaction.date)}
                {", "}
                {formatTime(transaction.date)}
            </td>
        </tr>
    );
};

export default TransactionRow;
