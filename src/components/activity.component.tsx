import {
    CircleCheck,
    CircleMinus,
    CirclePlus,
    Megaphone,
    Pencil,
    XCircle,
    UserCog,
} from "lucide-react";
import { Trash } from "iconsax-react";
import React from "react";
import { Activity, ActivityType } from "@/utils/types";
import Link from "next/link";
import { routes } from "@/utils/routes";
import { DateTime } from "luxon";
import { useModalContext } from "@/_contexts/modal.context";

interface ActivityComponentProps {
    activity: Activity;
    refresh?: () => void;
}

const ActivityComponent: React.FC<ActivityComponentProps> = ({
    activity,
    refresh,
}) => {
    const icon: Record<ActivityType, React.FC<any>> = {
        "approve-listing": CircleCheck,
        "approved-listing": CircleCheck,
        "reject-listing": XCircle,
        "list-token": CirclePlus,
        "delist-token": CircleMinus,
        "delete-token": Trash,
        "withdraw-fees": CircleMinus,
        "approve-user": CircleCheck,
        "change-user-role": UserCog,
        "delete-user": Trash,
        "sent-notification": Megaphone,
        "edit-token": Pencil,
        "create-token": CirclePlus,
    };

    const Icon = icon[activity!.action] || CircleCheck;

    function getActionDescription(a: Activity): React.ReactNode {
        const { action, user, token, admin, listing, deleteName } = a;
        const { assetInfo } = useModalContext();
        const actor = admin || user;

        const TokenInfo = () =>
            token ? (
                <span
                    className="font-semibold text-neutral cursor-pointer "
                    onClick={() =>
                        assetInfo.open({
                            token,
                            refresh,
                        })
                    }
                >
                    {token.name} ({token.symbol})
                </span>
            ) : (
                <span className="font-semibold text-gray-500 ">
                    {deleteName}
                </span>
            );

        const ListingLink = ({ children }: { children: React.ReactNode }) => (
            <Link
                href={`${routes.dashboard.listing}?s=${listing?.id}`}
                className="font-semibold text-neutral"
            >
                {children}
            </Link>
        );

        switch (action) {
            case "approve-listing":
            case "approved-listing":
                return (
                    <>
                        approved listing for <TokenInfo />
                    </>
                );
            case "reject-listing":
                return (
                    <>
                        rejected listing for <TokenInfo />
                    </>
                );
            case "list-token":
                return (
                    <>
                        added token <TokenInfo /> to assets
                    </>
                );
            case "delist-token":
                return (
                    <>
                        removed token <TokenInfo />
                    </>
                );
            case "delete-token":
                return (
                    <>
                        deleted token{" "}
                        <span className="font-semibold text-neutral ">
                            {deleteName}
                        </span>
                    </>
                );
            case "withdraw-fees":
                return "withdrew fees";
            case "approve-user":
                return (
                    <>
                        approved user{" "}
                        <span className="font-semibold text-neutral ">
                            {actor.username}
                        </span>
                    </>
                );
            case "change-user-role":
                return (
                    <>
                        changed role for user{" "}
                        <span className="font-semibold text-neutral ">
                            {actor.username}
                        </span>
                    </>
                );
            case "delete-user":
                return <>disabled user {actor.username}</>;
            case "sent-notification":
                return "sent a notification";
            case "edit-token":
                return (
                    <>
                        edited token <TokenInfo />
                    </>
                );
            case "create-token":
                return (
                    <>
                        created token <TokenInfo />
                    </>
                );
            default:
                return "performed unknown action";
        }
    }

    return (
        <div className="flex gap-4">
            <div className="h-12 w-12 border-2 border-dark bg-primary rounded-full text-white flex items-center justify-center">
                <Icon />
            </div>
            <div>
                <div className="text-neutral-400">
                    <Link href={"#"} className=" text-neutral font-semibold">
                        {activity.user.username}
                    </Link>{" "}
                    {getActionDescription(activity)}
                </div>
                <p className="text-sm text-neutral-400">
                    {DateTime.fromISO(activity.createdAt).toFormat(
                        "LLL dd, yyyy - HH:mm a",
                    )}
                </p>
            </div>
        </div>
    );
};

export default ActivityComponent;
