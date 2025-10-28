import AssetRowComponent from "@/components/asset-row.component";
import ButtonComponent from "@/components/button.component";
import DropdownComponent from "@/components/dropdown.component";
import { DurationSelectorComponent } from "@/components/duration-selector.component";
import InputComponent from "@/components/input.component";
import PaginationComponent from "@/components/pagination.component";
import StatComponent from "@/components/stat.component";
import { MoneyIcon } from "@/icons/money_icon";
import AuthLayout from "@/layouts/auth.layout";
import { RootState } from "@/state/store";
import { BASE_URL, get, isAdmin } from "@/utils/app";
import useDebounce from "@/utils/hooks/use-debounce";
import useToast from "@/utils/hooks/use-toast";
import { routes } from "@/utils/routes";
import { Token } from "@/utils/types";
import axios from "axios";
import { endOfDay, startOfDay } from "date-fns";
import {
    Coins,
    Layers,
    Receipt,
    Search,
    SortAsc,
    SortDesc,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

type SortType = "least" | "most";
const now = new Date();

const Assets = () => {
    const { notifyError, notifySuccess } = useToast();
    const searchParams = useSearchParams();
    const search = searchParams.get("s");
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [isLoading, setIsLoading] = useState(true);
    const { token, user } = useSelector((state: RootState) => state.auth);
    const [analytics, setAnalytics] = useState({
        totalTokens: {
            value: 0,
            percentage: 0,
        },
        totalFees: {
            value: 0,
            percentage: 0,
        },
    });
    const [assets, setAssets] = useState<Token[]>([]);
    const [sort, setSort] = useState<SortType>("most");
    const [listedPage, setListedPage] = useState(1);
    const [listedLimit, setListedLimit] = useState(10);
    const [listedMeta, setListedMeta] = useState({
        total: 0,
        lastPage: 1,
    });
    const [duration, setDuration] = useState({
        start: startOfDay(now),
        end: endOfDay(now),
        duration: "last 7days",
    });
    const router = useRouter();

    const [withdrawTokenLoading, setWithdrawTokenLoading] = useState(false);
    const [withdrawListingsLoading, setWithdrawListingsLoading] =
        useState(false);

    const withdrawTokenFees = async () => {
        setWithdrawTokenLoading(true);
        await axios
            .post(
                BASE_URL + "/api/fees/withdraw-token",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )
            .then(() => {
                notifySuccess("Request is submitted and is being processed.");
            })
            .catch((error) => {
                console.error("Error withdrawing token fees:", error);
                notifyError(
                    "We could not process your request. Please try again later.",
                );
            })
            .finally(() => {
                setWithdrawTokenLoading(false);
            });
    };

    const withdrawListingFees = async () => {
        setWithdrawListingsLoading(true);
        await axios
            .post(
                BASE_URL + "/api/fees/withdraw-listings",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )
            .then(() => {
                notifySuccess("Request is submitted and is being processed.");
            })
            .catch((error) => {
                console.error("Error withdrawing listing fees:", error);
                notifyError(
                    "We could not process your request. Please try again later.",
                );
            })
            .finally(() => {
                setWithdrawListingsLoading(false);
            });
    };

    const handleListingPageChange = (page: number, limit: number) => {
        setListedPage(page);
        setListedLimit(limit);
    };

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const handleChange = (event: any) => {
        setSearchTerm(event.target.value);
    };

    const getFilter = () => {
        return {
            order_by: "total_fee_usd",
            order: sort === "most" ? "desc" : "asc",
        };
    };

    const loadAssets = () => {
        axios
            .get(BASE_URL + "/api/assets/fees", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    duration_start: duration.start.toISOString(),
                    duration_end: duration.end.toISOString(),
                    s: debouncedSearchTerm,
                    ...getFilter(),
                    page: listedPage,
                    limit: listedLimit,
                },
            })
            .then((res) => {
                setAssets(res.data.tokens.data);
                setListedMeta({
                    total: res.data.tokens.meta.total,
                    lastPage: res.data.tokens.meta.lastPage,
                });
            })
            .catch((err) => {
                console.log("Error fetching assets: ", err);
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
                },
            })
            .then((res) => {
                const { current, previous } = res.data.analytics;

                setAnalytics({
                    totalFees: {
                        value: current.totalFees,
                        percentage: Math.round(
                            ((current.totalFees - previous.totalFees) /
                                (Number(previous.totalFees) || 1)) *
                                100,
                        ),
                    },
                    totalTokens: {
                        value: current.totalTokens,
                        percentage: Math.round(
                            ((current.totalTokens - previous.totalTokens) /
                                (Number(previous.totalTokens) || 1)) *
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
        if (search) {
            router.replace(routes.dashboard.assets);
        }
    }, [search]);

    const refresh = () => {
        setIsLoading(true);
        loadAssets();
        loadAnalytics();
    };

    useEffect(() => {
        refresh();
    }, [debouncedSearchTerm, sort, listedPage, duration]);

    return (
        <AuthLayout>
            {/* Heading */}
            <div className="flex justify-between">
                <div>
                    <h2 className="font-medium text-2xl text-white">Fees</h2>
                    <h4 className="font-light mt-2">
                        Here is a list of all fees for tokens on Peniwallet
                    </h4>
                </div>

                <DurationSelectorComponent
                    onUpdated={(d) => {
                        setDuration(d);
                    }}
                />
            </div>

            {/* Stats Cards */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatComponent
                    title="Tokens with Fees"
                    value={get(analytics.totalTokens.value, isLoading)}
                    icon={Coins}
                    percentage={analytics.totalTokens.percentage}
                />

                {isAdmin(user) && (
                    <StatComponent
                        title="Fee Balance"
                        value={`${get(analytics?.totalFees.value || 0, isLoading)}`}
                        icon={MoneyIcon}
                        percentage={analytics.totalFees.percentage}
                    />
                )}

                {["superadmin"].includes(user?.role!) && (
                    <div className="flex flex-col gap-4 border rounded-lg border-dark p-3 items-center justify-center col-span-2 xl:col-span-1">
                        <ButtonComponent
                            className="max-w-80"
                            loading={withdrawListingsLoading}
                            onClick={withdrawListingFees}
                        >
                            Withdraw Listing Fees
                        </ButtonComponent>
                        <ButtonComponent
                            className="max-w-80"
                            loading={withdrawTokenLoading}
                            onClick={withdrawTokenFees}
                        >
                            Withdraw Token Fees
                        </ButtonComponent>
                    </div>
                )}
            </div>

            {/* Table Navigation */}
            <nav className="mt-10">
                <div className="grid grid-cols-[1fr_max-content] gap-4 justify-between">
                    <div className="col-span-2 md:col-span-1 max-w-[500px]">
                        <InputComponent
                            prefix={<Search size={20} />}
                            className="w-full shrink-0 placeholder:text-neutral-600 "
                            placeholder="Search Assets"
                            value={searchTerm}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <DropdownComponent
                            options={["least", "most"]}
                            renderIcon={() => (
                                <>
                                    {sort === "least" && <SortAsc size={16} />}
                                    {sort === "most" && <SortDesc size={16} />}
                                </>
                            )}
                            renderOption={(option) => (
                                <span className="capitalize">
                                    {option || "Clear Filter"}
                                </span>
                            )}
                            className="py-3.5"
                            selectedValue={sort}
                            setSelectedValue={(data) =>
                                setSort(data as "least" | "most")
                            }
                            placeHolder="Filter"
                        />
                    </div>
                </div>
            </nav>

            {/* Asset Table */}
            <div className="mt-2 overflow-auto flex-1 text-sm">
                <table className="w-full min-w-[100px]">
                    <thead className="">
                        <tr className=" text-left  bg-dark">
                            <th className="min-w-[50px] py-5 px-4 font-medium text-white rounded-tl-lg">
                                #
                            </th>

                            <th className="min-w-[150px] py-5 px-4 font-medium text-white ">
                                Token
                            </th>

                            <th className="min-w-[150px] py-5 px-4 font-medium text-white ">
                                Contract Address
                            </th>
                            <th className="min-w-[150px] py-5 px-4  font-medium text-white ">
                                PNL (24H)
                            </th>

                            <th className="min-w-[150px] py-5 px-4  font-medium text-white ">
                                Fees
                            </th>

                            <th className="py-5 px-4 font-medium text-white w-[140px] rounded-tr-lg">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <>
                            {assets.map((asset, index) => (
                                <AssetRowComponent
                                    withFees={true}
                                    showPNL={true}
                                    index={
                                        listedPage * listedLimit -
                                        listedLimit +
                                        index +
                                        1
                                    }
                                    asset={asset}
                                    key={asset.address}
                                    refresh={refresh}
                                />
                            ))}

                            {assets.length === 0 && !isLoading && (
                                <tr>
                                    <td
                                        colSpan={100}
                                        className="text-center text-neutral-600 text-sm py-6 border-b border-dark"
                                    >
                                        There is nothing here yet
                                    </td>
                                </tr>
                            )}
                        </>
                    </tbody>
                </table>
            </div>

            <div>
                <PaginationComponent
                    meta={listedMeta}
                    page={listedPage}
                    limit={listedLimit}
                    onPageChange={handleListingPageChange}
                />
            </div>
        </AuthLayout>
    );
};

export default Assets;
