import ButtonComponent from "@/components/button.component";
import InputComponent from "@/components/input.component";
import { login } from "@/state/slices/auth";
import { BASE_URL } from "@/utils/app";
import { routes } from "@/utils/routes";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Logo } from "@/components/icons/logo";

const Verify = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") as string;
    const [otp, setOtp] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (!email) router.push(routes.login);
    }, [email]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [resendTimer]);

    const shortenEmail = (value?: string) => {
        if (!value) return "";

        const [username = "", domain = ""] = value.split("@");
        const domainParts = (domain && domain.split(".")) || [""];

        const shortenedUsername =
            username.length > 3 ? `${username.slice(0, 3)}***` : `${username[0] || ""}***`;

        const shortenedDomain = domainParts.length > 1 ? `${(domainParts[0][0] || "")}***.${domainParts[1]}` : domain;

        return `${shortenedUsername}@${shortenedDomain}`;
    };

    const secondsToMMSS = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    };

    const handleVerify = () => {
        setIsLoading(true);
        setErrorMessage("");

        axios
            .post(BASE_URL + "/auth/verify-otp", {
                otp: otp,
                email: email,
            })
            .then((response) => {
                console.log(response);
                dispatch(
                    login({
                        user: response?.data?.data?.user,
                        token: response?.data?.data?.token,
                    }),
                );

                toast.success("Login sucessful, redirecting to dashboard...");
                router.push(routes.dashboard.index);
            })
            .catch((error) => {
                console.log(error);
                const msg = error?.response?.data
                const msg2 = error?.response?.data?.errors?.[0]?.message;
                const msg3 = error?.response?.data?.message;
                setErrorMessage(msg || msg2 || msg3 || "An error occurred");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };



    const handleResend = () => {
        if (!canResend) return;

        setIsLoading(true);
        setErrorMessage("");

        axios
            .post(BASE_URL + "/auth", { email })
            .then(() => {
                setResendTimer(59);
                setCanResend(false);
            })
            .catch((error) => {
                const msg = error?.response?.data?.errors?.message;
                const msg2 = error?.response?.data?.errors?.[0]?.message;
                const msg3 = error?.response?.data?.message;
                setErrorMessage(
                    msg ||
                        msg2 ||
                        msg3 ||
                        "An error occurred while resending OTP",
                );
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <main className="flex h-screen items-center justify-center">
            <div className="form-center max-w-[600px] flex flex-col w-full rounded-xl p-10 gap-8">
                <div className=" flex justify-center">
                    <Logo width="100" height="100" />
                </div>
                <div>
                    <div className="text-center">
                        <h2 className="text-3xl text-white font-semibold">
                            Verify your account
                        </h2>
                        <p className="text-neutral mt-2 text-sm">
                            Enter the 6-digit OTP sent to{" "}
                            <span className="font-bold text-white">
                                {shortenEmail(email)}
                            </span>{" "}
                            to verify
                        </p>
                        {errorMessage && (
                            <div className="text-red mt-2">{errorMessage}</div>
                        )}
                    </div>
                </div>
                <div>
                    <InputComponent
                        type="text"
                        autoComplete="off"
                        labelText="OTP Code"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </div>

                <div className="text-sm">
                    {canResend ? (
                        <span
                            className="cursor-pointer text-white"
                            onClick={handleResend}
                        >
                            Resend OTP
                        </span>
                    ) : (
                        <span>
                            Did not receive OTP, resend code in{" "}
                            {secondsToMMSS(resendTimer)}
                        </span>
                    )}
                </div>
                <div>
                    <ButtonComponent onClick={handleVerify} loading={isLoading}>
                        Verify
                    </ButtonComponent>
                </div>
                {/* <div className="mt-4 text-sm text-center">
                    Already have an account?{" "}
                    <a href={routes.login} className="font-semibold">
                        Sign In
                    </a>
                </div> */}
            </div>
        </main>
    );
};

export default Verify;
