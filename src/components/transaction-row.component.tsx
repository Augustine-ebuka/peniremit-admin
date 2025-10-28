import { Transaction } from "@/utils/types";
import ShortenerComponent from "./shortener.component";
import AssetComponent from "./asset.component";
import TransactionInfo from "./modals/transaction-info";
import icons from "@/components/icon.components";
import { useMemo, useState } from "react";
import { formatTime, formatDate } from "@/utils/app";
import { useModalContext } from "@/_contexts/modal.context";

const TransactionRow = ({
    transaction,
    refresh,
}: {
    transaction: Transaction;
    refresh?: () => void;
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fee = Number(transaction.fee).toFixed(5);
    const calculateFeeUsd =
        Number(transaction.fee) *
        Number(transaction.tokenInformation.marketdata?.price || 1);
    const feeUsd = Number(calculateFeeUsd).toFixed(2);
    const amount = Number(transaction.amount).toFixed(5);
    const calculateAmountUsd =
        Number(transaction.amount) *
        Number(transaction.tokenInformation.marketdata?.price || 1);
    const amountUsd = Number(calculateAmountUsd).toFixed(2);
    const symbol = transaction.tokenInformation.symbol;
    const { assetInfo } = useModalContext();

    const isSwap = useMemo(() => {
        return (
            transaction.swapTokenInformation &&
            transaction.transactionType === "swap"
        );
    }, [transaction]);

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
                    <AssetComponent
                        token={transaction.tokenInformation}
                        onClick={(token) => {
                            assetInfo.open({ token, refresh });
                        }}
                    />
                    {isSwap && (
                        <>
                            <span className="text-neutral-600 flex items-center justify-center">
                                <icons.exchange size={20} />
                            </span>
                            <AssetComponent
                                token={transaction.swapTokenInformation!}
                                onClick={(token) => {
                                    assetInfo.open({ token, refresh });
                                }}
                            />
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
                        {fee} {symbol}
                    </p>
                    <p className="text-xs text-neutral-600">${feeUsd}</p>
                </div>
            </td>
            <td className="py-4 px-4 capitalize">
                {transaction.transactionType}
            </td>
            <td className="py-4 px-4">
                {formatDate(transaction.createdAt)}
                {", "}
                {formatTime(transaction.createdAt)}
            </td>
        </tr>
    );
};

export default TransactionRow;
