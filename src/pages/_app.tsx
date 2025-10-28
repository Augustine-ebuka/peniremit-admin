import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, Slide } from "react-toastify";
import { ReduxProvider } from "@/state";
import { ModalContextProvider } from "@/_providers/modal.provider";
import { Toaster } from "react-hot-toast";
export default function App({ Component, pageProps }: AppProps) {
    return (
        <ReduxProvider>
            <ModalContextProvider>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                    transition={Slide}
                />
                <Component {...pageProps} />
            </ModalContextProvider>

            <Toaster />
        </ReduxProvider>
    );
}
