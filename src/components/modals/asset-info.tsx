import React, { ReactNode } from "react";
import ModalComponent from "../modal.component";
import ImageComponent from "../image.component";
import { Token } from "@/utils/types";
import { formatUrl } from "@/utils/app";
import icons from "../icon.components";
import FloatComponent from "../float.component";
import ShortenerComponent from "../shortener.component";
import { useModalContext } from "@/_contexts/modal.context";
import { PencilIcon } from "lucide-react";
import { FormatNumber } from "../format-number.component";

interface AssetInfoProps {
    token: Token | null;
    refresh?: () => void;
}

export const AssetInfoModalContainer = () => {
    const [args, setArgs] = React.useState<AssetInfoProps>({
        token: null,
    });

    console.log("tokeeeeen",args.token)
    return {
        Component: () => (
            <AssetInfo token={args.token} refresh={args.refresh} />
        ),
        toggle: (t: { token: Token; refresh?: () => void }) => {
            setArgs(t);
        },
    };
};

const AssetInfo: React.FC<AssetInfoProps> = ({ token, refresh }) => {
    const { assetInfo, assetEdit } = useModalContext();
    return (
        <ModalComponent
            isOpen={assetInfo.isActive}
            onClose={assetInfo.close}
            noHeader
            supplementaryActions={[
                {
                    label: "Edit",
                    onClick: () => assetEdit.open({ token: token!, refresh }),
                    icon: <PencilIcon />,
                },
            ]}
        >
            <div className="flex flex-col justify-start items-start px-6 py-6 overflow-scroll">
                <div className="flex flex-row items-start justify-between  w-full">
                    <div className="flex flex-col gap-4">
                        <ImageComponent
                            src={token?.logoUrl || ""}
                            alt={token?.symbol || "Unknown"}
                            className="rounded-full h-20 w-20"
                        />
                        <div className="text-left ">
                            <div className="block text-lg font-medium text-[#F4F6FA]">
                                {token?.name} ({token?.symbol})
                            </div>
                            <div className="block text-xs mt-1 font-light text-[#C1C4D6]">
                                $
                                <FloatComponent
                                    value={
                                        Number(token?.marketdata?.price) || 0
                                    }
                                />
                            </div>
                            <div className="text-xs">
                                <ShortenerComponent
                                    value={token?.address || ""}
                                    shorten={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border border-dashed border-dark w-full my-4" />
                <table className="table-fixed">
                    <tbody className="flex flex-col gap-8">
                        <ContractDetailRow
                            label="Market Cap:"
                            value={
                                <FormatNumber
                                    value={
                                        Number(
                                            token?.marketdata?.price || "0",
                                        ) *
                                        Number(
                                            token?.marketdata
                                                ?.circulatingSupply || "0",
                                        )
                                    }
                                />
                            }
                        />
                        <ContractDetailRow
                            label="Volume(24h):"
                            value={
                                <FormatNumber
                                    value={Number(
                                        token?.marketdata?.volume || "0",
                                    )}
                                />
                            }
                        />
                        <ContractDetailRow
                            label="Supply:"
                            value={
                                <FormatNumber
                                    value={Number(
                                        token?.marketdata?.circulatingSupply ||
                                            "0",
                                    )}
                                />
                            }
                        />
                        <ContractDetailRow
                            label="Website:"
                            value={
                                <a
                                    target="_blank"
                                    href={formatUrl(
                                        token?.metadata.website || "#",
                                    )}
                                >
                                    {token?.metadata.website || "--"}
                                </a>
                            }
                        />
                        <tr className="text-left text-sm ">
                            <td className="text-left align-top w-[170px]">
                                Community Links:
                            </td>
                            <td className="text-left text-sm text-[#C1C4D6]">
                                <ul className="flex flex-col gap-2">
                                    {token?.metadata.communityLinks &&
                                    token?.metadata.communityLinks.length > 0
                                        ? token?.metadata.communityLinks.map(
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
                                                                  size={16}
                                                              />
                                                          )}
                                                          {link.platform ===
                                                              "telegram" && (
                                                              <icons.telegram
                                                                  size={22}
                                                              />
                                                          )}
                                                          <span>
                                                              {link.link}
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
        </ModalComponent>
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

export default AssetInfo;
