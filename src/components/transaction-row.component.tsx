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
    const fee = Number(transaction.fee).toFixed(5);
    const calculateFeeUsd = Number(transaction.fee) * Number(transaction.meta_data.amount_in_usd || 1);
    const feeUsd = Number(calculateFeeUsd).toFixed(2);
    const amount = Number(transaction.amount_usd).toFixed(5);
    const calculateAmountUsd = Number(transaction.amount_usd) * Number(transaction.meta_data.amount_in_usd || 1);
    const amountUsd = Number(calculateAmountUsd).toFixed(2);
    const symbol = "";
    const { assetInfo } = useModalContext();

    const isSwap = useMemo(() => {
        return transaction.transaction_type === "swap" || !!transaction.meta_data?.token_out;
    }, [transaction]);

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
                                    transaction.token
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
                                        transaction.meta_data?.token_out
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
                        {Number(transaction.amount_usd).toFixed(5)} {symbol}
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
