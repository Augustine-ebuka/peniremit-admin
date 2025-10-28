import React, { FC } from "react";

interface Tab {
    id: string;
    label: string;
    count?: number;
}

interface TabViewProps {
    tabs: Tab[];
    selectedTab: string;
    onTabSelect: (tabId: string) => void;
    loading?: boolean;
}

const TabView: FC<TabViewProps> = ({
    tabs,
    selectedTab,
    onTabSelect,
    loading = false,
}) => {
    return (
        <div className="overflow-x-auto pb-5 mt-4 flex">
            <div className="flex *:shrink-0 overflow-visible text-gray-500 gap-10 border-b border-dark w-full">
                {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => onTabSelect(tab.id)}>
                        <span
                            className={`px-1 py-4 items-center flex gap-2 text-neutral border-b-2 ${
                                selectedTab === tab.id
                                    ? "border-b-neutral"
                                    : "border-transparent"
                            }`}
                        >
                            {tab.label}{" "}
                            {typeof tab.count !== "undefined" && (
                                <span className="px-4 py-1 bg-dark rounded-full text-xs">
                                    {tab.count}
                                </span>
                            )}
                        </span>
                    </button>
                ))}
            </div>
            {loading && (
                <div className="flex items-center justify-center w-10 shrink-0  border-b border-dark opacity-50">
                    <div className="animate-spin h-6 w-6 mr-2 border-4 border-x-white border-y-white/50 rounded-full"></div>
                </div>
            )}
        </div>
    );
};

export default TabView;
