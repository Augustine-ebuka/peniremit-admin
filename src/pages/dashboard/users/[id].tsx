import ActivityComponent from "@/components/activity.component";
import PaginationComponent from "@/components/pagination.component";
import AuthLayout from "@/layouts/auth.layout";
import { RootState } from "@/state/store";
import { BASE_URL } from "@/utils/app";
import { Activity, Duration, Token, User } from "@/utils/types";
import axios from "axios";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import useToast from "@/utils/hooks/use-toast";
import ImageComponent from "@/components/image.component";
import { routes } from "@/utils/routes";
import DropdownComponent from "@/components/dropdown.component";
import { SortAsc, SortDesc } from "lucide-react";
import { endOfDay, startOfMonth } from "date-fns";
import { DurationSelectorComponent } from "@/components/duration-selector.component";
import TabView from "@/components/tabview.component";
import AssetRowComponent from "@/components/asset-row.component";

const now = new Date();

const initTabs = [
    { id: "activities", label: "Activities", count: 0 },
    { id: "tokens", label: "Tokens", count: 0 },
];

type TabType = "activities" | "tokens";

export default function UserDetail() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [tokens, setTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useSelector((state: RootState) => state.auth);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const { notifyError } = useToast();
    const [userId, setUserId] = useState<string | null>(null);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [tokensLoading, setTokensLoading] = useState(true);
    const [selectedSort, setSelectedSort] = useState<string | null>();
    const [page, setPage] = useState(1);
    const [tokenPage, setTokenPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [meta, setMeta] = useState({
        total: 0,
        lastPage: 1,
    });

    const [tokenMeta, setTokenMeta] = useState({
        total: 0,
        lastPage: 1,
    });

    const tabs = useMemo(
        () =>
            initTabs.map((a) => ({
                ...a,
                count: a.id === "activities" ? meta.total : tokenMeta.total,
            })),
        [meta, tokenMeta],
    );
    const [selectedTab, setSelectedTab] = useState<TabType>("activities");
    const [duration, setDuration] = useState({
        start: startOfMonth(now),
        end: endOfDay(now),
        duration: "last 7days",
    });

    const updateDuration = useCallback(
        (d: { start: Date; end: Date; duration: Duration }) => {
            setDuration(d);
            setPage(1);
            setTokenPage(1);
        },
        [],
    );

    const handlePageChange = (newPage: number, newLimit: number) => {
        setPage(newPage);
        setLimit(newLimit);
    };

    useEffect(() => {
        const { id } = router.query;
        const uId = Number.parseInt(id as string);
        // if the user is not a valid number, go back
        if (id) {
            if (Number.isNaN(uId)) {
                router.push(routes.dashboard.users);
            } else {
                setUserId(id as string);
            }
        }
    }, [router.query.id]);

    const realSort = useMemo(() => {
        switch (selectedSort) {
            case "oldest":
                return {
                    order_by: "createdAt",
                    order: "asc",
                };
            case "newest":
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
    }, [selectedSort]);

    const loadActivities = useCallback(() => {
        if (!userId) return;
        setActivitiesLoading(true);
        setActivities([]);
        axios
            .get(`${BASE_URL}/api/activities/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    ...realSort,
                    page,
                    limit,
                    duration_start: duration.start.toISOString(),
                    duration_end: duration.end.toISOString(),
                },
            })
            .then((res) => {
                setActivities(() => res.data.activities.data || []);
                setMeta(() => ({
                    total: res.data.activities.meta.total,
                    lastPage: res.data.activities.meta.lastPage,
                }));
            })
            .catch((err) => {
                console.log("Error fetching activities: ", err);
            })
            .finally(() => {
                setActivitiesLoading(false);
            });
    }, [page, limit, token, userId, selectedSort, duration]);

    const loadTokens = useCallback(() => {
        if (!userId) return;
        setTokensLoading(true);
        setTokens([]);
        axios
            .get(`${BASE_URL}/api/activities/users/${userId}/tokens`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    ...realSort,
                    page: tokenPage,
                    limit,
                    duration_start: duration.start.toISOString(),
                    duration_end: duration.end.toISOString(),
                },
            })
            .then((res) => {
                setTokens(() => res.data.tokens.data || []);

                setTokenMeta(() => ({
                    total: res.data.tokens.meta.total,
                    lastPage: res.data.tokens.meta.lastPage,
                }));
            })
            .catch((err) => {
                console.log("Error fetching tokens: ", err);
            })
            .finally(() => {
                setTokensLoading(false);
            });
    }, [tokenPage, limit, token, userId, selectedSort, duration]);

    useEffect(() => {
        if (userId) {
            loadActivities();
            loadTokens();
        }
    }, [tokenPage, page, tokenPage, limit, userId, selectedSort, duration]);

    const handleUserData = useCallback(async () => {
        if (!userId) return;

        setLoading(true);

        axios
            .get(`${BASE_URL}/users/${user?.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data", // Important for file uploads
                },
            })
            .then((response) => {
                setUser(response.data.user);
            })
            .catch(() => {
                notifyError("An error occurred while fetching user data");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [notifyError, token, userId]);

    useEffect(() => {
        if (userId) handleUserData();
    }, [userId]);

    return (
        <AuthLayout>
            <div className="container mx-auto max-w-[600px]">
                <div className="flex flex-col border border-dark shadow-default rounded-lg text-white cursor-pointer overflow-hidden">
                    <div className="flex h-[120px] w-full bg-[#090814]"></div>

                    {user && !loading && (
                        <>
                            <ImageComponent
                                src={user?.avatarUrl || ""}
                                alt={user?.username || ""}
                                className="h-24 w-24 rounded-full border-4 border-white -mt-12 inline-block ml-[20px]"
                            />
                            <div className="p-[20px]">
                                <h1 className="text-2xl font-medium">
                                    {user?.username}
                                </h1>
                                <p className="text-sm text-neutral-600">
                                    {user?.email}
                                </p>
                            </div>
                        </>
                    )}

                    {loading && (
                        <>
                            <div className="animate-pulse h-[120px] w-full bg-[#090814]"></div>

                            <div className="p-[20px]">
                                <div className="animate-pulse h-6 w-1/2 bg-dark rounded-lg"></div>
                                <div className="animate-pulse h-4 w-1/4 bg-dark rounded-lg mt-2"></div>
                            </div>
                        </>
                    )}
                </div>

                {/* Activities */}

                <div className="flex w-full justify-end items-center mt-[20px]">
                    <div className="grid grid-cols-2 justify-items-end">
                        <DurationSelectorComponent
                            defaultDuration="this_month"
                            onUpdated={updateDuration}
                        />
                        <DropdownComponent
                            options={["newest", "oldest"]}
                            renderIcon={() => (
                                <>
                                    {selectedSort === "oldest" && (
                                        <SortAsc size={16} />
                                    )}
                                    {selectedSort === "newest" && (
                                        <SortDesc size={16} />
                                    )}
                                </>
                            )}
                            renderOption={(option) => (
                                <span className="capitalize">{option}</span>
                            )}
                            className="py-3.5"
                            selectedValue={selectedSort}
                            setSelectedValue={(data) => setSelectedSort(data)}
                            placeHolder="Filter"
                        />
                    </div>
                </div>

                <TabView
                    tabs={tabs}
                    selectedTab={selectedTab}
                    onTabSelect={(t) => setSelectedTab(t as TabType)}
                    loading={false}
                />

                {selectedTab === "activities" && (
                    <div className="mt-[15px]">
                        {activities.length > 0 && (
                            <div className="mt-5 relative">
                                <div className="w-6 border-r-2 h-full absolute top-0 left-0 z-[-1] border-dark"></div>

                                <div className="flex flex-col gap-8">
                                    {activities.map((activity) => (
                                        <ActivityComponent
                                            key={activity.id}
                                            activity={activity}
                                            refresh={() => loadActivities()}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {activitiesLoading && (
                            <div className="text-center mt-10">Loading...</div>
                        )}
                        {!activitiesLoading && activities.length < 1 && (
                            <div className="text-center mt-10 border p-5 rounded-lg border-dark">
                                Nothing here yet
                            </div>
                        )}
                        {!activitiesLoading && meta.total > 0 && (
                            <div>
                                <PaginationComponent
                                    meta={meta}
                                    page={page}
                                    limit={limit}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                )}

                {selectedTab === "tokens" && (
                    <>
                        {/* Asset Table */}
                        <div className="mt-2 text-sm max-w-[800px] overflow-scroll">
                            <table className="w-full max-w-[600px]">
                                <tbody>
                                    {tokens.map((t, index) => (
                                        <AssetRowComponent
                                            key={t.address}
                                            index={
                                                tokenPage * limit -
                                                limit +
                                                index +
                                                1
                                            }
                                            asset={t}
                                            compact={true}
                                            showPNL={false}
                                            withFees={false}
                                            refresh={() => loadTokens()}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {tokensLoading && (
                            <div className="text-center mt-10">Loading...</div>
                        )}
                        {!tokensLoading && tokens.length < 1 && (
                            <div className="text-center mt-10 border p-5 rounded-lg border-dark">
                                Nothing tokens here yet
                            </div>
                        )}

                        {!tokensLoading && tokenMeta.total > 0 && (
                            <PaginationComponent
                                meta={tokenMeta}
                                page={tokenPage}
                                limit={limit}
                                onPageChange={(t) => setTokenPage(t)}
                            />
                        )}
                    </>
                )}
            </div>
        </AuthLayout>
    );
}
