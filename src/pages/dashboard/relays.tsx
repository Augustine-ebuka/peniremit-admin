import DropdownComponent from "@/components/dropdown.component";
import InputComponent from "@/components/input.component";
import RelayTopup from "@/components/modals/relay-topup";
import PaginationComponent from "@/components/pagination.component";
import ShortenerComponent from "@/components/shortener.component";
import StatComponent from "@/components/stat.component";
import AuthLayout from "@/layouts/auth.layout";
import { RootState } from "@/state/store";
import { BASE_URL, get } from "@/utils/app";
import useDebounce from "@/utils/hooks/use-debounce";
import { routes } from "@/utils/routes";
import { Relay, RelayAnalytics } from "@/utils/types";
import axios from "axios";
import { ArrowRightLeft, Filter, Plus, Radius, Search } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Relays = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilter, setSelectedFilter] = useState<string | null>();
    const [relays, setRelays] = useState<Relay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const { token } = useSelector((state: RootState) => state.auth);
    const [analytics, setAnalytics] = useState<RelayAnalytics>();

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
                    order_by: "created_at",
                    order: "asc",
                };
            case "latest":
                return {
                    order_by: "created_at",
                    order: "desc",
                };
            default:
                return {
                    order_by: "created_at",
                    order: "desc",
                };
        }
    };

    const fetchRelays = async () => {
        axios
            .get(BASE_URL + "/api/relays", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    s: debouncedSearchTerm,
                    ...getFilter(),
                    page,
                    limit,
                },
            })
            .then((res) => {
                setRelays(res.data.relays.data);
                setMeta({
                    total: res.data.relays.meta.total,
                    lastPage: res.data.relays.meta.lastPage,
                });
            })
            .catch((err) => {
                console.log("Error fetching relays: ", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const fetchRelayAnalytics = async () => {
        axios
            .get(BASE_URL + "/api/relays/analytics", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setAnalytics(res.data.analytics);
            })
            .catch((err) => {
                console.log("Error fetching analytics: ", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchRelays();
        fetchRelayAnalytics();
    }, [debouncedSearchTerm, selectedFilter, page, limit]);

    return (
        <AuthLayout>
            {/* Heading */}
            <div>
                <h2 className="font-medium text-2xl text-white">Relays</h2>
                <h4 className="font-light mt-2">
                    Here is a list of all relays on Peniwallet
                </h4>
            </div>

            {/* Stats Cards */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatComponent
                    title="Total Relays"
                    value={get(analytics?.totalRelays, isLoading)}
                    icon={Radius}
                />
                <StatComponent
                    title="Total Relay Transactions"
                    value={get(analytics?.totalTransactions, isLoading)}
                    icon={ArrowRightLeft}
                />
            </div>

            {/* Table Navigation */}
            <nav className="mt-10">
                <div className="grid grid-cols-4 gap-4 justify-between">
                    <div className="col-span-1">
                        <InputComponent
                            prefix={<Search size={20} />}
                            className="w-full shrink-0 placeholder:text-neutral-600"
                            placeholder="Search Assets"
                            value={searchTerm}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-span-3">
                        <DropdownComponent
                            options={[null, "latest", "earliest", "fees"]}
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

            {/* Relay Table */}
            <div className="mt-2 overflow-auto text-sm">
                <table className="w-full min-w-[100px]">
                    <thead>
                        <tr className=" text-left  bg-dark">
                            <th className="min-w-[150px] py-5 px-4 font-medium text-white rounded-tl-lg">
                                Relay
                            </th>
                            <th className="min-w-[150px] py-5 px-4 font-medium text-white">
                                Balance
                            </th>
                            <th className="min-w-[120px] py-5 px-4 font-medium text-white">
                                Transactions
                            </th>
                            <th className="py-5 px-4 text-center font-medium text-white w-[200px] rounded-tr-lg">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    {/* Asset Rows */}
                    {/* Example Row */}
                    <tbody>
                        {relays.map((relay) => (
                            <RelayRow key={relay.id} relay={relay} />
                        ))}
                        {relays.length === 0 && !isLoading && (
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
            {/* Pagination */}
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

export default Relays;

const RelayRow = ({ relay }: { relay: Relay }) => {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <tr className="text-left border-b border-dark">
            <td className="py-5 px-4">
                <ShortenerComponent
                    onClick={() => {
                        router.push(routes.dashboard.relay(relay.id));
                    }}
                    value={relay.id}
                />
            </td>
            <td className="py-4 px-4">
                <div>
                    <p>{relay.balance} BNB</p>
                    <p className="text-xs text-neutral-600">
                        ${relay.balanceUSD}
                    </p>
                </div>
            </td>
            <td className="py-4 px-4">{relay.totalTransactions}</td>
            <td className="py-4 px-4 w-[200px]">
                <div className="flex justify-center">
                    <button
                        className="p-3 flex items-center gap-2 rounded-lg hover:bg-dark/30"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={18} />
                        Top Up Relay
                    </button>
                    <RelayTopup
                        address={relay.id}
                        isModalOpen={isModalOpen}
                        closeModal={() => setIsModalOpen(false)}
                    />
                </div>
            </td>
        </tr>
    );
};
