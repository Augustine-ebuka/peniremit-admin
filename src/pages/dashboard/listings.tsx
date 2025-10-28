import AssetComponent from "@/components/asset.component";
import DropdownComponent from "@/components/dropdown.component";
import InputComponent from "@/components/input.component";
import ListingRow from "@/components/listing-row.component";
import PaginationComponent from "@/components/pagination.component";
import TabView from "@/components/tabview.component";
import AuthLayout from "@/layouts/auth.layout";
import { RootState } from "@/state/store";
import { BASE_URL, formatDate, formatTime, handleError } from "@/utils/app";
import useDebounce from "@/utils/hooks/use-debounce";
import useToast from "@/utils/hooks/use-toast";
import { routes } from "@/utils/routes";
import {
    AssetAnalytics,
    FetchedListing,
    Listing,
    Tab,
    Token,
} from "@/utils/types";
import axios from "axios";
import { produce } from "immer";
import { Check, Ellipsis, Filter, Search, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import router from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const initTabs: Tab[] = [
    { id: "pending", label: "Pending Listings", count: 0 },
    { id: "rejected", label: "Rejected Listings", count: 0 },
];

const Listings = () => {
    const [selectedTab, setSelectedTab] = useState<string>("pending");
    const searchParams = useSearchParams();
    const search = searchParams.get("s");
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [isLoading, setIsLoading] = useState(true);
    const [listings, setListings] = useState<FetchedListing[]>([]);
    const [rejectedListings, setRejectedListings] = useState<FetchedListing[]>(
        [],
    );
    const [tabs, setTabs] = useState(initTabs);
    const [selectedFilter, setSelectedFilter] = useState<string | null>();
    const { token } = useSelector((state: RootState) => state.auth);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const activeListings =
        selectedTab === "pending" ? listings : rejectedListings;

    const handleChange = (event: any) => {
        setSearchTerm(event.target.value);
    };
    const handleTabSelect = (tabId: string) => {
        setSelectedTab(tabId);
    };

    const [pendingPage, setPendingPage] = useState(1);
    const [pendingLimit, setPendingLimit] = useState(10);
    const [pendingMeta, setPendingMeta] = useState({
        total: 0,
        lastPage: 1,
    });

    const [rejectedPage, setRejectedPage] = useState(1);
    const [rejectedLimit, setRejectedLimit] = useState(10);
    const [rejectedMeta, setRejectedMeta] = useState({
        total: 0,
        lastPage: 1,
    });

    const handlePendingPageChange = (page: number, limit: number) => {
        setPendingPage(page);
        setPendingLimit(limit);
    };

    const handleRejectedPageChange = (page: number, limit: number) => {
        setRejectedPage(page);
        setRejectedLimit(limit);
    };

    const setTabCount = (tab: string, count: number) => {
        setTabs((prev) =>
            produce(prev, (draft) => {
                const d = draft.findIndex((t) => t.id === tab);
                if (d !== -1) {
                    draft[d].count = count;
                }
            }),
        );
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

    const loadListings = () => {
        axios
            .get(BASE_URL + "/api/listings", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    status: "pending",
                    s: debouncedSearchTerm,
                    ...getFilter(),
                    page: pendingPage,
                    limit: pendingLimit,
                },
            })
            .then((res) => {
                setListings(res.data.listings.data);
                setTabCount("pending", res.data.listings.meta.total);
                setPendingMeta({
                    total: res.data.listings.meta.total,
                    lastPage: res.data.listings.meta.lastPage,
                });
            })
            .catch((err) => {
                console.log("Error fetching assets: ", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const loadRejectedListings = () => {
        axios
            .get(BASE_URL + "/api/listings", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    status: "rejected",
                    s: debouncedSearchTerm,
                    ...getFilter(),
                    page: rejectedPage,
                    limit: rejectedLimit,
                },
            })
            .then((res) => {
                setRejectedListings(res.data.listings.data);
                setTabCount("rejected", res.data.listings.meta.total);
                setRejectedMeta({
                    total: res.data.listings.meta.total,
                    lastPage: res.data.listings.meta.lastPage,
                });
            })
            .catch((err) => {
                console.log("Error fetching assets: ", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        if (search) {
            router.replace(routes.dashboard.assets);
        }
    }, [search]);

    const reload = () => {
        loadListings();
        loadRejectedListings();
    };

    useEffect(() => {
        loadListings();
        loadRejectedListings();
    }, [
        debouncedSearchTerm,
        selectedFilter,
        pendingPage,
        pendingLimit,
        rejectedPage,
        rejectedLimit,
    ]);

    return (
        <AuthLayout>
            {/* Heading */}
            <div>
                <h2 className="font-medium text-2xl text-white">Listings</h2>
                <h4 className="font-light mt-2">
                    Here is a list of all projects on Peniwallet
                </h4>
            </div>

            {/* Table Navigation */}

            <nav className="mt-10">
                <div className="grid grid-cols-4 gap-4 justify-between">
                    <div className="col-span-2 md:col-span-1">
                        <InputComponent
                            prefix={<Search size={20} />}
                            className="w-full shrink-0 placeholder:text-neutral-600"
                            placeholder="Search Listings"
                            value={searchTerm}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-span-2 md:col-span-3">
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
                    </div>
                </div>

                <div className="overflow-x-auto mt-4">
                    <TabView
                        tabs={tabs}
                        selectedTab={selectedTab}
                        onTabSelect={handleTabSelect}
                        loading={isLoading}
                    />
                </div>
            </nav>

            {/* Asset Table */}
            <div className="mt-4 overflow-auto text-sm">
                <table className="w-full min-w-[100px]">
                    <thead className="">
                        <tr className=" text-left  bg-dark">
                            <th className="min-w-[150px] py-5 px-4 font-medium text-white rounded-tl-lg">
                                Listings
                            </th>
                            <th className="min-w-[150px] py-5 px-4 font-medium text-white">
                                Application Date
                            </th>
                            <th className="min-w-[120px] py-5 px-4 font-medium text-white">
                                Application Time
                            </th>
                            <th className="min-w-[120px] py-5 px-4 font-medium text-white">
                                Status
                            </th>
                            <th className="py-5 px-4 font-medium text-white w-[200px] rounded-tr-lg text-center">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    {/* Asset Rows */}
                    {/* Example Row */}
                    <tbody>
                        {activeListings.map((listing) => (
                            <ListingRow
                                reload={reload}
                                listing={listing}
                                selectedTab={selectedTab}
                            />
                        ))}

                        {activeListings.length === 0 && !isLoading && (
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
                {selectedTab === "pending" && (
                    <PaginationComponent
                        meta={pendingMeta}
                        page={pendingPage}
                        limit={pendingLimit}
                        onPageChange={handlePendingPageChange}
                    />
                )}

                {selectedTab === "rejected" && (
                    <PaginationComponent
                        meta={rejectedMeta}
                        page={rejectedPage}
                        limit={rejectedLimit}
                        onPageChange={handleRejectedPageChange}
                    />
                )}
            </div>
        </AuthLayout>
    );
};

export default Listings;
