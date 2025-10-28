import ButtonComponent from "@/components/button.component";
import DropdownComponent from "@/components/dropdown.component";
import { Spinner } from "@/components/icons/spinner";
import InputComponent from "@/components/input.component";
import CreateNotification from "@/components/modals/create-notification";
import NotificationInfo from "@/components/modals/notification-info";
import PaginationComponent from "@/components/pagination.component";
import AuthLayout from "@/layouts/auth.layout";
import { RootState } from "@/state/store";
import { BASE_URL, formatDate, formatTime } from "@/utils/app";
import useDebounce from "@/utils/hooks/use-debounce";
import { Notification } from "@/utils/types";
import axios from "axios";
import { Check, Filter, Plus, Search, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

const Notifications = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { token } = useSelector((state: RootState) => state.auth);
    const [selectedFilter, setSelectedFilter] = useState<string | null>();
    const [isLoading, setIsLoading] = useState(true);

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

    const handleChange = (event: any) => {
        setSearchTerm(event.target.value);
    };

    const loadNotifications = () => {
        axios
            .get(BASE_URL + "/api/notifications", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    ...getFilter(),
                    s: debouncedSearchTerm,
                    page,
                    limit,
                },
            })
            .then((res) => {
                setNotifications(res.data.notifications.data || []);
                setMeta({
                    total: res.data.notifications.meta.total,
                    lastPage: res.data.notifications.meta.lastPage,
                });
            })
            .catch((err) => {
                console.log("Error fetching notifications: ", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        loadNotifications();
    }, [debouncedSearchTerm, selectedFilter, page, limit]);

    return (
        <AuthLayout>
            {/* Heading */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="font-medium text-2xl text-white">
                        Notifications
                    </h2>
                    <h4 className="font-light mt-2">
                        Here is a list of all notifications on Peniwallet
                    </h4>
                </div>
                <div>
                    <ButtonComponent
                        onClick={() => setIsModalOpen(true)}
                        className="gap-1 md:gap-3 py-3"
                    >
                        <Plus size={14} />
                        Create{" "}
                        <span className="hidden sm:inline">
                            New Notification
                        </span>
                    </ButtonComponent>
                    <CreateNotification
                        refresh={() => loadNotifications()}
                        isModalOpen={isModalOpen}
                        closeModal={() => setIsModalOpen(false)}
                    />
                </div>
            </div>

            {/* Table Navigation */}
            <nav className="mt-10">
                <div className="grid grid-cols-4 gap-4 justify-between">
                    <div className="col-span-2 md:col-span-1">
                        <InputComponent
                            prefix={<Search size={20} />}
                            className="w-full shrink-0 placeholder:text-neutral-600"
                            placeholder="Search Notifications"
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
            </nav>

            {/* Notification Table */}
            <div className="mt-2 overflow-auto text-sm">
                <table className="w-full min-w-[100px]">
                    <thead>
                        <tr className=" text-left  bg-dark">
                            <th className="min-w-[150px] py-5 px-4 font-medium text-white rounded-tl-lg">
                                Notification Subject
                            </th>
                            <th className="min-w-[150px] py-5 px-4 font-medium text-white">
                                Sent By
                            </th>
                            <th className="min-w-[120px] py-5 px-4 font-medium text-white">
                                Status
                            </th>
                            <th className="min-w-[120px] py-5 px-4 font-medium text-white">
                                Scheduled Time
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    {/* Notis Rows */}
                    <tbody>
                        {notifications.map((notification) => (
                            <NotificationRow
                                key={notification.id}
                                notification={notification}
                                refresh={() => loadNotifications()}
                            />
                        ))}

                        {notifications.length === 0 && !isLoading && (
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

const NotificationRow = ({
    notification,
    refresh,
}: {
    notification: Notification;
    refresh?: () => void;
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { token } = useSelector((state: RootState) => state.auth);
    const [isResending, setIsResending] = useState(false);

    const resendNotification = () => {
        const resend = confirm(
            "Are you sure you want to resend this notification?",
        );

        if (!resend) return;

        setIsResending(() => true);

        axios
            .post(
                BASE_URL + "/api/notifications/new",
                {
                    subject: notification.subject,
                    content: notification.body,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )
            .then((res) => {
                console.log("Notification Resent: ", res);
            })
            .catch((err) => {
                console.log("Error resending notification: ", err);
                alert("Error resending notification");
            })
            .finally(() => {
                refresh && refresh();
                setIsResending(() => false);
            });
    };

    return (
        <tr className="text-left border-b border-dark">
            <td className="py-5 px-4">
                <button
                    className="capitalize"
                    onClick={() => setIsModalOpen(true)}
                >
                    {notification.subject}
                </button>
                <NotificationInfo
                    notification={notification}
                    isModalOpen={isModalOpen}
                    closeModal={() => setIsModalOpen(false)}
                />
            </td>
            <td className="py-4 px-4 font-semibold">
                @{notification.sender.username}
            </td>
            <td className="py-4 px-4">
                {notification.status === "sent" && (
                    <div className="w-24 py-3 font-semibold text-green text-xs rounded-full flex items-center justify-center bg-dark uppercase">
                        Sent
                    </div>
                )}
                {notification.status === "pending" && (
                    <div className="w-24 py-3 font-semibold text-yellow-600 text-xs rounded-full flex items-center justify-center bg-dark uppercase">
                        Pending
                    </div>
                )}
                {notification.status === "failed" && (
                    <div className="w-24 py-3 font-semibold text-red text-xs rounded-full flex items-center justify-center bg-dark uppercase">
                        Failed
                    </div>
                )}
            </td>
            <td className="py-4 px-4">
                {formatDate(notification.scheduledFor)},{" "}
                {formatTime(notification.scheduledFor)}
            </td>
            <td>
                <button
                    className="bg-gray-700 text-sm px-[15px] py-[8px] rounded-full flex items-center gap-1 hover:bg-gray-800"
                    disabled={isResending}
                    onClick={() => resendNotification()}
                >
                    {isResending ? <Spinner /> : <></>}
                    Resend
                </button>
            </td>
        </tr>
    );
};

export default Notifications;
