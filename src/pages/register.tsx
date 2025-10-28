import ButtonComponent from "@/components/button.component";
import InputComponent from "@/components/input.component";
import GuestLayout from "@/layouts/guest.layout";
import { BASE_URL } from "@/utils/app";
import { routes } from "@/utils/routes";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useState } from "react";
import toast from "react-hot-toast";

const Register = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const router = useRouter();

    const [errors, setErrors] = useState<Record<string, string[]>>();

    const handleRegister = () => {
        setIsLoading(true);
        setErrorMessage("");

        axios
            .post(BASE_URL + "/api/auth/register", {
                email,
                username,
            })
            .then(() => {
                router.push({
                    pathname: routes.verify,
                    query: { email },
                });
                toast.success(
                    "Account created successfully, taking you to verify your email...",
                );
            })
            .catch((error) => {
                const msg =
                    error?.response?.data.message ||
                    error?.response?.data?.errors?.message;
                const msg2 = error?.response?.data?.errors?.[0]?.message;
                setErrorMessage(msg || msg2 || "An error occurred");

                const errorsData: Record<string, string[]> = {
                    email: [],
                    username: [],
                };

                for (const e in error?.response?.data?.errors || []) {
                    const err = error?.response?.data?.errors[e];
                    errorsData[err.field] = errorsData[err.field] || [];
                    errorsData[err.field].push(err.message);
                }

                setErrors(errorsData);
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
                    labelText="Email Address"
                    type="email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    errors={errors?.email}
                />
            </div>

            <div>
                <InputComponent
                    labelText="Username"
                    type="text"
                    autoComplete="off"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    errors={errors?.username}
                />
            </div>

            <div>
                <ButtonComponent loading={isLoading} onClick={handleRegister}>
                    Create Account
                </ButtonComponent>
            </div>
            <div className="mt-4 text-sm text-center">
                Already have an account?{" "}
                <a href={routes.login} className="font-semibold">
                    Sign In
                </a>
            </div>
        </GuestLayout>
    );
};

export default Register;
