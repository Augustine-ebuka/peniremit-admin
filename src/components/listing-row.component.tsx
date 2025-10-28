import { RootState } from "@/state/store";
import { BASE_URL, formatDate, formatTime, handleError } from "@/utils/app";
import useToast from "@/utils/hooks/use-toast";
import { FetchedListing, Listing } from "@/utils/types";
import axios from "axios";
import { useSelector } from "react-redux";
import AssetComponent from "./asset.component";
import Link from "next/link";
import { routes } from "@/utils/routes";
import { Check, X } from "lucide-react";
import { useModalContext } from "@/_contexts/modal.context";

const ListingRow: React.FC<{
    listing: FetchedListing;
    selectedTab: string;
    reload: () => void;
}> = ({ listing, selectedTab, reload }) => {
    const { notifySuccess, notifyError } = useToast();
    const { token } = useSelector((state: RootState) => state.auth);
    const { assetInfo } = useModalContext();

    const approve = () => {
        axios
            .post(
                BASE_URL + "/api/listings/" + listing.id + "/approve",
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )
            .then((res) => {
                notifySuccess("Listing approval action was successful.");
                reload();
            })
            .catch((err) => {
                handleError(err, notifyError);
            });
    };

    const reject = () => {
        axios
            .post(
                BASE_URL + "/api/listings/" + listing.id + "/reject",
                {
                    reason: "This listing was rejected",
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )
            .then((res) => {
                notifySuccess("Listing rejection action was successful.");
                reload();
            })
            .catch((err) => {
                handleError(err, notifyError);
            });
    };

    return (
        <tr className="text-left border-b border-dark">
            <td className="py-4 px-4">
                <Link href={routes.dashboard.listing(listing.id)}>
                    <AssetComponent
                        token={listing.tokenInformation}
                        onClick={() => {
                            assetInfo.open({
                                token: listing.tokenInformation,
                                refresh: reload,
                            });
                        }}
                    />
                </Link>
            </td>
            <td className="py-4 px-4">{formatDate(listing.createdAt)}</td>
            <td className="py-4 px-4">{formatTime(listing.createdAt)}</td>
            <td className="py-4 px-4">
                <div className="bg-[#678AF7] bg-opacity-10 uppercase  text-[#678AF7]  w-20 h-10 flex items-center justify-center rounded-full  text-xs">
                    New
                </div>
            </td>
            <td className="py-4 px-4 w-[200px]">
                <div className="flex gap-6">
                    {selectedTab === "pending" ? (
                        <>
                            <button
                                onClick={approve}
                                className="flex gap-1.5 py-3 px-3 flex-row items-center justify-center font-medium rounded-md bg-green text-white"
                            >
                                <Check size={18} strokeWidth={3} />
                                <span className="text-sm">Approve</span>
                            </button>
                            <button
                                onClick={reject}
                                className="flex gap-1.5 py-3 px-3 flex-row items-center justify-center font-medium rounded-md bg-red text-white"
                            >
                                <X size={18} strokeWidth={3} />
                                <span className="text-sm">Reject</span>
                            </button>
                        </>
                    ) : (
                        <div className="text-center w-full">--</div>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default ListingRow;
