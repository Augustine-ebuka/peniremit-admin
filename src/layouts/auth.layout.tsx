import React, { useEffect, useState } from "react";
import SideLayout from "@/layouts/naigation/side.layout";
import TopLayout from "./naigation/top.layout";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { RootState } from "@/state/store";
import { routes } from "@/utils/routes";
import { Menu } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "@/utils/app";
import { login } from "@/state/slices/auth";
import useToast from "@/utils/hooks/use-toast";

const AuthLayout = ({ children }: any) => {
    const { token, user } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const [navOpen, setNavOpen] = useState(false);
    const dispatch = useDispatch();
    const { notifyError } = useToast();

    const handleUserData = async () => {
        axios
            .get(BASE_URL + `/users/${user?.id}`, {
                headers: { Authorization: `Bearer ${token}` },
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
        if (!token) {
            router.replace(routes.login);
        } else if (user) {
            if (!user.emailVerifiedAt) {
                router.replace(routes.verify);
            } else if (user.status === "pending") {
                router.replace(routes.dashboard.pending);
            } else if (user.status === "rejected") {
                router.replace(routes.dashboard.rejected);
            } else if (user.deletedAt) {
                router.replace(routes.dashboard.deleted);
            }
        }
    }, [token]);
    return (
        <main className="h-screen flex flex-col">
            <TopLayout />
            <div className="h-full flex overflow-auto">
                <SideLayout open={navOpen} close={() => setNavOpen(false)} />
                <div className="w-full flex-1 overflow-auto p-8">
                    <div className="mb-4 md:hidden">
                        <button
                            className="h-10 w-10 text-white flex items-center justify-center mb-4 border border-dark rounded-lg"
                            onClick={() => setNavOpen(!navOpen)}
                        >
                            <Menu size={16} />
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </main>
    );
};

export default AuthLayout;
