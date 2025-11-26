import DropdownComponent from "@/components/dropdown.component";
import { DurationSelectorComponent } from "@/components/duration-selector.component";
import icons from "@/components/icon.components";
import InputComponent from "@/components/input.component";
import PaginationComponent from "@/components/pagination.component";
import StatComponent from "@/components/stat.component";
import TransactionRow from "@/components/transaction-row.component";
import AuthLayout from "@/layouts/auth.layout";
import { RootState } from "@/state/store";
import { BASE_URL, get } from "@/utils/app";
import useDebounce from "@/utils/hooks/use-debounce";
import { Transaction } from "@/utils/types";
import axios from "axios";
import { endOfDay, startOfDay } from "date-fns";
import { ArrowRightLeft, Search, SortAsc, SortDesc, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "@/lib/api";

type TransactionType = "all" | "transfer" | "swap" | "spray";
type TransactionAggregateMethod = "count" | "sum";

const now = new Date();

const Transactions = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [transactions, setTransaction] = useState<Transaction[]>([]);
    const [analytics, setAnalytics] = useState({
        totaltransactions: {
            value: 0,
            percentage: 0,
        },
        totaltransfers: { value: 0, percentage: 0 },
        totalswaps: { value: 0, percentage: 0 },
        totalsprays: { value: 0, percentage: 0 },
        totalFeeUsd: { value: 0, percentage: 0 },
    });
    const [selectedFilter, setSelectedFilter] = useState<string | null>();
    const [aggregateMethod, setAggregateMethod] =
        useState<TransactionAggregateMethod>("sum");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useSelector((state: RootState) => state.auth);
    const [type, setType] = useState<TransactionType>("all");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [meta, setMeta] = useState({
        total: 0,
        lastPage: 1,
    });
    const [duration, setDuration] = useState({
        start: startOfDay(now),
        end: endOfDay(now),
        duration: "last 7days",
    });

    const handlePageChange = (newPage: number, newLimit: number) => {
        setPage(newPage);
        setLimit(newLimit);
    };

    const handleChange = (event: any) => {
        setSearchTerm(event.target.value);
    };

    const getFilter = () => {
        const typeFilter = type === "all" ? {} : { type };
        switch (selectedFilter) {
            case "earliest":
                return {
                    order_by: "createdAt",
                    order: "asc",
                    ...typeFilter,
                };
            case "latest":
                return {
                    order_by: "createdAt",
                    order: "desc",
                    ...typeFilter,
                };
            case "largest":
                return {
                    order_by: "erc20_amount_usd",
                    order: "desc",
                    ...typeFilter,
                };
            case "smallest":
                return {
                    order_by: "erc20_amount_usd",
                    order: "asc",
                    ...typeFilter,
                };
            default:
                return {
                    order_by: "createdAt",
                    order: "desc",
                    ...typeFilter,
                };
        }
    };

    // const fetchTransactions = async () => {
    //     axios
    //         .get(BASE_URL + "/transactions", {
    //             headers: { Authorization: `Bearer ${token}` },
    //             params: {
    //                 duration_start: duration.start.toISOString(),
    //                 duration_end: duration.end.toISOString(),
    //                 s: debouncedSearchTerm,
    //                 ...getFilter(),
    //                 page,
    //                 limit,
    //             },
    //         })
    //         .then((res) => {
    //             setTransaction(res.data.data.transactions);
    //             setMeta({
    //                 total: res.data.data.pagination.total_pages,
    //                 lastPage: res.data.data.pagination.page_size,
    //             });
    //         })
    //         .catch((err) => {
    //             console.log("Error fetching assets: ", err);
    //         })
    //         .finally(() => {
    //             setIsLoading(false);
    //         });
    // };

    const fetchTransactions = async () => {
    api.get("/transactions", {
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
        setTransaction(res.data.data.transactions);
        setMeta({
            total: res.data.data.pagination.total_pages,
            lastPage: res.data.data.pagination.page_size,
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
        api.get("/transactions/stats", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    duration_start: duration.start.toISOString(),
                    duration_end: duration.end.toISOString(),
                    aggregateMethod: aggregateMethod,
                },
            })
            .then((res) => {
                const data = res.data.data;

                // Calculate total transactions across all types
                const totalTransactions =
                    data.total_guest_transactions +
                    data.total_spray_transactions +
                    data.total_swap_transactions +
                    data.total_transfer_transactions;

                // Calculate total amount across all types
                const totalAmount =
                    parseFloat(data.total_guest_amount || 0) +
                    parseFloat(data.total_spray_amount || 0) +
                    parseFloat(data.total_swap_amount || 0) +
                    parseFloat(data.total_transfer_amount || 0);

                // Calculate total percentage change
                const totalChangePercentage =
                    ((data.total_guest_transaction_increase_this_range || 0) +
                    (data.total_spray_transaction_increase_this_range || 0) +
                    (data.total_swap_transaction_increase_this_range || 0) +
                    (data.total_transfer_transaction_increase_this_range || 0)) / 4;

                setAnalytics({
                    totaltransactions: {
                        value: totalTransactions,
                        percentage: Math.round(totalChangePercentage),
                    },
                    totaltransfers: {
                        value: aggregateMethod === "sum"
                            ? parseFloat(data.total_transfer_amount || 0)
                            : data.total_transfer_transactions,
                        percentage: Math.round(data.total_transfer_transaction_increase_this_range || 0),
                    },
                    totalswaps: {
                        value: aggregateMethod === "sum"
                            ? parseFloat(data.total_swap_amount || 0)
                            : data.total_swap_transactions,
                        percentage: Math.round(data.total_swap_transaction_increase_this_range || 0),
                    },
                    totalsprays: {
                        value: aggregateMethod === "sum"
                            ? parseFloat(data.total_spray_amount || 0)
                            : data.total_spray_transactions,
                        percentage: Math.round(data.total_spray_transaction_increase_this_range || 0),
                    },
                    totalFeeUsd: {
                        value: aggregateMethod === "sum" ? totalAmount : totalTransactions,
                        percentage: Math.round(totalChangePercentage),
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
        page,
        limit,
        type,
        duration,
        aggregateMethod,
    ]);

    return (
        <AuthLayout>
            {/* Heading */}

            <div className="flex md:justify-between md:flex-row flex-col gap-y-[20px]">
                <div>
                    <h2 className="font-medium text-2xl text-white">
                        Transactions
                    </h2>
                    <h4 className="font-light mt-2">
                        Here is a list of all transactions carried out on
                        Peniwallet
                    </h4>
                </div>
                <div className="grid gap-[10px] grid-cols-[max-content_1fr]">
                    <DropdownComponent
                        options={["count", "sum"]}
                        renderIcon={() => <></>}
                        renderOption={(option) => (
                            <span className="">
                                Volume by
                                {option === "count" ? " number" : " amount"}
                            </span>
                        )}
                        className="py-3.5"
                        selectedValue={aggregateMethod}
                        setSelectedValue={(data: TransactionAggregateMethod) =>
                            setAggregateMethod(data)
                        }
                        placeHolder="Aggregate"
                    />
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
                    currency={aggregateMethod === "sum" ? "$" : ""}
                    title="Total Transactions"
                    value={get(analytics.totaltransactions.value, isLoading)}
                    percentage={analytics.totaltransactions.percentage}
                    icon={ArrowRightLeft}
                    onClick={() => setType("all")}
                />
                <StatComponent
                    currency={aggregateMethod === "sum" ? "$" : ""}
                    title="Total Transfer"
                    value={get(analytics.totaltransfers.value, isLoading)}
                    percentage={analytics.totaltransfers.percentage}
                    icon={icons.transfer}
                    onClick={() => setType("transfer")}
                />
                <StatComponent
                    currency={aggregateMethod === "sum" ? "$" : ""}
                    title="Total Swap"
                    value={get(analytics.totalswaps.value, isLoading)}
                    percentage={analytics.totalswaps.percentage}
                    icon={icons.swap}
                    onClick={() => setType("swap")}
                />
                <StatComponent
                    currency={aggregateMethod === "sum" ? "$" : ""}
                    title="Total Spray"
                    value={get(analytics.totalsprays.value, isLoading)}
                    percentage={analytics.totalsprays.percentage}
                    icon={Users}
                    onClick={() => setType("spray")}
                />
            </div>

            {/* Table Navigation */}

            <nav className="mt-10">
                <div className="grid grid-cols-[1fr_max-content] gap-4 justify-between">
                    <div className="col-span-2 md:col-span-1 max-w-[500px]">
                        <InputComponent
                            prefix={<Search size={20} />}
                            className="w-full shrink-0 placeholder:text-neutral-600"
                            placeholder="Search Transactions"
                            value={searchTerm}
                            onChange={handleChange}
                        />
                    </div>

                    <div className=" items-center justify-end flex gap-4">
                        <DropdownComponent
                            options={["all", "transfer", "swap", "spray"]}
                            renderIcon={() => <></>}
                            renderOption={(option) => (
                                <span className="capitalize">
                                    {option || "Clear sort"}
                                </span>
                            )}
                            className="py-3.5"
                            selectedValue={type}
                            setSelectedValue={(data) =>
                                setType(data as TransactionType)
                            }
                            placeHolder="Type"
                        />
                        <DropdownComponent
                            options={[
                                null,
                                "latest",
                                "earliest",
                                "largest",
                                "smallest",
                            ]}
                            renderIcon={() => (
                                <>
                                    {selectedFilter === "earliest" && (
                                        <SortAsc size={16} />
                                    )}
                                    {selectedFilter === "latest" && (
                                        <SortDesc size={16} />
                                    )}
                                </>
                            )}
                            renderOption={(option) => (
                                <span className="capitalize">
                                    {option || "Clear sort"}
                                </span>
                            )}
                            className="py-3.5"
                            selectedValue={selectedFilter}
                            setSelectedValue={(data) => setSelectedFilter(data)}
                            placeHolder="Sort"
                        />
                    </div>
                </div>
            </nav>

            {/* Asset Table */}
            <div className="mt-4 overflow-auto text-sm">
                <table className="w-full min-w-[100px]">
                    <thead className="">
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
                                refresh={() => {
                                    fetchTransactions();
                                    fetchTransactionsAnalytics();
                                }}
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
export default Transactions;
