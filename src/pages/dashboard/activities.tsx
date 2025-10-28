import ActivityComponent from "@/components/activity.component";
import AssetComponent from "@/components/asset.component";
import DropdownComponent from "@/components/dropdown.component";
import InputComponent from "@/components/input.component";
import PaginationComponent from "@/components/pagination.component";
import StatComponent from "@/components/stat.component";
import AuthLayout from "@/layouts/auth.layout";
import { RootState } from "@/state/store";
import { BASE_URL } from "@/utils/app";
import useDebounce from "@/utils/hooks/use-debounce";
import { Activity } from "@/utils/types";
import axios from "axios";
import { Ellipsis, Filter, Layers, Receipt, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Activities = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useSelector((state: RootState) => state.auth);
    const [selectedFilter, setSelectedFilter] = useState<{
        key: string;
        value: string;
    }>();

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

    const activityOptions = {
        "clear-filters": "",
        latest: "Latest",
        earliest: "Earliest",
        "approve-listing": "Approved Listing",
        "reject-listing": "Rejected Listing",
        "list-token": "Listed Token",
        "delist-token": "Delisted Token",
        "delete-token": " Deleted Token",
        "withdraw-fees": "Withdrew Fees",
        "approve-user": "Approved User",
        "change-user-role": "Changed User Role",
        "delete-user": "Deleted User",
        "sent-notification": "Sent Notification",
        "edit-token": "Edited Token",
        "create-token": "Created Token",
    };

    const getFilters = () => {
        let type;
        if (
            !(
                selectedFilter?.key === "latest" ||
                selectedFilter?.key === "earliest" ||
                selectedFilter?.key === "clear-filters"
            )
        ) {
            type = selectedFilter?.key;
        }
        return {
            order_by: "created_at",
            order:
                (selectedFilter?.key || "latest") === "earliest"
                    ? "asc"
                    : "desc",
            type,
        };
    };

    const loadActivities = () => {
        axios
            .get(BASE_URL + "/api/activities", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    ...getFilters(),
                    page,
                    limit,
                },
            })
            .then((res) => {
                setActivities(res.data.activities.data || []);
                setMeta({
                    total: res.data.activities.meta.total,
                    lastPage: res.data.activities.meta.lastPage,
                });
            })
            .catch((err) => {
                console.log("Error fetching activities: ", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        loadActivities();
    }, [selectedFilter, page, limit]);

    return (
        <AuthLayout>
            {/* Heading */}
            <div>
                <h2 className="font-medium text-2xl text-white">Activity</h2>
                <h4 className="font-light mt-2">View Activity History here</h4>
            </div>

            {/* Table Navigation */}
            <nav className="mt-10 border-b pb-4 border-dark">
                <div className="grid grid-cols-4 gap-4 justify-end">
                    <div className="col-span-4">
                        <DropdownComponent
                            options={Object.entries(activityOptions).map(
                                ([key, value]) => ({
                                    key,
                                    value,
                                }),
                            )}
                            renderIcon={() => <Filter size={16} />}
                            renderOption={(option: {
                                key: string;
                                value: string;
                            }) => (
                                <span className="capitalize">
                                    {option.value || "Clear Filter"}
                                </span>
                            )}
                            className="py-3.5"
                            selectedValue={
                                selectedFilter || {
                                    key: "",
                                    value: "",
                                }
                            }
                            setSelectedValue={(data) => setSelectedFilter(data)}
                            placeHolder="Filter"
                        />
                    </div>
                </div>
            </nav>

            {/* Activities */}
            {activities.length > 0 && (
                <div className="mt-10 relative">
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

            {isLoading && <div className="text-center mt-10">Loading...</div>}
            {!isLoading && activities.length < 1 && (
                <div className="text-center mt-10 border p-5 rounded-lg border-dark">
                    Nothing here yet
                </div>
            )}
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

export default Activities;
