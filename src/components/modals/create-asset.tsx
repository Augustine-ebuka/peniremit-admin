import React, { useEffect, useState } from "react";
import ModalComponent from "../modal.component";
import InputComponent from "../input.component";
import ButtonComponent from "../button.component";
import { RootState } from "@/state/store";
import { useSelector } from "react-redux";
import { BASE_URL, publicClient } from "@/utils/app";
import axios from "axios";
import useDebounce from "@/utils/hooks/use-debounce";
import { erc20Abi } from "viem";
import { X } from "lucide-react";

interface CreateAssetProps {
    isModalOpen: boolean;
    closeModal: () => void;
    refresh?: () => void;
}

const CreateAsset: React.FC<CreateAssetProps> = ({
    isModalOpen,
    closeModal,
    refresh,
}) => {
    const [form, setForm] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errors, setErrors] = useState<Record<string, string[]>>();
    const { token } = useSelector((state: RootState) => state.auth);
    const [tokenName, setTokenName] = useState("");
    const [tokenSymbol, setTokenSymbol] = useState("");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

    const handleSubmit = () => {
        setIsLoading(true);
        setErrorMessage("");

        // Using FormData for file upload
        const formData = new FormData();
        formData.append("contractAddress", form.address || "");
        formData.append("website", form.website || "");
        formData.append("description", form.description || "");
        formData.append("chainId", "56"); // Example static value
        formData.append("communityLinks[0][platform]", "twitter");
        formData.append("communityLinks[0][link]", form.twitter || "");
        formData.append("communityLinks[1][platform]", "telegram");
        formData.append("communityLinks[1][link]", form.telegram || "");
        formData.append("category", form.category || "");
        formData.append("creatorAddress", form.creatorAddress || "");
        if (avatar) {
            formData.append("avatar", avatar);
        }

        axios
            .post(BASE_URL + "/api/assets/", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data", // Important for file uploads
                },
            })
            .then(() => {
                refresh && refresh();
                closeModal();
                setErrorMessage("");
                setErrors({});
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

    const loadNameAndSymbol = async () => {
        try {
            const tokenAddress = form.address as `0x${string}`; // Replace with your token's address

            const [name, symbol] = await Promise.all([
                publicClient.readContract({
                    address: tokenAddress,
                    abi: erc20Abi,
                    functionName: "name",
                }),
                publicClient.readContract({
                    address: tokenAddress,
                    abi: erc20Abi,
                    functionName: "symbol",
                }),
            ]);

            setTokenName(name);
            setTokenSymbol(symbol);
        } catch (error) {
            console.log("Error fetching token info: ", error);
        }
    };

    useEffect(() => {
        loadNameAndSymbol();
    }, [form.address]);

    return (
        <ModalComponent
            header="Create/Edit Token"
            isOpen={isModalOpen}
            onClose={closeModal}
        >
            {errorMessage && (
                <div className="text-red text-sm p-4">{errorMessage}</div>
            )}

            <div className="p-4 flex flex-col gap-4">
                <InputComponent
                    value={form.address}
                    labelText="Contract Address"
                    errors={errors?.contractAddress}
                    onChange={(e) =>
                        setForm((f) => ({
                            ...f,
                            address: e.target.value,
                        }))
                    }
                />

                <div className="flex gap-4">
                    <div className="w-full">
                        <InputComponent
                            value={tokenName}
                            labelText="Name"
                            readOnly
                        />
                    </div>

                    <div className="w-full">
                        <InputComponent
                            value={tokenSymbol}
                            labelText="Symbol"
                            readOnly
                        />
                    </div>
                </div>

                <InputComponent
                    value={form.website}
                    errors={errors?.website}
                    labelText="Website"
                    onChange={(e) =>
                        setForm((f) => ({
                            ...f,
                            website: e.target.value,
                        }))
                    }
                />

                <InputComponent
                    value={form.description || ""}
                    labelText="Description"
                    errors={errors?.description}
                    onChange={(e) =>
                        setForm((f) => ({
                            ...f,
                            description: e.target.value,
                        }))
                    }
                />

                <InputComponent
                    value={form.category}
                    labelText="Category"
                    placeholder="Defi"
                    errors={errors?.category}
                    onChange={(e) =>
                        setForm((f) => ({
                            ...f,
                            category: e.target.value,
                        }))
                    }
                />

                <InputComponent
                    value={form.creatorAddress}
                    labelText="Creator Address"
                    errors={errors?.creatorAddress}
                    onChange={(e) =>
                        setForm((f) => ({
                            ...f,
                            creatorAddress: e.target.value,
                        }))
                    }
                />

                <InputComponent
                    value={form.telegram}
                    errors={errors?.telegram}
                    labelText="Telegram"
                    onChange={(e) =>
                        setForm((f) => ({
                            ...f,
                            telegram: e.target.value,
                        }))
                    }
                />

                <InputComponent
                    value={form.twitter}
                    errors={errors?.twitter}
                    labelText="Twitter"
                    onChange={(e) =>
                        setForm((f) => ({
                            ...f,
                            twitter: e.target.value,
                        }))
                    }
                />

                <div className="flex flex-col gap-2">
                    <label className="block mb-2 text-white text-sm">
                        Avatar
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-primary file:cursor-pointer hover:file:bg-gray-100"
                    />
                    {avatarPreview && (
                        <img
                            src={avatarPreview}
                            alt="Avatar Preview"
                            className="w-32 h-32 object-cover rounded-full mt-2"
                        />
                    )}

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
                </div>

                <ButtonComponent
                    onClick={handleSubmit}
                    loading={isLoading}
                    className="rounded-full mt-6"
                >
                    Save
                </ButtonComponent>
            </div>
        </ModalComponent>
    );
};

export default CreateAsset;
