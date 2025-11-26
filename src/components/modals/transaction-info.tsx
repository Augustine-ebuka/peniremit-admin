import React, { ReactNode } from "react";
import ModalComponent from "../modal.component";
import { ArrowSwapHorizontal, MoneySend } from "iconsax-react";
import ShortenerComponent from "../shortener.component";
import { ExternalLink } from "lucide-react";
import icon from "../icon.components";
import { Transaction } from "@/utils/types";
import { useRouter } from "next/router";
import { routes } from "@/utils/routes";

interface TransactionInfoProps {
    isModalOpen: boolean;
    closeModal: () => void;
    transaction: any;
}

const TransactionInfo: React.FC<TransactionInfoProps> = ({
    isModalOpen,
    closeModal,
    transaction,
}) => {
    let type = transaction.transaction_type;
    const fee = Number(transaction.fee).toFixed(5);
    const calculateFeeUsd =
        Number(transaction.fee) *
        Number(transaction.meta_data.amount_in_usd || 1);
    const feeUsd = Number(calculateFeeUsd).toFixed(2);
    const amount = Number(transaction.amount).toFixed(5);
    const calculateAmountUsd =
        Number(transaction.amount) *
        Number(transaction.meta_data.amount_in_usd || 1);
    const amountUsd = Number(calculateAmountUsd).toFixed(2);
    const symbol = "";
    const router = useRouter();
    return (
        <ModalComponent isOpen={isModalOpen} onClose={closeModal} noHeader>
            <div className="flex flex-col px-6 py-6 overflow-scroll">
                <div className="flex flex-col gap-4">
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-dark">
                        {type === "transfer" && (
                            <MoneySend
                                size={24}
                                variant="Bold"
                                className="text-green"
                            />
                        )}
                        {type === "spray" && (
                            <icon.spray
                                size={24}
                                variant="Bold"
                                className="text-green"
                            />
                        )}
                        {type === "swap" && (
                            <ArrowSwapHorizontal
                                size={24}
                                variant="Bold"
                                className="text-green"
                            />
                        )}
                    </div>
                    <div className="flex justify-between">
                        <div className="text-left w-full">
                            <span className="block font-medium text-[#F4F6FA]">
                                Transaction Id:
                            </span>
                            <span className="block text-xs mt-1 font-light text-[#C1C4D6]">
                                <ShortenerComponent value={transaction.hash} />
                            </span>
                        </div>
                        <div className="shrink-0">
                            <a
                                target="_blank"
                                href={
                                    "https://bscscan.com/tx/" + transaction.hash
                                }
                                className="text-sm flex items-center p-3 hover:bg-dark/30 rounded-md border border-dark"
                            >
                                <ExternalLink size={14} />
                                <span className="px-2">Open Explorer</span>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="border border-dashed border-dark w-full my-4" />
                <table className="table-fixed">
                    <tbody className="flex flex-col gap-8">
                        <ContractDetailRow
                            label="Transaction Type:"
                            value={<span className="capitalize">Transfer</span>}
                        />
                        <ContractDetailRow
                            label={type === "swap" ? "Asset From:" : "Asset:"}
                            value={
                                <div>
                                    <div>
                                        {/* {transaction.} ({""}) */}
                                    </div>
                                    <div className="text-sm">
                                        <ShortenerComponent
                                            value={transaction.from_address}
                                        />
                                    </div>
                                </div>
                            }
                        />
                        {transaction.swapTokenInformation && (
                            <ContractDetailRow
                                label={"Asset To:"}
                                value={
                                    <div>
                                        <div>
                                            {
                                                transaction.swapTokenInformation
                                                    .name
                                            }{" "}
                                            (
                                            {
                                                transaction.swapTokenInformation
                                                    .symbol
                                            }
                                            )
                                        </div>
                                        <div className="text-sm">
                                            <ShortenerComponent
                                                value={
                                                    transaction
                                                        .swapTokenInformation
                                                        .address
                                                }
                                            />
                                        </div>
                                    </div>
                                }
                            />
                        )}
                        <ContractDetailRow
                            label="Amount:"
                            value={
                                <span>
                                    <span>
                                        {Number(transaction.meta_data.received_amount).toFixed(5)} {symbol}
                                    </span>{" "}
                                    <span className="text-xs text-neutral-400">
                                        (${transaction.meta_data.received_amount_usd})
                                    </span>
                                </span>
                            }
                        />
                        <ContractDetailRow
                            label="Fees:"
                            value={
                                <span>
                                    <span>
                                        {fee} {symbol}
                                    </span>{" "}
                                    <span className="text-xs text-neutral-400">
                                        (${feeUsd})
                                    </span>
                                </span>
                            }
                        />
                        <ContractDetailRow
                            label="Receiver Address:"
                            value={
                                <span className="text-xs">
                                    <ShortenerComponent
                                        shorten={false}
                                        onClick={() =>
                                            router.push(
                                                routes.dashboard.wallet(
                                                    transaction.to_address,
                                                ),
                                            )
                                        }
                                        value={transaction.to_address}
                                    />
                                </span>
                            }
                        />
                        <ContractDetailRow
                            label="Sender Address:"
                            value={
                                <span className="text-xs">
                                    <ShortenerComponent
                                        shorten={false}
                                        onClick={() =>
                                            router.push(
                                                routes.dashboard.wallet(
                                                    transaction.from_address,
                                                ),
                                            )
                                        }
                                        value={transaction.from_address}
                                    />
                                </span>
                            }
                        />
                    </tbody>
                </table>
            </div>
        </ModalComponent>
    );
};

const ContractDetailRow = ({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) => (
    <tr className="text-left text-sm">
        <td className="text-left w-[170px]">{label}</td>
        <td className="text-left text-sm text-[#C1C4D6]">{value}</td>
    </tr>
);

export default TransactionInfo;
