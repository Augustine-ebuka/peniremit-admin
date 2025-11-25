import ButtonComponent from "@/components/button.component";
import InputComponent from "@/components/input.component";
import GuestLayout from "@/layouts/guest.layout";
import { BASE_URL } from "@/utils/app";
import { routes } from "@/utils/routes";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useState } from "react";
import toast from "react-hot-toast";

const Login = () => {
    const [email, setEmail] = useState("");
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        setIsLoading(true);
        setErrorMessage("");

        axios
            .post(BASE_URL + "/auth", {
                email,
            })
            .then(() => {
                toast.success("OTP sent to your email");
                router.push({
                    pathname: routes.verify,
                    query: { email },
                });
            })
            .catch((error) => {
                const msg = error?.response?.data?.errors?.message;
                const msg2 = error?.response?.data?.errors?.[0]?.message;
                setErrorMessage(msg || msg2 || "An error occurred");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <GuestLayout>
            <div className="text-center">
                <h2 className="text-3xl text-white font-semibold">Sign In</h2>
                <p className="text-neutral mt-2">
                    Sign in to your account to continue
                </p>
                {errorMessage && (
                    <div className="text-red mt-2">{errorMessage}</div>
                )}
            </div>
            <div>
                <InputComponent
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    labelText="Email Address"
                    placeholder="jane@gmail.com"
                    type="email"
                    autoComplete="off"
                />
            </div>

            <div>
                <ButtonComponent onClick={handleLogin} loading={isLoading}>
                    Sign In
                </ButtonComponent>
            </div>
            <div className="mt-4 text-sm text-center">
                Don't have an account?{" "}
                <a href={routes.register} className="font-semibold">
                    Sign Up
                </a>
            </div>
        </GuestLayout>
    );
};

export default Login;
