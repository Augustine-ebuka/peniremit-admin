import { createPublicClient, http } from "viem";
import { bsc } from "viem/chains";
import { User } from "./types";

export const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://api.admin.peniwallet.com";

export const get = (value: string | number | undefined, loading: boolean) => {
    if (loading || !value) {
        return "--";
    }

    return value;
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
    };

    return date.toLocaleDateString("en-US", options);
};

export const formatTime = (dateString: string): string => {
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    };

    return date.toLocaleTimeString("en-US", options);
};

export const formatUrl = (url: string) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return `https://${url}`;
    }
    return url;
};

export const handleError = (err: any, notifyError: (e: string) => void) => {
    if (!err.response?.data) {
        notifyError("Please check your internet connection and try again");
    } else if (err.response?.data.message) {
        notifyError(err.response?.data.message);
    } else if (err.response?.data.errors[0]?.message) {
        notifyError(err.response?.data.errors[0]?.message);
    } else {
        notifyError("An error occured, Please try again");
    }
};

export const publicClient = createPublicClient({
    chain: bsc,
    transport: http(),
});

export const isAdmin = (user: User | null) => {
    const adminRoles = ["admin", "superadmin"];
    return user && adminRoles.includes(user.role);
};
