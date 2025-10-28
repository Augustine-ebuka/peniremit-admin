import TopLayout from "@/layouts/naigation/top.layout";
import { login } from "@/state/slices/auth";
import { RootState } from "@/state/store";
import { BASE_URL } from "@/utils/app";
import useToast from "@/utils/hooks/use-toast";
import { routes } from "@/utils/routes";
import axios from "axios";
import { Ellipsis } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const Dashboard = () => {
    const { token, user } = useSelector((state: RootState) => state.auth);
    const { notifyError } = useToast();
    const dispatch = useDispatch();
    const router = useRouter();

    const handleUserData = async () => {
        axios
            .get(BASE_URL + "/api/auth/user", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data", // Important for file uploads
                },
            })
            .then((response) => {
                dispatch(
                    login({
                        user: response.data.user,
                        token: token!,
                    }),
                );
            })
            .catch(() => {
                notifyError("An error occurred while fetching user data");
            });
    };

    useEffect(() => {
        handleUserData();
    }, []);

    useEffect(() => {
        if (!token) router.replace(routes.login);
        if (user?.status === "approved") {
            router.push(routes.dashboard.index);
        } else if (user?.deletedAt) {
            router.push(routes.dashboard.deleted);
        } else if (user?.status === "rejected") {
            router.push(routes.dashboard.rejected);
        }
    }, [user]);

    return (
        <main className="h-screen flex flex-col">
            <TopLayout />
            <div className="h-full flex overflow-auto items-start mt-20">
                <div className="w-full flex-1 overflow-auto p-8 border-dark rounded-2xl mx-auto border max-w-xl">
                    <div className="flex items-center justify-center">
                        <div className="h-24 w-24 text-yellow-500 rounded-full flex items-center justify-center bg-dark mb-4">
                            <Ellipsis />
                        </div>
                    </div>
                    <div className="text-center text-sm">
                        Your account is pending approval <br /> Check back later
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
