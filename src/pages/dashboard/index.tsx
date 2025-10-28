import { DurationSelectorComponent } from "@/components/duration-selector.component";
import { FormatNumber } from "@/components/format-number.component";
import StatComponent from "@/components/stat.component";
import AuthLayout from "@/layouts/auth.layout";
import { RootState } from "@/state/store";
import { BASE_URL, get } from "@/utils/app";
import { routes } from "@/utils/routes";
import { DashboardAnalytics, Duration } from "@/utils/types";
import { DateTime } from "luxon";
import axios from "axios";
import {
    ArrowRightLeft,
    CircleArrowDown,
    CircleArrowUp,
    Coins,
    Wallet,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { endOfDay, startOfDay } from "date-fns";
import { PhoneIcon } from "@/icons/phone_icon";

const now = new Date();

const Dashboard = () => {
    const [analytics, setAnalytics] = useState<DashboardAnalytics>({
        totalAssets: { value: 0, percentage: 0 },
        totalDevices: { value: 0, percentage: 0 },
        totalTransactions: { value: 0, percentage: 0 },
        totalWallets: { value: 0, percentage: 0 },
    });

    const [isLoading, setIsLoading] = useState(true);
    const { token, user } = useSelector((state: RootState) => state.auth);
    const [duration, setDuration] = useState({
        start: startOfDay(now),
        end: endOfDay(now),
        duration: "last 7days",
    });

    const [transactionsData, setTransactionsData] = useState<{
        total: number;
        percentage: number;
        data: { x: number; y: number }[];
    }>({
        total: 0,
        percentage: 0,
        data: [],
    });

    const [tokensData, setTokensData] = useState<{
        total: number;
        percentage: number;
        data: { x: number; y: number }[];
    }>({
        total: 0,
        percentage: 0,
        data: [],
    });

    const loadAnalytics = () => {
        axios
            .get(BASE_URL + "/api/dashboard/analytics", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    duration_start: duration.start.toISOString(),
                    duration_end: duration.end.toISOString(),
                },
            })
            .then((res) => {
                const { current: cA, previous: pA } = res.data.analytics as {
                    current: any;
                    previous: any;
                };

                setAnalytics({
                    totalWallets: {
                        value: cA.totalWallets,
                        percentage:
                            pA.totalWallets > 0 || cA.totalWallets > 0
                                ? Math.round(
                                      ((cA.totalWallets - pA.totalWallets) /
                                          (Number(pA.totalWallets) || 1)) *
                                          100,
                                  )
                                : 0,
                    },
                    totalDevices: {
                        value: cA.totalDevices,
                        percentage:
                            pA.totalDevices > 0 || cA.totalDevices > 0
                                ? Math.round(
                                      ((cA.totalDevices - pA.totalDevices) /
                                          (Number(pA.totalDevices) || 1)) *
                                          100,
                                  )
                                : 0,
                    },
                    totalTransactions: {
                        value: cA.totalTransactions,
                        percentage:
                            pA.totalTransactions > 0 || cA.totalTransactions > 0
                                ? Math.round(
                                      ((cA.totalTransactions -
                                          pA.totalTransactions) /
                                          (Number(pA.totalTransactions) || 1)) *
                                          100,
                                  )
                                : 0,
                    },
                    totalAssets: {
                        value: cA.totalAssets,
                        percentage:
                            pA.totalAssets > 0 || cA.totalAssets > 0
                                ? Math.round(
                                      ((cA.totalAssets - pA.totalAssets) /
                                          (Number(pA.totalAssets) || 1)) *
                                          100,
                                  )
                                : 0,
                    },
                });

                const { current: cT, previous: pT } = res.data
                    .transactionsVolume as {
                    current: any;
                    previous: any;
                };

                setTransactionsData({
                    total: cT.total,
                    percentage:
                        pT.total > 0 || cT.total > 0
                            ? Math.round(
                                  ((cT.total - pT.total) /
                                      (Number(pT.total) || 1)) *
                                      100,
                              )
                            : 0,
                    data: cT.data.map((d: any) => ({
                        x: new Date(d.occurred_at),
                        y: Number(d.total),
                    })),
                });

                const { current: tT, previous: tPT } = res.data.tokens as {
                    current: any;
                    previous: any;
                };

                setTokensData({
                    total: tT.total,
                    percentage:
                        pT.total > 0 || tT.total > 0
                            ? Math.round(
                                  ((tT.total - pT.total) /
                                      (Number(pT.total) || 1)) *
                                      100,
                              )
                            : 0,
                    data: tT.data.map((d: any) => ({
                        x: new Date(d.occurred_at),
                        y: Number(d.total),
                    })),
                });
            })
            .catch((err) => {
                console.log("Error fetching analytics: ", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const formatDate = useCallback(
        (date: Date) => {
            switch (duration.duration as Duration) {
                case "today":
                case "yesterday":
                    // 11am 12pm 1pm
                    return DateTime.fromJSDate(date).toFormat("ha");
                case "last_7_days":
                    // mon, tue, wed, thur, fri, sat, sun
                    return DateTime.fromJSDate(date).toFormat("ccc");
                case "last_30_days":
                    return DateTime.fromJSDate(date).toFormat("LLL dd");
                case "last_6_months":
                case "this_year":
                    return DateTime.fromJSDate(date).toFormat("LLL");
                default:
                    return DateTime.fromJSDate(date).toFormat("ccc LLL dd");
            }
        },
        [duration],
    );

    useEffect(() => {
        loadAnalytics();
    }, [duration]);

    return (
        <AuthLayout>
            {/* Heading */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="font-medium text-2xl text-white">
                        Hi {user?.username} 👋
                    </h2>
                    <h4 className="font-light mt-2">
                        This is a general overview of your month so far
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
                <Link prefetch={true} href={routes.dashboard.wallets}>
                    <StatComponent
                        title="Wallets"
                        value={analytics.totalWallets.value}
                        icon={Wallet}
                        percentage={analytics.totalWallets.percentage || 0}
                        duration={duration.duration}
                    />
                </Link>
                <StatComponent
                    title="Devices"
                    value={analytics?.totalDevices.value}
                    percentage={analytics?.totalDevices.percentage || 0}
                    icon={PhoneIcon}
                    duration={duration.duration}
                />
                <Link href={routes.dashboard.transactions} prefetch={true}>
                    <StatComponent
                        title="Transactions"
                        value={analytics?.totalTransactions.value}
                        percentage={
                            analytics?.totalTransactions.percentage || 0
                        }
                        icon={ArrowRightLeft}
                        duration={duration.duration}
                    />
                </Link>
                <Link href={routes.dashboard.assets} prefetch={true}>
                    <StatComponent
                        title="Tokens added"
                        value={analytics?.totalAssets.value}
                        percentage={analytics?.totalAssets.percentage || 0}
                        icon={Coins}
                        duration={duration.duration}
                    />
                </Link>
            </div>

            {/* Charts */}
            <div className="mt-10 grid md:grid-cols-2 gap-[20px]">
                <GraphComponent
                    title="Transaction Volume"
                    description={`Transactions made  ${duration.duration.indexOf("last") > -1 ? " in the" : ""} ${duration.duration.split("_").join(" ")} `}
                    yFormater={(y) => Number(y).toLocaleString()}
                    xFormater={(x) => formatDate(new Date(x))}
                    currency="$"
                    total={transactionsData.total}
                    percentage={transactionsData.percentage}
                    fill="#52BD94"
                    data={transactionsData.data}
                />

                <GraphComponent
                    title="Tokens used"
                    description={`Total tokens used ${duration.duration.indexOf("last") > -1 ? "in the" : ""} ${duration.duration.split("_").join(" ")} `}
                    xFormater={(x) => formatDate(new Date(x))}
                    yFormater={(y) => Number(y).toLocaleString()}
                    total={tokensData.total}
                    percentage={tokensData.percentage}
                    fill="#52BD94"
                    data={tokensData.data}
                />
            </div>
        </AuthLayout>
    );
};

export default Dashboard;

function GraphComponent(props: {
    title: string;
    description: string;
    total: number;
    currency?: string;
    percentage: number;
    xFormater: (x: any) => string;
    yFormater: (y: any) => string;
    fill: string;
    data: { x: number; y: number }[];
}) {
    return (
        <div className="flex flex-col border border-dark p-6 shadow-default rounded-lg text-white   min-h-[300px]">
            <div className="">
                <h3 className="font-medium text-lg">{props.title}</h3>
                <div className="flex  items-end ">
                    <span className="text-sm text-neutral-600">
                        {props.description}
                    </span>
                </div>
            </div>

            <div className="mt-6 flex items-end">
                <span className="text-2xl font-medium inline-block mr-[5px]">
                    {props.currency}
                    {<FormatNumber value={Number(props.total || 0)} />}
                </span>
                <span
                    className={`text-sm inline-block pr-0.5 pb-0.5 relative ${
                        props.percentage >= 0 ? "text-green" : "text-red"
                    }`}
                >
                    <span className="inline-block pr-0.5 top-[1px] ">
                        {props.percentage >= 0 ? (
                            <CircleArrowUp size={14} />
                        ) : (
                            <CircleArrowDown size={14} />
                        )}
                    </span>
                    <FormatNumber value={props.percentage} />%
                </span>
            </div>

            <ResponsiveContainer
                width={"100%"}
                height={"100%"}
                className="mt-6 h-[300px]"
            >
                <AreaChart data={props.data} className="min-h-[300px]">
                    <defs>
                        <linearGradient id="count" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="#8884d8"
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor="#8884d8"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#1a1a2c"
                    />

                    <YAxis axisLine={false} tickLine={false} stroke="#8F95B2" />

                    <XAxis
                        axisLine={false}
                        tickLine={false}
                        stroke="#8F95B2"
                        tickFormatter={props.xFormater}
                        dataKey={"x"}
                    />

                    {/* <Legend /> */}
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1a1a2c",
                            color: "#fff",
                            border: "none",
                            borderRadius: "10px",
                            padding: "20px",
                            minWidth: "150px",
                        }}
                        labelStyle={{ color: "#fff", margin: "0px" }}
                        itemStyle={{ color: "#fff", margin: "0px" }}
                        formatter={props.yFormater}
                        labelFormatter={props.xFormater}
                    />

                    <Area
                        type="monotone"
                        dataKey="y"
                        name="Total"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#count)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
