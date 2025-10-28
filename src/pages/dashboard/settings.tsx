import ButtonComponent from "@/components/button.component";
import ImageComponent from "@/components/image.component";
import InputComponent from "@/components/input.component";
import TabView from "@/components/tabview.component";
import AuthLayout from "@/layouts/auth.layout";
import { login } from "@/state/slices/auth";
import { RootState } from "@/state/store";
import { BASE_URL, handleError } from "@/utils/app";
import useToast from "@/utils/hooks/use-toast";
import { Tab } from "@/utils/types";
import axios from "axios";
import { Edit, X } from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Settings = () => {
    const [selectedTab, setSelectedTab] = useState<string>("profile");

    const tabs: Tab[] = [
        { id: "profile", label: "Profile" },
        // { id: "password", label: "Password Settings" },
    ];

    const handleTabSelect = (tabId: string) => {
        setSelectedTab(tabId);
    };

    return (
        <AuthLayout>
            {/* Header */}
            <div>
                <h2 className="font-medium text-2xl text-white">Settings</h2>
            </div>

            {/* Navvigation */}
            <nav>
                <div className="overflow-x-auto mt-4">
                    <TabView
                        tabs={tabs}
                        selectedTab={selectedTab}
                        onTabSelect={handleTabSelect}
                    />
                </div>
            </nav>

            {selectedTab === "profile" && <SettingsProfile />}
        </AuthLayout>
    );
};

const PasswordSettings = () => {
    const initForm = {
        old_password: "",
        new_password: "",
        new_password_confirmation: "",
    };
    const { token } = useSelector((state: RootState) => state.auth);
    const [form, setForm] = useState(initForm);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const { notifySuccess, notifyError } = useToast();

    const handlePasswordChange = () => {
        setIsLoading(true);
        setErrorMessage("");

        axios
            .post(
                BASE_URL + "/api/profile/change-password",
                {
                    ...form,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )
            .then((res) => {
                notifySuccess("Password successfully updated.");
                setForm(initForm);
                setErrors({});
                setErrorMessage("");
            })
            .catch((error) => {
                const msg =
                    error?.response?.data.message ||
                    error?.response?.data?.errors?.message;
                const msg2 = error?.response?.data?.errors?.[0]?.field
                    ? "An error occured, please check the form and try again"
                    : error?.response?.data?.errors?.[0]?.message;
                setErrorMessage(msg || msg2 || "An error occurred");

                const errorsData: Record<string, string[]> = {};

                for (const e in error?.response?.data?.errors || []) {
                    const err = error?.response?.data?.errors[e];
                    const field = err.field;
                    errorsData[field] = errorsData[field] || [];
                    errorsData[field].push(err.message);
                }

                setErrors(errorsData);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="border border-dark p-8 rounded-2xl">
            {/* Header */}
            <div>
                <h2 className="font-medium text-xl text-white">
                    Password Settings
                </h2>
                <h4 className="font-light mt-2">
                    Update your account's password
                </h4>

                {errorMessage && (
                    <div className="text-red text-sm py-4">
                        {errorMessage.replace("_", " ")}
                    </div>
                )}

                <div className="flex flex-col pt-6 gap-6">
                    <InputComponent
                        type="password"
                        labelText="Old Password"
                        errors={errors?.old_password}
                        value={form.old_password}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                old_password: e.target.value,
                            }))
                        }
                    />

                    <InputComponent
                        type="password"
                        labelText="New Password"
                        errors={errors?.new_password}
                        value={form.new_password}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                new_password: e.target.value,
                            }))
                        }
                    />

                    <InputComponent
                        type="password"
                        labelText="Confirm New Password"
                        errors={errors?.new_password_confirmation}
                        value={form.new_password_confirmation}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                new_password_confirmation: e.target.value,
                            }))
                        }
                    />

                    <div className="text-right">
                        <ButtonComponent
                            loading={isLoading}
                            onClick={handlePasswordChange}
                            className="w-44"
                        >
                            Update Password
                        </ButtonComponent>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SettingsProfile = () => {
    const { token, user } = useSelector((state: RootState) => state.auth);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [userForm, setUserForm] = useState<Record<string, string>>({
        username: user?.username || "",
    });
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const dispatch = useDispatch();
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setAvatar(null);
            setAvatarPreview(null);
        }
    };

    const handleProfileUpdate = () => {
        setIsLoading(true);
        setErrorMessage("");

        const formData = new FormData();
        formData.append("username", userForm.username);
        if (avatar) {
            formData.append("avatar", avatar);
        }

        axios
            .post(BASE_URL + "/api/profile", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data", // Important for file uploads
                },
            })
            .then((response) => {
                setErrorMessage("");
                setErrors({});
                setAvatarPreview(null);
                dispatch(
                    login({
                        user: response.data.user,
                        token: token!,
                    }),
                );
            })
            .catch((error) => {
                const msg =
                    error?.response?.data.message ||
                    error?.response?.data?.errors?.message;
                const msg2 = error?.response?.data?.errors?.[0]?.field
                    ? "An error occured, please check the form and try again"
                    : error?.response?.data?.errors?.[0]?.message;
                setErrorMessage(msg || msg2 || "An error occurred");

                const errorsData: Record<string, string[]> = {};

                for (const e in error?.response?.data?.errors || []) {
                    const err = error?.response?.data?.errors[e];
                    const field =
                        err.field === "communityLinks.0.link"
                            ? "twitter"
                            : err.field === "communityLinks.1.link"
                              ? "telegram"
                              : err.field;
                    errorsData[field] = errorsData[field] || [];
                    errorsData[field].push(err.message);
                }
                setErrors(errorsData);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="border border-dark p-8 rounded-2xl">
            {/* Header */}
            <div>
                <h2 className="font-medium text-xl text-white">Profile</h2>
                <h4 className="font-light mt-2">
                    View and edit personal details here
                </h4>
                {errorMessage && (
                    <div className="text-red text-sm py-4">
                        {errorMessage.replace("_", " ")}
                    </div>
                )}

                <div className="flex flex-col pt-6 gap-6">
                    <div>
                        <label className="inline-flex items-center cursor-pointer hover:bg-dark/30 p-2 rounded-full border border-dark">
                            <img
                                src={
                                    avatarPreview ||
                                    user?.avatarUrl ||
                                    "https://ui-avatars.com/api/?background=random&name=" +
                                        user?.username
                                }
                                alt={user?.username || "User"}
                                className="object-cover object-center h-14 w-14 rounded-full"
                            />
                            <div className="px-2">
                                <p className="text-neutral text-sm">
                                    Profile Picture
                                </p>
                                <p className="text-xs text-neutral-600 flex items-center gap-2 pt-1">
                                    <Edit size={14} />
                                    Edit
                                </p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            {errors?.avatar && (
                                <div className="flex flex-col gap-1 pt-2">
                                    {errors?.avatar.map((text, i) => (
                                        <div
                                            key={i}
                                            className="text-red flex gap-2 text-xs items-center font-normal"
                                        >
                                            <X size={12} />
                                            {text}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </label>
                    </div>

                    <InputComponent
                        labelText="Username"
                        value={userForm.username}
                        onChange={(e) =>
                            setUserForm((f) => ({
                                ...f,
                                username: e.target.value,
                            }))
                        }
                        errors={errors?.username}
                    />

                    <InputComponent
                        labelText="Email"
                        readOnly
                        disabled
                        className="bg-dark/40 border border-dark"
                        value={user?.email}
                    />
                    <div className="text-right">
                        <ButtonComponent
                            loading={isLoading}
                            onClick={handleProfileUpdate}
                            className="w-44"
                        >
                            Update Profile
                        </ButtonComponent>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
