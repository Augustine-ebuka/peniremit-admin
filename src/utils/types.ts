export interface Tab {
    id: string;
    label: string;
    count?: number;
}

export interface User {
    id: number;
    username: string;
    email: string;
    emailVerifiedAt?: string;
    passwordResetTokenExpiry?: string;
    createdAt?: string;
    updatedAt?: string;
    role: "admin" | "moderator" | "superadmin"; // Adjust based on possible
    status: "approved" | "pending" | "rejected";
    deletedAt?: boolean;
    avatarUrl?: string | null;
}

interface AnlyticsTotals {
    value: string | number;
    percentage: number;
}

export interface DashboardAnalytics {
    totalAssets: AnlyticsTotals;
    totalDevices: AnlyticsTotals;
    totalTransactions: AnlyticsTotals;
    totalWallets: AnlyticsTotals;
}

export interface Pagination {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
    firstPageUrl: string;
    lastPageUrl: string;
    nextPageUrl: string | null;
    previousPageUrl: string | null;
}

export interface CommunityLink {
    link: string;
    platform: string;
}

export interface TokenMetadata {
    id: string;
    createdAt: string;
    updatedAt: string;
    projectEmail: string | null;
    website: string;
    category: string;
    description: string | null;
    creatorAddress: string | null;
    communityLinks: CommunityLink[];
    listed: boolean;
    tokenId: string;
    removeFromFeesCalculation?: boolean;
}

export interface TokenMarketData {
    id: string;
    createdAt: string;
    updatedAt: string;
    price: string;
    volume: string;
    circulatingSupply: string;
    totalSupply: string;
    tokenId: string;
    liquidity: string;
}

export interface TokenPriceData {
    id: number;
    address: number;
    price: number;
    priceChange1H: number;
    priceChange6H: number;
    priceChange24H: number;
}

export interface Token {
    createdAt: string;
    updatedAt: string;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoUrl: string;
    isDefault: boolean;
    isNative: boolean;
    chainId: number;
    metadata: TokenMetadata;
    marketdata: TokenMarketData;
    totalFeeUsd: string;
    prices: TokenPriceData | null;
}

export interface TokenResponse {
    token: Token;
    message: string;
    status: string;
}

export interface Listing {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
    contractAddress: string;
    chainId: number;
    email: string;
    website: string;
    category: string;
    description: string;
    creatorAddress: string;
    communityLinks: CommunityLink[];
    createdAt: string;
    updatedAt: string;
    logoUrl: string;
    tokenId: string | null;
    rejectionReason: string | null;
    totalSupply: string;
    status: string;
}

export type FetchedListing = Listing & {
    tokenInformation: Token;
};

export interface Activity {
    id: number;
    action: ActivityType;
    userId: number;
    tokenId: string | null;
    listingId: string;
    message: string;
    createdAt: string;
    updatedAt: string;
    adminId: number | null;
    notificationId: string | null;
    user: User;
    token: Token | null;
    admin: User | null;
    listing: Listing | null;
    deleteName: string;
}

export type ActivityType =
    | "approve-listing"
    | "approved-listing"
    | "reject-listing"
    | "list-token"
    | "delist-token"
    | "delete-token"
    | "withdraw-fees"
    | "approve-user"
    | "change-user-role"
    | "delete-user"
    | "sent-notification"
    | "edit-token"
    | "create-token";

export interface AssetAnalytics {
    totalTokens: string;
    totalFees: string;
}

export interface TransactionAnalytics {
    totaltransactions: string;
    totaltransfers: string;
    totalsprays: string;
    totalswaps: string;
    totalFeeUsd: string;
}

export interface RelayAnalytics {
    totalTransactions: string;
    totalRelays: string;
}

export interface TransactionMetadata {
    r: string;
    s: string;
    v: string;
    gas: string;
    hash: string;
    type: string;
    input: string;
    nonce: string;
    value: string;
    gasPrice: string;
    toAddress: string;
    fromAddress: string;
    receiptRoot: null | string;
    triggered_by: string[];
    receiptStatus: string;
    receiptGasUsed: string;
    transactionIndex: string;
    receiptContractAddress: null | string;
    receiptCumulativeGasUsed: string;
}

export interface Transaction {
    swapTokenInformation: Token | null;
    hash: string;
    createdAt: string;
    updatedAt: string;
    token: string;
    fromAddress: string;
    toAddress: string;
    amount: string;
    date: string;
    status: string;
    transactionType: string;
    gas: string;
    fee: string;
    chainId: number;
    metaData: TransactionMetadata;
    relayId: null | string;
    erc20Amount: null | string;
    tokenInformation: Token;
}

export interface Wallet {
    address: string;
    total_fee_usd: string;
    transaction_count: string;
    created_at: string;
}

export interface Relay {
    id: string;
    createdAt: string;
    updatedAt: string;
    privateKey: string;
    name: string;
    balance: string;
    balanceUSD: string;
    totalTransactions: string;
}

export interface Notification {
    id: number;
    subject: string;
    body: string;
    sentBy: number;
    scheduledFor: string;
    createdAt: string;
    updatedAt: string;
    status: "sent" | "pending" | "failed"; // Adjust based on possible statuses
    sender: User;
}

export type Duration =
    | "today"
    | "yesterday"
    | "last_7_days"
    | "last_30_days"
    | "last_6_months"
    | "this_month"
    | "this_year"
    | "all_time";
