import { CircleArrowDown, CircleArrowUp } from "lucide-react";
import React from "react";
import { FormatNumber } from "./format-number.component";

interface StatComponentProps {
    percentage?: number;
    title: string;
    icon: React.FC<any>;
    value: string | number;
    duration?: string;
    currency?: string;
    onClick?: () => void;
}

const StatComponent: React.FC<StatComponentProps> = (props) => {
    return (
        <div
            className="flex flex-col border border-dark p-6 shadow-default rounded-lg text-white cursor-pointer hover:bg-dark/30"
            onClick={props.onClick}
        >
            <div className="flex">
                <props.icon size={24} />
            </div>
            <span className="mt-3  font-normal">{props.title}</span>
            <div className="text-2xl mt-4 text-[#EDEFF5] ">
                <h4 className="font-medium ">
                    {props.currency}
                    {Number.isNaN(Number(props.value)) ? (
                        props.value
                    ) : (
                        <FormatNumber value={Number(props.value)} />
                    )}
                </h4>
            </div>

            {props.percentage ? (
                props.percentage >= 0 ? (
                    <div className="text-sm text-neutral-600  flex items-center">
                        Increased by
                        <span className="inline-flex items-center text-green-400 pl-1 text-green">
                            <span className="inline-block pr-0.5">
                                <CircleArrowUp size={14} />
                            </span>
                            <FormatNumber value={props.percentage} /> %
                        </span>
                    </div>
                ) : (
                    <div className="text-sm text-neutral-600 flex items-center">
                        Decreased by
                        <span className="inline-flex items-center text-red pl-1">
                            <span className="inline-block pr-0.5">
                                <CircleArrowDown size={14} />
                            </span>
                            {/* {props.percentage}%
                             */}
                            <FormatNumber value={props.percentage} /> %
                        </span>
                    </div>
                )
            ) : (
                <span className="text-neutral">--</span>
            )}
        </div>
    );
};

export default StatComponent;
