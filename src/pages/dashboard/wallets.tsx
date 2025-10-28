import AssetComponent from "@/components/asset.component";
import ButtonComponent from "@/components/button.component";
import DropdownComponent from "@/components/dropdown.component";
import { DurationSelectorComponent } from "@/components/duration-selector.component";
import InputComponent from "@/components/input.component";
import PaginationComponent from "@/components/pagination.component";
import ShortenerComponent from "@/components/shortener.component";
import StatComponent from "@/components/stat.component";
import AuthLayout from "@/layouts/auth.layout";
import { RootState } from "@/state/store";
import { BASE_URL, formatDate, formatTime, get } from "@/utils/app";
import useDebounce from "@/utils/hooks/use-debounce";
import { routes } from "@/utils/routes";
import { Wallet } from "@/utils/types";
import axios from "axios";
import { endOfDay, startOfDay } from "date-fns";
import {
    ExternalLink,
    Filter,
    Layers,
    Search,
    Wallet as WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const now = new Date();

const Wallets = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilter, setSelectedFilter] = useState<string | null>();
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const { token } = useSelector((state: RootState) => state.auth);
    const [duration, setDuration] = useState({
        start: startOfDay(now),
        end: endOfDay(now),
        duration: "today",
    });
    const [analytics, setAnalytics] = useState({
        totalWallets: {
            value: 0,
            percentage: 0,
        },
    });
    const router = useRouter();

    const handleChange = (event: any) => {
        setSearchTerm(event.target.value);
    };

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [meta, setMeta] = useState({
        total: 0,
        lastPage: 1,
    });

    const handlePageChange = (newPage: number, newLimit: number) => {
        setPage(newPage);
        setLimit(newLimit);
    };

    const getFilter = () => {
        switch (selectedFilter) {
            case "earliest":
                return {
                    order: "asc",
                };
            case "latest":
                return {
                    order: "desc",
                };
            case "fees":
                return {
                    order_by: "total_fee_usd",
                    order: "desc",
                };
            case "transactions":
                return {
                    order_by: "transaction_count",
                    order: "desc",
                };
            default:
                return {
                    order_by: "transaction_count",
                    order: "desc",
                };
        }
    };

    const fetchTransactions = async () => {
        axios
            .get(BASE_URL + "/api/transactions/wallets", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    duration_start: duration.start.toISOString(),
                    duration_end: duration.end.toISOString(),
                    s: debouncedSearchTerm,
                    ...getFilter(),
                    page,
                    limit,
                },
            })
            .then((res) => {
                setWallets(res.data.wallets.data);
                setMeta({
                    total: res.data.wallets.meta.total,
                    lastPage: res.data.wallets.meta.lastPage,
                });
            })
            .catch((err) => {
                console.log("Error fetching assets: ", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const fetchTransactionsAnalytics = async () => {
        axios
            .get(BASE_URL + "/api/transactions/wallets/analytics", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    duration_start: duration.start.toISOString(),
                    duration_end: duration.end.toISOString(),
                },
            })
            .then((res) => {
                const { current, previous } = res.data.analytics;
                setAnalytics({
                    totalWallets: {
                        value: current.totalWallets,
                        percentage: Math.round(
                            ((current.totalWallets - previous.totalWallets) /
                                (Number(previous.totalWallets) || 1)) *
                                100,
                        ),
                    },
                });
            })
            .catch((err) => {
                console.log("Error fetching analytics: ", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchTransactions();
        fetchTransactionsAnalytics();
    }, [debouncedSearchTerm, selectedFilter, page, limit, duration]);

    return (
        <AuthLayout>
            {/* Heading */}

            <div className="flex md:justify-between md:flex-row flex-col gap-y-[20px]">
                <div>
                    <h2 className="font-medium text-2xl text-white">Wallets</h2>
                    <h4 className="font-light mt-2">
                        Here is a list of all wallets on Peniwallet
                    </h4>
                </div>
                <div className="grid gap-[10px] grid-cols-[max-content_1fr]">
                    <DurationSelectorComponent
                        onUpdated={(d) => {
                            setDuration(d);
                        }}
                    />
                </div>
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatComponent
                    title="Wallets"
                    value={get(analytics.totalWallets.value, isLoading)}
                    icon={WalletIcon}
                    percentage={analytics.totalWallets.percentage}
                />
            </div>

            {/* Table Navigation */}
            <nav className="mt-10">
                <div className="grid grid-cols-[1fr_max-content] gap-4 justify-between">
                    <div className="col-span-2 md:col-span-1 max-w-[500px]">
                        <InputComponent
                            prefix={<Search size={20} />}
                            className="w-full shrink-0 placeholder:text-neutral-600"
                            placeholder="Search Wallet"
                            value={searchTerm}
                            onChange={handleChange}
                        />
                    </div>
                    <div className=" items-center justify-end">
                        <DropdownComponent
                            options={[
                                null,
                                "latest",
                                "earliest",
                                "transactions",
                                "fees",
                            ]}
                            renderIcon={() => <Filter size={16} />}
                            renderOption={(option) => (
                                <span className="capitalize">
                                    {option || "Clear Filter"}
                                </span>
                            )}
                            className="py-3.5"
                            selectedValue={selectedFilter}
                            setSelectedValue={(data) => setSelectedFilter(data)}
                            placeHolder="Filter"
                        />
                    </div>
                </div>
            </nav>

            {/* Asset Table */}
            <div className="mt-2 overflow-auto text-sm">
                <table className="w-full min-w-[100px]">
                    <thead>
                        <tr className=" text-left  bg-dark">
                            <th className="min-w-[150px] py-5 px-4 font-medium text-white rounded-tl-lg">
                                Wallet Address
                            </th>
                            <th className="min-w-[150px] py-5 px-4 font-medium text-white">
                                Fees
                            </th>
                            <th className="min-w-[120px] py-5 px-4 font-medium text-white">
                                Transactions
                            </th>
                            <th className="min-w-[120px] py-5 px-4 font-medium text-white">
                                Created
                            </th>
                            <th className="py-5 px-4 text-center font-medium text-white w-[200px] rounded-tr-lg">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    {/* Asset Rows */}
                    {/* Example Row */}
                    <tbody>
                        {wallets.map((wallet, index) => (
                            <tr className="text-left border-b border-dark">
                                <td className="py-5 px-4">
                                    <ShortenerComponent
                                        value={wallet.address}
                                        onClick={() =>
                                            router.push(
                                                routes.dashboard.wallet(
                                                    wallet.address,
                                                ),
                                            )
                                        }
                                    />
                                </td>
                                <td className="py-4 px-4">
                                    ${wallet.total_fee_usd}
                                </td>
                                <td className="py-4 px-4">
                                    {wallet.transaction_count}
                                </td>
                                <td className="py-4 px-4">
                                    {formatDate(wallet.created_at)}
                                    {", "}
                                    {formatTime(wallet.created_at)}
                                </td>
                                <td className="py-4 px-4 w-[200px] text-center">
                                    <div className="items-center flex justify-center">
                                        <Link
                                            className="p-3 flex items-center gap-2 rounded-lg hover:bg-dark/30"
                                            href={routes.dashboard.wallet(
                                                wallet.address,
                                            )}
                                        >
                                            <ExternalLink size={16} />
                                            View
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {wallets.length === 0 && !isLoading && (
                            <tr>
                                <td
                                    colSpan={100}
                                    className="text-center text-neutral-600 text-sm py-6 border-b border-dark"
                                >
                                    There is nothing here yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div>
                <PaginationComponent
                    meta={meta}
                    page={page}
                    limit={limit}
                    onPageChange={handlePageChange}
                />
            </div>
        </AuthLayout>
    );
};

export default Wallets;
