import React, { useCallback, useEffect, useState } from "react";
import {
    ArrowRightLeft,
    Bolt,
    Box,
    CircleGauge,
    Grid2X2,
    Radius,
    User,
    Wallet,
    X,
    Coins,
    SortAsc,
} from "lucide-react";
import { routes } from "@/utils/routes";
import { Notification1 } from "iconsax-react";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { BASE_URL, isAdmin } from "@/utils/app";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";
import { MoneyIcon } from "@/icons/money_icon";

const SideLayout = ({ open, close }: { open: boolean; close: () => void }) => {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const [pendingAdminCount, setPendingAdminCount] = useState(0);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    const fetchPending = useCallback(() => {
        axios
            .get(BASE_URL + "/api/roles/count", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const data = res.data;
                setPendingAdminCount(data.pending);
            })
            .catch((err) => {
                console.log("Error fetching count: ", err);
            });
    }, [token]);

    useEffect(() => {
        const id = setInterval(() => {
            fetchPending();
        }, 5000);

        setIntervalId(id);

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    return (
        <div
            className={`w-72 shrink-0 border-r p-8 gap-8 flex flex-col border-dark text-neutral-400 fixed md:static z-20 bg-primary h-full transition-all mt-1 ${open ? "left-0" : "-left-full"}`}
        >
            <div className="flex justify-end absolute right-0 pr-8 md:hidden">
                <button
                    className="h-10 w-10 text-white flex items-center justify-center border border-dark rounded-lg"
                    onClick={close}
                >
                    <X size={16} />
                </button>
            </div>

            <NavLink
                title="Dashboard"
                icon={Grid2X2}
                url={routes.dashboard.index}
            />
            <NavLink
                title="Rankings"
                icon={SortAsc}
                url={routes.dashboard.rankings}
            />
            <NavLink
                title="Tokens"
                icon={Coins}
                url={routes.dashboard.assets}
            />
            {isAdmin(user) && (
                <NavLink
                    title="Fees"
                    icon={MoneyIcon}
                    url={routes.dashboard.fees}
                />
            )}

            <NavLink
                title="Transactions"
                icon={ArrowRightLeft}
                url={routes.dashboard.transactions}
            />
            <NavLink
                title="Wallets"
                icon={Wallet}
                url={routes.dashboard.wallets}
            />
            <NavLink
                title="Listings"
                icon={Box}
                url={routes.dashboard.listings}
            />
            {isAdmin(user) && (
                <NavLink
                    title="Relays"
                    icon={Radius}
                    url={routes.dashboard.relays}
                />
            )}
            <NavLink
                title="Activities"
                icon={CircleGauge}
                url={routes.dashboard.activities}
            />
            {isAdmin(user) && (
                <NavLink
                    title="Notifications"
                    icon={Notification1}
                    url={routes.dashboard.notifications}
                />
            )}
            {isAdmin(user) && (
                <NavLink
                    title="Admins"
                    icon={User}
                    url={routes.dashboard.users}
                    misc={
                        <span className="text-white text-[10px] rounded-full bg-[#1B192C]   w-4 h-4 flex items-center justify-center border border-[#1B192C]">
                            {pendingAdminCount}
                        </span>
                    }
                />
            )}
            <NavLink
                title="Settings"
                icon={Bolt}
                url={routes.dashboard.settings}
            />
        </div>
    );
};

const NavLink = (props: {
    title: string;
    url: string;
    icon: any;
    misc?: React.ReactElement;
}) => {
    const pathname = usePathname();

    return (
        <Link
            href={props.url}
            className={`flex gap-4 ${pathname === props.url ? "text-white" : ""}`}
            prefetch={true}
        >
            <props.icon size="22" />
            <div className="flex items-center gap-[5px]">
                {props.title} {props.misc}
            </div>
        </Link>
    );
};

export default SideLayout;
