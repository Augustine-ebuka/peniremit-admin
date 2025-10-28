import { toast, ToastOptions, Theme } from "react-toastify";

type ToastType = "error" | "success" | "warning";

const defaultOptions: ToastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored" as Theme,
};

const useToast = () => {
    const notify = (message: string, type: ToastType) => {
        switch (type) {
            case "error":
                toast.error(message, defaultOptions);
                break;
            case "success":
                toast.success(message, defaultOptions);
                break;
            case "warning":
                toast.warning(message, defaultOptions);
                break;
            default:
                toast(message, defaultOptions);
        }
    };

    return {
        notifyError: (message: string) => notify(message, "error"),
        notifySuccess: (message: string) => notify(message, "success"),
        notifyWarning: (message: string) => notify(message, "warning"),
    };
};

export default useToast;
