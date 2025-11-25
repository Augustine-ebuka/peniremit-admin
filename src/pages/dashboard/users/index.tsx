import ActionButton from "@/components/action-button.component";
import DropdownComponent from "@/components/dropdown.component";
import { Spinner } from "@/components/icons/spinner";
import ImageComponent from "@/components/image.component";
import InputComponent from "@/components/input.component";
import ChangeRole from "@/components/modals/change-role";
import PaginationComponent from "@/components/pagination.component";
import TabView from "@/components/tabview.component";
import AuthLayout from "@/layouts/auth.layout";
import { RootState } from "@/state/store";
import { BASE_URL, formatDate, formatTime, handleError } from "@/utils/app";
import useDebounce from "@/utils/hooks/use-debounce";
import useToast from "@/utils/hooks/use-toast";
import { routes } from "@/utils/routes";
import { Tab, User } from "@/utils/types";
import axios from "axios";
import { Filter, Search } from "lucide-react";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
const initTabs: Tab[] = [
    { id: "approved", label: "Approved", count: 0 },
    { id: "pending", label: "Pending", count: 0 },
    { id: "rejected", label: "Rejected", count: 0 },
    { id: "deleted", label: "Deleted", count: 0 },
];

type TabType = "approved" | "pending" | "rejected" | "deleted";

const Users = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [active, setActive] = useState<{
        page: number;
        total: number;
        users: User[];
    }>({
        page: 1,
        total: 0,
        users: [],
    });

    const [pending, setPending] = useState<{
        page: number;
        total: number;
        users: User[];
    }>({
        page: 1,
        total: 0,
        users: [],
    });

    const [rejected, setRejected] = useState<{
        page: number;
        total: number;
        users: User[];
    }>({
        page: 1,
        total: 0,
        users: [],
    });

    const [deleted, setDeleted] = useState<{
        page: number;
        total: number;
        users: User[];
    }>({
        page: 1,
        total: 0,
        users: [],
    });
    const { token } = useSelector((state: RootState) => state.auth);
    const [selectedFilter, setSelectedFilter] = useState<string | null>();
    const [isLoading, setIsLoading] = useState(true);
    const tabs = useMemo(
        () =>
            initTabs.map((a) => ({
                ...a,
                count:
                    a.id === "pending"
                        ? pending.total
                        : a.id === "approved"
                          ? active.total
                          : a.id === "rejected"
                            ? rejected.total
                            : deleted.total,
            })),
        [pending, active],
    );
    const [selectedTab, setSelectedTab] = useState<TabType>("approved");
    const current = useMemo(
        () =>
            selectedTab === "pending"
                ? pending
                : selectedTab === "approved"
                  ? active
                  : selectedTab === "rejected"
                    ? rejected
                    : deleted,
        [selectedTab, pending, active, rejected, deleted],
    );
    const limit = useMemo(() => 10, []);

    const handlePageChange = useCallback(
        (newPage: number) => {
            if (selectedTab === "approved") {
                setActive((prev) => ({ ...prev, page: newPage }));
            } else if (selectedTab === "pending") {
                setPending((prev) => ({ ...prev, page: newPage }));
            } else if (selectedTab === "rejected") {
                setRejected((prev) => ({ ...prev, page: newPage }));
            } else {
                setDeleted((prev) => ({ ...prev, page: newPage }));
            }
        },
        [selectedTab],
    );

    const handleTabSelect = useCallback((tab: TabType) => {
        setSelectedTab(tab);
        handlePageChange(1);
        loadRoles(tab!);
    }, []);

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

    const loadRoles = (
        status: "pending" | "approved" | "rejected" | "deleted" = "approved",
    ) => {
        axios
            .get(BASE_URL + "/api/roles", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    ...getFilter(),
                    s: debouncedSearchTerm,
                    page: current.page,
                    limit,
                    status: status === "deleted" ? "approved" : status,
                    deleted: status === "deleted",
                },
            })
            .then((res) => {
                if (status === "pending") {
                    setPending(() => ({
                        page: res.data.users.meta.currentPage,
                        total: res.data.users.meta.total,
                        users: res.data.users.data || [],
                    }));
                } else if (status === "approved") {
                    setActive(() => ({
                        page: res.data.users.meta.currentPage,
                        total: res.data.users.meta.total,
                        users: res.data.users.data || [],
                    }));
                } else if (status === "rejected") {
                    setRejected(() => ({
                        page: res.data.users.meta.currentPage,
                        total: res.data.users.meta.total,
                        users: res.data.users.data || [],
                    }));
                } else if (status === "deleted") {
                    setDeleted(() => ({
                        page: res.data.users.meta.currentPage,
                        total: res.data.users.meta.total,
                        users: res.data.users.data || [],
                    }));
                }
            })
            .catch((err) => {
                console.log("Error fetching roles: ", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const reload = useCallback(() => {
        loadRoles("approved");
        loadRoles("pending");
        loadRoles("rejected");
        loadRoles("deleted");
    }, [loadRoles]);

    useEffect(() => {
        reload();
    }, [debouncedSearchTerm, selectedFilter, limit, current.page]);

    return (
        <AuthLayout>
            {/* Heading */}
            <div>
                <h2 className="font-medium text-2xl text-white">
                    Roles And Permissions
                </h2>
                <h4 className="font-light mt-2">
                    Here is a list of all users on Peniwallet
                </h4>
            </div>

            {/* Table Navigation */}
            <nav className="mt-10">
                <div className="grid grid-cols-4 gap-4 justify-between">
                    <div className="col-span-2 md:col-span-1">
                        <InputComponent
                            prefix={<Search size={20} />}
                            className="w-full shrink-0 placeholder:text-neutral-600"
                            placeholder="Search User"
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

            <div className="overflow-x-auto mt-4">
                <TabView
                    tabs={tabs}
                    selectedTab={selectedTab}
                    onTabSelect={(t) => handleTabSelect(t as TabType)}
                    loading={isLoading}
                />
            </div>

            {/* Asset Table */}
            <div className="mt-2 overflow-auto text-sm items-start min-h-[200px]">
                <table className="w-full min-w-[100px]">
                    <thead>
                        <tr className=" text-left  bg-dark">
                            <th className="min-w-[150px] py-5 px-4 font-medium text-white rounded-tl-lg">
                                User
                            </th>
                            <th className="min-w-[150px] py-5 px-4 font-medium text-white">
                                Date Joined
                            </th>
                            <th className="min-w-[120px] py-5 px-4 font-medium text-white">
                                Role
                            </th>
                            <th className="min-w-[120px] w-[200px] py-5 px-4 font-medium text-white text-center rounded-tr-lg">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    {/* Asset Rows */}
                    {/* Example Row */}
                    <tbody>
                        <UsersTable
                            users={current.users}
                            reload={() => reload()}
                            isLoading={isLoading}
                        />
                    </tbody>
                </table>
            </div>

            <div>
                <PaginationComponent
                    meta={{
                        total: current.total,
                        lastPage: Math.ceil(current.total / limit),
                    }}
                    page={current.page}
                    limit={limit}
                    onPageChange={handlePageChange}
                />
            </div>
        </AuthLayout>
    );
};

const UsersTable = ({
    users,
    reload,
    isLoading,
}: {
    users: User[];
    reload: () => void;
    isLoading: boolean;
}) => {
    return (
        <>
            {users.map((user) => (
                <UserRow key={user.id} user={user} reload={() => reload()} />
            ))}

            {users.length === 0 && !isLoading && (
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
    );
};

const UserRow = ({ user, reload }: { user: User; reload: () => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const actions = [
        { key: "remove", value: "Remove" },
        { key: "role", value: "Change Role" },
    ];
    const { token } = useSelector((state: RootState) => state.auth);
    const { notifySuccess, notifyError } = useToast();
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const router = useRouter();

    const handleActionSelect = (key: string) => {
        switch (key) {
            case "remove":
                handleRemove();
                break;
            case "role":
                setIsModalOpen(true);
                break;
            default:
                console.log("Unknown action selected");
        }
    };

    const handleUpdateRole = (status: string) => {
        setIsUpdatingStatus(true);
        axios
            .post(
                `${BASE_URL}/api/roles/${user.id}/status`,
                {
                    status,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )
            .then((res) => {
                setIsUpdatingStatus(false);
                reload();
                notifySuccess("User role successfully updated.");
            })
            .catch((err) => {
                handleError(err, notifyError);
            });
    };

    const handleRemove = () => {
        axios
            .delete(
                BASE_URL + "/api/roles/" + user.id,

                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )
            .then((res) => {
                reload();
                notifySuccess("User removed successfully.");
            })
            .catch((err) => {
                handleError(err, notifyError);
            });
    };

    return (
        <tr className="text-left border-b border-dark ">
            <td
                className="py-4 px-4 cursor-pointer"
                onClick={() => router.push(routes.dashboard.user(user.id))}
            >
                <div className="flex gap-3 items-center">
                    <ImageComponent
                        className="w-10 h-10 rounded-full"
                        src={user.avatarUrl || ""}
                        alt={user.username}
                    />
                    <div>
                        <p className="text-neutral text-base">
                            {user.username}
                        </p>
                        <p className="text-neutral-600 text-opacity-60 text-xs">
                            {user.email}
                        </p>
                    </div>
                </div>
            </td>
            <td className="py-4 px-4 w-[250px]">
                {formatDate(user.createdAt as string)}{" "}
                {formatTime(user.createdAt as string)}
            </td>
            <td className="py-4 px-4  w-[280px]">
                {user.role?.toUpperCase() || "-"}
                <ChangeRole
                    userId={user.id.toString()}
                    isModalOpen={isModalOpen}
                    closeModal={() => {
                        reload();
                        setIsModalOpen(false);
                    }}
                />
            </td>
            <td className="py-4 px-4 w-[200px] text-center flex justify-center">
                {!isUpdatingStatus &&
                    user.status === "approved" &&
                    !user.deletedAt && (
                        <ActionButton
                            actions={actions}
                            onActionSelect={(data) => handleActionSelect(data)}
                        />
                    )}
                {!isUpdatingStatus && user.status === "pending" && (
                    <div className="flex justify-center gap-[10px]">
                        <button
                            className="text-xs bg-green text-white px-[10px] py-[5px] rounded-full"
                            onClick={() => handleUpdateRole("approved")}
                        >
                            Approve
                        </button>
                        <button
                            className="text-xs bg-red text-white px-[10px] py-[5px] rounded-full"
                            onClick={() => handleUpdateRole("rejected")}
                        >
                            Reject
                        </button>
                    </div>
                )}

                {isUpdatingStatus && <Spinner />}
            </td>
        </tr>
    );
};

export default Users;
