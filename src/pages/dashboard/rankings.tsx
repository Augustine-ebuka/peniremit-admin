import { DurationSelectorComponent } from "@/components/duration-selector.component";
import ImageComponent from "@/components/image.component";
import PaginationComponent from "@/components/pagination.component";
import AuthLayout from "@/layouts/auth.layout";
import { RootState } from "@/state/store";
import { BASE_URL } from "@/utils/app";
import { routes } from "@/utils/routes";
import { User } from "@/utils/types";
import axios from "axios";
import { endOfDay, startOfDay } from "date-fns";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
const now = new Date();
type UserWithToken = User & { tokenCount: number };
const limit = 10;

const Users = () => {
    const { token } = useSelector((state: RootState) => state.auth);
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<UserWithToken[]>([]);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, page: 1 });
    const [duration, setDuration] = useState({
        start: startOfDay(now),
        end: endOfDay(now),
        duration: "last 7days",
    });

    const loadUsers = useCallback(() => {
        setIsLoading(true);
        setUsers([]);
        axios
            .get(BASE_URL + "/api/activities/users/", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    duration_start: duration.start.toISOString(),
                    duration_end: duration.end.toISOString(),
                    limit,
                    page,
                },
            })
            .then((res) => {
                setUsers(res.data.users.data);
                setMeta(res.data.users.meta);
            })
            .catch((err) => {
                console.log("Error fetching roles: ", err);
            })
            .finally(() => {
                // setUsers
                setIsLoading(false);
            });
    }, [duration, page, token]);

    useEffect(() => {
        loadUsers();
    }, [duration, page]);

    return (
        <AuthLayout>
            {/* Heading */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-[100px]">
                <div>
                    <h2 className="font-medium text-2xl text-white">Ranking</h2>
                    <h4 className="font-light mt-2">
                        Moderators ranking based on the number of tokens updated
                    </h4>
                </div>

                <DurationSelectorComponent
                    defaultDuration="this_month"
                    onUpdated={(d) => {
                        setDuration(d);
                    }}
                />
            </div>

            {/* Asset Table */}
            <div className="mt-2 jus text-sm items-start min-h-[200px]">
                <table>
                    <thead>
                        <tr className=" text-left  bg-dark">
                            <th className="min-w-[50px] py-5 px-4 font-medium text-white rounded-tl-lg">
                                #
                            </th>
                            <th className="min-w-[50px] py-5 px-4 font-medium text-white">
                                User
                            </th>
                            <th className="min-w-[50px] py-5 px-4 font-medium text-white rounded-tr-lg ">
                                Tokens Updated
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        <UsersTable
                            users={users}
                            page={page}
                            reload={() => null}
                            isLoading={isLoading}
                        />
                    </tbody>
                </table>
            </div>

            <div>
                <PaginationComponent
                    meta={{
                        total: meta.total,
                        lastPage: Math.ceil(meta.total / limit),
                    }}
                    page={page}
                    limit={limit}
                    onPageChange={(p) => setPage(p)}
                />
            </div>
        </AuthLayout>
    );
};

const UsersTable = ({
    users,
    reload,
    isLoading,
    page,
}: {
    users: UserWithToken[];
    reload: () => void;
    isLoading: boolean;
    page: number;
}) => {
    return (
        <>
            {users.map((user, index) => (
                <UserRow
                    key={user.id}
                    user={user}
                    reload={() => reload()}
                    index={page * limit - limit + index + 1}
                />
            ))}

            {isLoading && (
                <tr>
                    <td
                        colSpan={3}
                        className="text-center text-neutral-600 text-sm py-6 border-b border-dark"
                    >
                        Loading...
                    </td>
                </tr>
            )}

            {users.length === 0 && !isLoading && (
                <tr>
                    <td
                        colSpan={3}
                        className="text-center text-neutral-600 text-sm py-6 border-b border-dark"
                    >
                        There is nothing here yet
                    </td>
                </tr>
            )}
        </>
    );
};

const UserRow = ({
    user,
    reload,
    index,
}: {
    user: UserWithToken;
    reload: () => void;
    index: number;
}) => {
    const router = useRouter();
    return (
        <tr className="text-left border-b border-dark ">
            <td className="py-4 px-4">
                <p className="text-neutral text-base">{index}</p>
            </td>
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
            <td className="py-4 px-4">
                <p className="text-neutral text-base">{user.tokenCount}</p>
            </td>
        </tr>
    );
};

export default Users;
