import React, { useState } from "react";
import ModalComponent from "../modal.component";
import InputComponent from "../input.component";
import ButtonComponent from "../button.component";
import { Token } from "@/utils/types";
import axios from "axios";
import { BASE_URL } from "@/utils/app";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { X } from "lucide-react";
import { useModalContext } from "@/_contexts/modal.context";

interface EditAssetProps {
    token: Token | null;
    refresh?: () => void;
}

export const AssetEditModalContainer = () => {
    const [args, setArgs] = React.useState<EditAssetProps>({
        token: null,
    });
    return {
        Component: () => (
            <EditAsset token={args.token} refresh={args.refresh} />
        ),
        toggle: (t: { token: Token; refresh?: () => void }) => {
            setArgs(() => t);
        },
    };
};

const EditAsset: React.FC<EditAssetProps> = ({ token, refresh }) => {
    const [form, setForm] = useState<Record<string, string>>({
        description: token?.metadata.description || "",
        website: token?.metadata.website || "",
        telegram:
            token?.metadata.communityLinks?.find(
                (link) => link.platform === "telegram",
            )?.link || "",
        twitter:
            token?.metadata.communityLinks?.find(
                (link) => link.platform === "twitter",
            )?.link || "",
        // creatorAddress: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errors, setErrors] = useState<Record<string, string[]>>();
    const { token: authToken } = useSelector((state: RootState) => state.auth);
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const { assetEdit } = useModalContext();

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

        const formData = new FormData();
        if (form.website) formData.append("website", form.website);
        if (form.description) formData.append("description", form.description);
        ["twitter", "telegram"]
            .filter((p) => form[p])
            .forEach((platform, i) => {
                formData.append(`communityLinks[${i}].platform`, platform);
                formData.append(`communityLinks[${i}].link`, form[platform]);
            });

        if (avatar) formData.append("avatar", avatar);

        axios
            .put(BASE_URL + `/tokens/${token?.address}`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            })
            .then(() => {
                refresh && refresh();
                // closeModal();
                assetEdit.close();
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

    return (
        <ModalComponent
            header="Edit Token"
            isOpen={assetEdit.isActive}
            onClose={assetEdit.close}
        >
            {errorMessage && (
                <div className="text-red text-sm p-4">{errorMessage}</div>
            )}

            <div className="p-4 flex flex-col gap-4">
                <InputComponent
                    value={token?.address}
                    labelText="Contract Address"
                    readOnly
                />

                <div className="flex gap-4">
                    <div className="w-full">
                        <InputComponent
                            value={token?.name}
                            labelText="Name"
                            readOnly
                        />
                    </div>

                    <div className="w-full">
                        <InputComponent
                            value={token?.symbol}
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
                {/* <InputComponent
                    value={form.creatorAdress}
                    labelText="Creator Address"
                /> */}

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
