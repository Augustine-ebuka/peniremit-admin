import React, { useState } from "react";
import ModalComponent from "../modal.component";
import InputComponent from "../input.component";
import ButtonComponent from "../button.component";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import axios from "axios";
import useToast from "@/utils/hooks/use-toast"; // Assuming you have a toast utility for notifications
import { BASE_URL } from "@/utils/app";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { X } from "lucide-react";

interface CreateNotificationProps {
    isModalOpen: boolean;
    closeModal: () => void;
    refresh?: () => void;
}

const CreateNotification: React.FC<CreateNotificationProps> = ({
    isModalOpen,
    closeModal,
    refresh,
}) => {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errors, setErrors] = useState<Record<string, string[]>>();
    const { token } = useSelector((state: RootState) => state.auth);

    const toast = useToast(); // Assuming you have a toast for notifications

    const handleDateChange = (date: Date | null) => {
        if (date instanceof Date && !Number.isNaN(date.getTime())) {
            const formattedDate = format(date, "yyyy-MM-dd HH:mm:ss");
            setSelectedDate(formattedDate);
        } else {
            console.error("Invalid date:", date, "Type:", typeof date);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setErrorMessage("");

        axios
            .post(
                BASE_URL + "/api/notifications/new",
                {
                    subject,
                    content,
                    scheduledFor: selectedDate,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )
            .then(() => {
                refresh && refresh();
                closeModal();
                setErrorMessage("");
                setErrors({});
                setSubject("");
                setContent("");
                setSelectedDate(null);
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
            header="Create Notification"
            isOpen={isModalOpen}
            onClose={closeModal}
        >
            {errorMessage && (
                <div className="text-red text-sm p-4">{errorMessage}</div>
            )}

            <div className="p-4 flex flex-col gap-8">
                {/* Subject Input */}
                <InputComponent
                    labelText="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    errors={errors?.subject}
                />

                {/* Content Textarea */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-32 resize-none rounded-lg border bg-primary border-dark py-4 pl-6 pr-10 outline-none focus:ring-white/20 focus:ring-offset-primary focus:ring focus:ring-offset-2 focus-visible:outline-none"
                    ></textarea>
                    {errors?.content && (
                        <div className="flex flex-col gap-1 pt-2">
                            {errors?.content.map((text, i) => (
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

                {/* Date Picker */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="schedule-date">Schedule Date</label>
                    <div className="relative w-full">
                        <DatePicker
                            selected={
                                selectedDate ? new Date(selectedDate) : null
                            }
                            onChange={(date: Date | null) =>
                                handleDateChange(date)
                            }
                            showTimeSelect
                            dateFormat="yyyy-MM-dd HH:mm"
                            placeholderText="Select Date/Time"
                            className="w-full rounded-lg border border-dark bg-primary py-4 pl-6 pr-10 outline-none focus:border-primary dark:border-form-strokedark dark:focus:border-primary"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <ButtonComponent
                    onClick={handleSubmit}
                    loading={isLoading}
                    className="rounded-full mt-6"
                >
                    Send Notification
                </ButtonComponent>
            </div>
        </ModalComponent>
    );
};

export default CreateNotification;
