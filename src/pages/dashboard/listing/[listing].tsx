import icons from "@/components/icon.components";
import ImageComponent from "@/components/image.component";
import ShortenerComponent from "@/components/shortener.component";
import AuthLayout from "@/layouts/auth.layout";
import { RootState } from "@/state/store";
import { BASE_URL, formatUrl } from "@/utils/app";
import { Listing as ListingType } from "@/utils/types";
import axios from "axios";
import { Check, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/router";
import React, { ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { formatEther, formatUnits } from "viem";

const Listing = () => {
    const [listing, setListing] = useState<ListingType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const listingId = router.query.listing as string;

    useEffect(() => {
        if (listingId) {
            loadListing();
        }
    }, [listingId]);

    const loadListing = () => {
        setIsLoading(true);
        axios
            .get(BASE_URL + "/api/listings/" + listingId, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setListing(res.data.listing);
            })
            .catch((err) => {
                console.log("Error fetching relay: ", err);
                setListing(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    if (isLoading) {
        return (
            <AuthLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            </AuthLayout>
        );
    }

    if (!listing) {
        return (
            <AuthLayout>
                <div className="flex flex-col justify-center items-center h-screen">
                    <h2 className="text-2xl font-bold mb-4">
                        No Listing Found
                    </h2>
                    <p className="text-gray-600">
                        The requested listing could not be found or has been
                        removed.
                    </p>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => router.push("/listings")}
                    >
                        Back to Listings
                    </button>
                </div>
            </AuthLayout>
        );
    }

    const totalSupply = Number(
        formatUnits(BigInt(Number(listing.totalSupply)), listing.decimals),
    ).toLocaleString();

    return (
        <AuthLayout>
            {/* Heading */}
            <div className="flex justify-between">
                <div>
                    <h2 className="font-medium text-lg flex items-end gap-2">
                        <span className="text-neutral-400">Listing</span>
                        <span className="py-1.5">
                            <ChevronRight size={16} />
                        </span>
                        <span>{listing.symbol}</span>
                    </h2>
                    <h4 className="font-light mt-2 text-white text-2xl">
                        {listing.name} - {listing.symbol}
                    </h4>
                </div>

                {listing.status === "pending" && (
                    <div className="flex gap-6 items-start">
                        <button className="flex gap-1.5 py-3 px-3 flex-row items-center justify-center font-medium rounded-md bg-green text-white">
                            <Check size={18} strokeWidth={3} />
                            <span className="text-sm">Approve</span>
                        </button>
                        <button className="flex gap-1.5 py-3 px-3 flex-row items-center justify-center font-medium rounded-md bg-red text-white">
                            <X size={18} strokeWidth={3} />
                            <span className="text-sm">Reject</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="w-full flex flex-row rounded-xl border justify-between border-dark p-6 mt-10">
                <div className="w-1/2">
                    <div className="flex flex-col justify-start items-start  px-4 py-4 overflow-scroll">
                        <div className="flex flex-row items-start justify-between  w-full">
                            <div className="flex flex-col gap-4">
                                <ImageComponent
                                    src={listing.logoUrl}
                                    alt={listing.name}
                                    className="rounded-full h-20 w-20"
                                />
                                <div className="text-left ">
                                    <span className="block text-lg font-medium text-[#F4F6FA]">
                                        {listing.name} ({listing.symbol})
                                    </span>
                                    <span className="block text-xs mt-1 font-light text-[#C1C4D6]">
                                        Price not available
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="border border-dashed border-dark w-full my-4" />
                        <table className="table-fixed mt-10">
                            <tbody className="flex flex-col gap-3">
                                <ContractDetailRow
                                    label="Market Cap:"
                                    value="--"
                                />
                                <ContractDetailRow
                                    label="Volume(24h):"
                                    value="--"
                                />
                                <ContractDetailRow
                                    label="Supply:"
                                    value={
                                        `${totalSupply} ${listing.symbol}` ||
                                        "--"
                                    }
                                />
                                <ContractDetailRow
                                    label="Website:"
                                    value={
                                        <a
                                            target="_blank"
                                            href={formatUrl(listing.website)}
                                        >
                                            {formatUrl(listing.website)}
                                        </a>
                                    }
                                />
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="w-2/3">
                    <div className="flex flex-col  justify-start items-start rounded-xl border border-dark px-4 py-4 h-full">
                        <table className="table-fixed">
                            <tbody className="flex flex-col gap-8 p-4">
                                <ContractDetailRow
                                    label="Contract Address:"
                                    value={
                                        <ShortenerComponent
                                            value={listing.contractAddress}
                                        />
                                    }
                                />
                                <ContractDetailRow
                                    label="Chain Explorer:"
                                    value={
                                        <a
                                            target="_blank"
                                            href={`https://bscscan.com/address/${listing.contractAddress}`}
                                        >
                                            View on Explorer
                                        </a>
                                    }
                                />
                                <ContractDetailRow
                                    label="Project Email:"
                                    value={
                                        <a
                                            target="_blank"
                                            href={`mailto:${listing.email}`}
                                        >
                                            {listing.email}
                                        </a>
                                    }
                                />
                                <ContractDetailRow
                                    label="Project Category:"
                                    value={listing.category}
                                />
                                <ContractDetailRow
                                    label="Project Description:"
                                    value={listing.description}
                                />
                                <ContractDetailRow
                                    label="Project website:"
                                    value={
                                        <a
                                            target="_blank"
                                            href={formatUrl(listing.website)}
                                        >
                                            {listing.website}
                                        </a>
                                    }
                                />
                                <ContractDetailRow
                                    label="Creator's Address:"
                                    value={
                                        <ShortenerComponent
                                            value={listing.creatorAddress}
                                        />
                                    }
                                />
                                <tr className="text-left text-sm ">
                                    <td className="text-left align-top w-[170px]">
                                        Community Links:
                                    </td>
                                    <td className="text-left text-sm text-[#C1C4D6]">
                                        <ul className="flex flex-col gap-2">
                                            {listing.communityLinks &&
                                            listing.communityLinks.length > 0
                                                ? listing.communityLinks.map(
                                                      (link, index) => (
                                                          <li key={index}>
                                                              <a
                                                                  className="flex gap-2 items-center"
                                                                  target="_blank"
                                                                  // href={formatUrl(link.link)}
                                                              >
                                                                  {link.platform ===
                                                                      "twitter" && (
                                                                      <icons.twitter
                                                                          size={
                                                                              16
                                                                          }
                                                                      />
                                                                  )}
                                                                  {link.platform ===
                                                                      "telegram" && (
                                                                      <icons.telegram
                                                                          size={
                                                                              22
                                                                          }
                                                                      />
                                                                  )}
                                                                  <span>
                                                                      {
                                                                          link.link
                                                                      }
                                                                  </span>
                                                              </a>
                                                          </li>
                                                      ),
                                                  )
                                                : "--"}
                                        </ul>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
};

const ContractDetailRow = ({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) => (
    <tr className="text-left text-sm">
        <td className="text-left w-[170px]">{label}</td>
        <td className="text-left text-sm text-[#C1C4D6]">{value}</td>
    </tr>
);

export default Listing;
