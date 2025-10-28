import { Logo } from "@/components/icons/logo";
import { RootState } from "@/state/store";
import { routes } from "@/utils/routes";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

const GuestLayout = ({ children }: any) => {
    const { token, user } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (token) {
            if (user && !user.emailVerifiedAt) {
                router.replace(routes.verify);
            } else {
                router.replace(routes.dashboard.index);
            }
        }
    }, [token]);
    return (
        <main className="flex h-screen items-center justify-center ">
            <div className="max-w-[600px] flex flex-col w-full p-10  gap-8 justify-center">
                <div className=" flex justify-center">
                    <Logo width="100" height="100" />
                </div>
                {children}
            </div>
        </main>
    );
};

export default GuestLayout;
