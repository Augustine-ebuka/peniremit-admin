import { useCallback, useEffect, useState } from "react";
import DropdownComponent from "./dropdown.component";
import { Duration } from "@/utils/types";
import {
    endOfDay,
    endOfMonth,
    startOfDay,
    startOfMonth,
    sub,
    subDays,
} from "date-fns";

const durationList = [
    "today",
    "yesterday",
    "last_7_days",
    "last_30_days",
    "last_6_months",
    "this_month",
    "this_year",
    "all_time",
] as Duration[];

export const DurationSelectorComponent = ({
    onUpdated,
    defaultDuration = "today",
}: {
    onUpdated: (d: { start: Date; end: Date; duration: Duration }) => void;
    defaultDuration?: Duration;
}) => {
    const [duration, setDuration] = useState<Duration>(defaultDuration);

    useEffect(() => {
        onUpdated(calculateDuration(duration));
    }, []);

    const calculateDuration = useCallback((d: Duration) => {
        const now = new Date();
        const startOfToday = startOfDay(now);
        const endOfToday = endOfDay(now);

        switch (d) {
            case "today":
                return {
                    start: startOfToday,
                    end: endOfToday,
                    duration: d,
                };
            case "yesterday":
                return {
                    start: subDays(startOfToday, 1),
                    end: subDays(endOfToday, 1),
                    duration: d,
                };
            case "last_7_days":
                return {
                    start: subDays(startOfToday, 7),
                    end: endOfToday,
                    duration: d,
                };
            case "last_30_days":
                console.log(subDays(startOfToday, 30), "fish");
                return {
                    start: subDays(startOfToday, 30),
                    end: endOfToday,
                    duration: d,
                };
            case "last_6_months":
                return {
                    start: subDays(startOfToday, 180),
                    end: endOfToday,
                    duration: d,
                };
            case "this_month":
                return {
                    start: startOfMonth(now),
                    end: endOfMonth(now),
                    duration: d,
                };
            case "this_year":
                return {
                    start: new Date(now.getFullYear(), 0, 1),
                    end: endOfToday,
                    duration: d,
                };
            case "all_time":
                return {
                    start: new Date(2021, 0, 1),
                    end: endOfToday,
                    duration: d,
                };
        }
    }, []);

    return (
        <DropdownComponent
            options={durationList}
            renderIcon={() => <></>}
            renderOption={(option) => (
                <span className="capitalize">
                    {option.split("_").join(" ")}
                </span>
            )}
            className="py-3.5"
            selectedValue={duration}
            setSelectedValue={(data) => {
                setDuration(data);
                onUpdated(calculateDuration(data));
            }}
            placeHolder="Filter"
        />
    );
};
