import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/utils/app";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
export const useFetchToken = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token, user } = useSelector((state: RootState) => state.auth);

    const fetchTokenByAddress = async (tokenAddress: string) => {
        setLoading(true);
        setError(null);
        try {
            // Adjust endpoint path to match your API
            // Example: /api/tokens/:address or /tokens/info/:address
            const response = await axios.get(
                `${BASE_URL}/tokens/${tokenAddress}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // API shape: { data: { ...token fields... }, message, status_code }
            const payload = response.data?.data ?? response.data;

            // Normalize API fields to the shape expected by components
            const normalized = {
                // basic fields
                address: payload.address || payload.token_id || payload.token || tokenAddress,
                name: payload.name || payload.token_name || "",
                symbol: payload.symbol || payload.ticker || "",
                logoUrl: payload.metadata?.logo_url || payload.metadata?.logoUrl || "",
                // marketdata: try to map snake_case to camelCase used across the app
                marketdata: {
                    price: payload.market_data?.price ?? payload.marketdata?.price ?? undefined,
                    volume: payload.market_data?.volume ?? payload.marketdata?.volume ?? "0",
                    circulatingSupply:
                        payload.market_data?.circulating_supply ?? payload.marketdata?.circulatingSupply ?? "0",
                    circulating_supply: payload.market_data?.circulating_supply ?? undefined,
                },
                // metadata: map community links and website
                metadata: {
                    ...payload.metadata,
                    website: payload.metadata?.website ?? payload.metadata?.website_url ?? "",
                    communityLinks: payload.metadata?.community_links ?? payload.metadata?.communityLinks ?? [],
                },
                // keep raw payload for reference
                raw: payload,
            } as any;

            return normalized;
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.errors?.[0]?.message ||
                "Failed to fetch token";
            setError(msg);
            console.error("Token fetch error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { fetchTokenByAddress, loading, error };
};
