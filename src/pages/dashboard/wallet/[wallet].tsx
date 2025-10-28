import DropdownComponent from "@/components/dropdown.component";
import { DurationSelectorComponent } from "@/components/duration-selector.component";
import InputComponent from "@/components/input.component";
import PaginationComponent from "@/components/pagination.component";
import ShortenerComponent from "@/components/shortener.component";
import StatComponent from "@/components/stat.component";
import TransactionRow from "@/components/transaction-row.component";
import AuthLayout from "@/layouts/auth.layout";
import { RootState } from "@/state/store";
import { BASE_URL, get } from "@/utils/app";
import useDebounce from "@/utils/hooks/use-debounce";
import { Transaction } from "@/utils/types";
import axios from "axios";
import { endOfDay, startOfDay } from "date-fns";
import {
    ArrowRightLeft,
    ChevronRight,
    Filter,
    Receipt,
    Search,
} from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const now = new Date();

const Wallet = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const wallet = router.query.wallet as string;
    const [transactions, setTransaction] = useState<Transaction[]>([]);
    const [analytics, setAnalytics] = useState({
        totaltransactions: {
            value: 0,
            percentage: 0,
        },
        totalFeeUsd: {
            value: 0,
            percentage: 0,
        },
    });
    const [selectedFilter, setSelectedFilter] = useState<string | null>();
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useSelector((state: RootState) => state.auth);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [meta, setMeta] = useState({
        total: 0,
        lastPage: 1,
    });
    const [duration, setDuration] = useState({
        start: startOfDay(now),
        end: endOfDay(now),
        duration: "today",
    });

    const handlePageChange = (newPage: number, newLimit: number) => {
        setPage(newPage);
        setLimit(newLimit);
    };

    const handleChange = (event: any) => {
        setSearchTerm(event.target.value);
    };

    const getFilter = () => {
        switch (selectedFilter) {
            case "earliest":
                return {
                    order_by: "createdAt",
                    order: "asc",
                };
            case "latest":
                return {
                    order_by: "createdAt",
                    order: "desc",
                };
            default:
                return {
                    order_by: "createdAt",
                    order: "desc",
                };
        }
    };

    const fetchTransactions = async () => {
        axios
            .get(BASE_URL + "/api/transactions", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    s: debouncedSearchTerm,
                    duration_start: duration.start.toISOString(),
                    duration_end: duration.end.toISOString(),
                    wallet,
                    ...getFilter(),
                    page,
                    limit,
                },
            })
            .then((res) => {
                setTransaction(res.data.transactions.data);
                setMeta({
                    total: res.data.transactions.meta.total,
                    lastPage: res.data.transactions.meta.lastPage,
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
            .get(BASE_URL + "/api/transactions/analytics", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    wallet,
                    duration_start: duration.start.toISOString(),
                    duration_end: duration.end.toISOString(),
                },
            })
            .then((res) => {
                const { current, previous } = res.data.analytics;
                setAnalytics({
                    totaltransactions: {
                        value: current.totaltransactions,
                        percentage: Math.round(
                            ((current.totaltransactions -
                                previous.totaltransactions) /
                                (Number(previous.totaltransactions) || 1)) *
                                100,
                        ),
                    },
                    totalFeeUsd: {
                        value: current.totalFeeUsd,
                        percentage: Math.round(
                            ((current.totalFeeUsd - previous.totalFeeUsd) /
                                (Number(previous.totalFeeUsd) || 1)) *
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
    }, [
        debouncedSearchTerm,
        debouncedSearchTerm,
        selectedFilter,
        wallet,
        page,
        limit,
        duration,
    ]);

    return (
        <AuthLayout>
            {/* Heading */}

            <div className="flex md:justify-between md:flex-row flex-col gap-y-[20px]">
                <div>
                    <h2 className="font-medium text-lg flex items-end gap-2">
                        <span className="text-neutral-400">Wallets</span>
                        <span className="py-1.5">
                            <ChevronRight size={16} />
                        </span>
                        <span>Wallet Details</span>
                    </h2>
                    <h4 className="font-light mt-2">
                        <ShortenerComponent shorten={false} value={wallet} />
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

            {/* Stats Cards */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatComponent
                    title="Total Transactions"
                    value={get(analytics?.totaltransactions.value, isLoading)}
                    icon={ArrowRightLeft}
                    percentage={analytics.totaltransactions.percentage}
                />
                <StatComponent
                    title="Total Fees"
                    value={"$" + get(analytics?.totalFeeUsd.value, isLoading)}
                    icon={Receipt}
                    percentage={analytics.totalFeeUsd.percentage}
                />
            </div>

            {/* Table Navigation */}

            <nav className="mt-10">
                <div className="grid grid-cols-4 gap-4 justify-between">
                    <div className="col-span-2 md:col-span-1">
                        <InputComponent
                            prefix={<Search size={20} />}
                            className="w-full shrink-0 placeholder:text-neutral-600"
                            placeholder="Search Transactions"
                            value={searchTerm}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-span-2 md:col-span-3 items-center justify-end">
                        <DropdownComponent
                            options={[null, "latest", "earliest"]}
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

                        {/* <ButtonComponent className="w-auto py-3.5 gap-2">
                            <FileDown size={16} />
                            Export
                        </ButtonComponent> */}
                    </div>
                </div>
            </nav>

            {/* Asset Table */}
            <div className="mt-4 overflow-auto text-sm">
                <table className="w-full min-w-[100px]">
                    <thead>
                        <tr className=" text-left  bg-dark">
                            <th className="min-w-[150px] py-5 px-4 font-medium text-white rounded-tl-lg">
                                Transaction Hash
                            </th>
                            <th className="min-w-[150px] py-5 px-4 font-medium text-white">
                                Asset(s)
                            </th>
                            <th className="min-w-[120px] py-5 px-4 font-medium text-white">
                                Amount
                            </th>
                            <th className="min-w-[120px] py-5 px-4 font-medium text-white">
                                Fee
                            </th>
                            <th className="min-w-[120px] py-5 px-4 font-medium text-white">
                                Type
                            </th>
                            <th className="py-5 px-4 font-medium text-white rounded-tr-lg">
                                Created
                            </th>
                        </tr>
                    </thead>

                    {/* Example Row */}
                    <tbody>
                        {transactions.map((transaction) => (
                            <TransactionRow
                                key={transaction.hash}
                                transaction={transaction}
                            />
                        ))}

                        {transactions.length === 0 && !isLoading && (
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

export default Wallet;
