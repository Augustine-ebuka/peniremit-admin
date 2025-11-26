import AssetRowComponent from "@/components/asset-row.component";
import ButtonComponent from "@/components/button.component";
import DropdownComponent from "@/components/dropdown.component";
import { DurationSelectorComponent } from "@/components/duration-selector.component";
import InputComponent from "@/components/input.component";
import CreateAsset from "@/components/modals/create-asset";
import PaginationComponent from "@/components/pagination.component";
import StatComponent from "@/components/stat.component";
import TabView from "@/components/tabview.component";
import AuthLayout from "@/layouts/auth.layout";
import { RootState } from "@/state/store";
import { BASE_URL, get } from "@/utils/app";
import useDebounce from "@/utils/hooks/use-debounce";

import { routes } from "@/utils/routes";
import { Tab, Token as TokenType } from "@/utils/types";
import axios from "axios";
import { endOfDay, startOfDay } from "date-fns";
import { produce } from "immer";
import { Coins, Filter, Plus, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

const initTabs: Tab[] = [
    { id: "active", label: "Active tokens", count: 0 },
    { id: "excluded", label: "Excluded tokens", count: 0 },
];
type TabType = "active" | "excluded";

const now = new Date();

const Token = () => {
    const searchParams = useSearchParams();
    const search = searchParams.get("s");
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useSelector((state: RootState) => state.auth);
    const [analytics, setAnalytics] = useState({
        totalFees: {
            value: 0,
            percentage: 0,
        },
        totalTokens: {
            value: 0,
            percentage: 0,
        },
    });
    const [assets, setAssets] = useState<{
        active: TokenType[];
        excluded: TokenType[];
    }>({
        active: [],
        excluded: [],
    });
    const [selectedFilter, setSelectedFilter] = useState<string | null>();
    const [selectedType, setSelectedType] = useState<"used" | "created">(
        "used",
    );
    const [page, setPage] = useState({
        active: 1,
        excluded: 1,
    });
    const [duration, setDuration] = useState({
        start: startOfDay(now),
        end: endOfDay(now),
        duration: "last 7days",
    });

    const [meta, setMeta] = useState({
        active: {
            total: 0,
            lastPage: 1,
        },
        excluded: {
            total: 0,
            lastPage: 1,
        },
    });
    const limit = useMemo(() => 10, []);

    const tabs = useMemo(
        () =>
            initTabs.map((a) => ({
                ...a,
                count:
                    a.id === "active" ? meta.active.total : meta.excluded.total,
            })),
        [meta],
    );

    const [selectedTab, setSelectedTab] = useState<TabType>("active");
    const router = useRouter();

    const handlePageChange = (p: number, type: TabType) => {
        setPage((prev) => ({ ...prev, [type]: p }));
    };

    const handleTabSelect = (tab: TabType) => {
        setSelectedTab(tab);
    };

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const currentAssets = useMemo(() => {
        return assets[selectedTab];
    }, [selectedTab, assets]);

    const handleChange = (event: any) => {
        setSearchTerm(event.target.value);
    };

    const getFilter = useMemo(() => {
        switch (selectedFilter) {
            case "earliest":
                return {
                    order_by: "createdAt",
                    order: "asc",
                    type: selectedType,
                };
            case "latest":
                return {
                    order_by: "createdAt",
                    order: "desc",
                    type: selectedType,
                };
            default:
                return {
                    order_by: "createdAt",
                    order: "desc",
                    type: selectedType,
                };
        }
    }, [selectedFilter, selectedType]);

    const loadAssets = (type: TabType = "active") => {
        axios
            .get(BASE_URL + "/tokens", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    duration_start: duration.start.toISOString(),
                    duration_end: duration.end.toISOString(),
                    s: debouncedSearchTerm,
                    ...getFilter,
                    page: page[type],
                    limit: 10,
                    excluded: type === "excluded",
                },
            })
            .then((res) => {
                // API returns { data: { tokens: [...], pagination: { page, page_size, total_pages } } }
                const payload = res.data?.data ?? res.data;
                const tokensFromApi = payload.tokens || [];
                // normalize tokens to the app Token shape
                const normalizedTokens: TokenType[] = tokensFromApi.map(
                    (t: any) => ({
                        createdAt: t.created_at,
                        updatedAt: t.updated_at,
                        address: t.address,
                        name: t.name,
                        symbol: t.symbol,
                        decimals: t.decimals,
                        logoUrl: t.metadata?.logo_url || "",
                        isDefault: t.metadata?.is_default ?? false,
                        isNative: false,
                        chainId: t.chain_id,
                        metadata: {
                            id: t.metadata?.id || "",
                            createdAt: t.metadata?.created_at || "",
                            updatedAt: t.metadata?.updated_at || "",
                            projectEmail: t.metadata?.project_email || null,
                            website: t.metadata?.website || "",
                            category: t.metadata?.category || null,
                            description: t.metadata?.description || null,
                            creatorAddress: t.metadata?.creator_address || null,
                            communityLinks: t.metadata?.community_links || [],
                            listed: t.metadata?.listed ?? false,
                            tokenId:
                                t.metadata?.token_id ||
                                t.metadata?.tokenId ||
                                null,
                        },
                        marketdata: {
                            id: "",
                            createdAt: "",
                            updatedAt: "",
                            price:
                                t.market_data?.price ??
                                t.marketdata?.price ??
                                "0",
                            volume:
                                t.market_data?.volume ??
                                t.marketdata?.volume ??
                                "0",
                            circulatingSupply:
                                t.market_data?.circulating_supply ??
                                t.marketdata?.circulatingSupply ??
                                "0",
                            totalSupply:
                                t.market_data?.total_supply ??
                                t.marketdata?.totalSupply ??
                                "0",
                            tokenId: t.market_data?.token_id ?? undefined,
                            liquidity: t.market_data?.liquidity ?? "0",
                        },
                        totalFeeUsd: t.totalFeeUsd || "0",
                        prices: null,
                    }),
                );

                setAssets((prev) => ({
                    ...prev,
                    [type]: normalizedTokens,
                }));

                const pagination = payload.pagination || {};
                const totalPages = pagination.total_pages || 1;
                const pageSize = pagination.page_size || 10;
                setMeta((prev) => ({
                    ...prev,
                    [type]: {
                        total: (pagination.total_count ??
                            pageSize * totalPages) as number,
                        lastPage: totalPages,
                    },
                }));
            })
            .catch((err) => {
                console.log("Error fetching token: ", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const loadAnalytics = () => {
        axios
            .get(BASE_URL + "/api/assets/analytics", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    duration_start: duration.start.toISOString(),
                    duration_end: duration.end.toISOString(),
                    type: selectedType,
                },
            })
            .then((res) => {
                // setAnalytics(res.data.analytics);
                const { previous, current } = res.data.analytics;

                setAnalytics(() => ({
                    totalFees: produce(analytics.totalFees, (draft) => ({
                        value: current.totalFees,
                        percentage: Math.round(
                            ((current.totalFees - previous.totalFees) /
                                Number(previous.totalFees) || 1) * 100,
                        ),
                    })),
                    totalTokens: produce(analytics.totalTokens, (draft) => ({
                        value: current.totalTokens,
                        percentage: Math.round(
                            ((current.totalTokens - previous.totalTokens) /
                                Number(previous.totalTokens) || 1) * 100,
                        ),
                    })),
                }));
            })
            .catch((err) => {
                console.log("Error fetching analytics: ", err);
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

    const refresh = () => {
        setIsLoading(true);
        loadAssets("active");
        loadAssets("excluded");
        // loadAnalytics();
    };

    useEffect(() => {
        refresh();
    }, [debouncedSearchTerm, selectedFilter, page, duration, selectedType]);

    return (
        <AuthLayout>
            {/* Heading */}
            <div className="flex justify-between">
                <div>
                    <h2 className="font-medium text-2xl text-white">Token</h2>
                    <h4 className="font-light mt-2">
                        Here is a list of all tokens on Peniwallet
                    </h4>
                </div>
                <div className="grid items-center grid-cols-[max-content_max-content_1fr] gap-x-[10px]">
                    <DropdownComponent
                        options={["used", "created"]}
                        renderIcon={() => <></>}
                        renderOption={(option) => (
                            <span className="capitalize">
                                {option === "used" ? "used" : "added"}
                            </span>
                        )}
                        className="py-3.5"
                        selectedValue={selectedType}
                        setSelectedValue={(data) =>
                            setSelectedType(data as "used" | "created")
                        }
                        placeHolder="type"
                    />
                    <DurationSelectorComponent
                        onUpdated={(d) => {
                            setDuration(d);
                        }}
                    />
                    <ButtonComponent
                        onClick={() => setIsModalOpen(true)}
                        className="gap-2 py-3"
                    >
                        <Plus size={18} />
                        Add Token
                    </ButtonComponent>
                    <CreateAsset
                        isModalOpen={isModalOpen}
                        closeModal={() => setIsModalOpen(false)}
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatComponent
                    title="Total Token"
                    value={get(analytics?.totalTokens.value, isLoading)}
                    percentage={analytics?.totalTokens.percentage}
                    icon={Coins}
                />
            </div>

            {/* Table Navigation */}
            <nav className="mt-10">
                <div className="grid grid-cols-[1fr_max-content] gap-4 justify-between">
                    <div className="col-span-2 md:col-span-1  max-w-[500px]">
                        <InputComponent
                            prefix={<Search size={20} />}
                            className="w-full shrink-0 placeholder:text-neutral-600 "
                            placeholder="Search Token"
                            value={searchTerm}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
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
            </nav>

            <div className="overflow-x-auto mt-4">
                <TabView
                    tabs={tabs}
                    selectedTab={selectedTab}
                    onTabSelect={(t) => handleTabSelect(t as TabType)}
                    loading={isLoading}
                />
            </div>

            {/* Asset Table */}
            <div className="mt-2 overflow-auto flex-1 text-sm">
                <table className="w-full min-w-[100px]">
                    <thead className="">
                        <tr className=" text-left  bg-dark">
                            <th className="min-w-[50px] py-5 px-4 font-medium text-white rounded-tl-lg">
                                #
                            </th>
                            <th className="min-w-[50px] py-5 px-4 font-medium text-white ">
                                Token
                            </th>

                            <th className="min-w-[50px] py-5 px-4 font-medium text-white">
                                Contract Address
                            </th>
                            <th className="min-w-[50px] py-5  px-4 font-medium text-white">
                                Price
                            </th>
                            <th className="min-w-[50px] py-5 px-4  font-medium text-white">
                                Market cap
                            </th>

                            <th className="min-w-[50px] py-5  px-4 font-medium text-white">
                                Liquidity
                            </th>

                            <th className="min-w-[50px] py-5 px-4  font-medium text-white">
                                Supply
                            </th>

                            <th className="py-5 px-4 font-medium text-white  rounded-tr-lg">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentAssets.map((asset, index) => (
                            <AssetRowComponent
                                index={page.active * limit - limit + index + 1}
                                asset={asset}
                                key={asset.address}
                                refresh={refresh}
                            />
                        ))}

                        {currentAssets.length === 0 && !isLoading && (
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
                {selectedTab === "active" && (
                    <PaginationComponent
                        meta={meta.active}
                        page={page.active}
                        limit={limit}
                        onPageChange={(p) => handlePageChange(p, "active")}
                    />
                )}

                {selectedTab === "excluded" && (
                    <PaginationComponent
                        meta={meta.excluded}
                        page={page.excluded}
                        limit={limit}
                        onPageChange={(p) => handlePageChange(p, "excluded")}
                    />
                )}
            </div>
        </AuthLayout>
    );
};

export default Token;
