export interface Token {
  mint: string; // Token mint address
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  logoUrl?: string;
  description?: string;
  website?: string;
  twitter?: string;
  coingeckoId?: string;
}

export interface TokenMetrics {
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
  marketCap?: number;
  holders?: number;
  transactions24h?: number;
  createdAt?: Date;
  tvl?: number; // Total Value Locked
  dailyActiveUsers?: number;
}

export interface TokenHolder {
  address: string;
  amount: number;
  uiAmount: number;
  percentage: number;
  ownerType?: string; // e.g., "Exchange", "Protocol", "User"
  name?: string; // if address is known/labeled
}

export interface TokenTransfer {
  signature: string;
  blockTime: number;
  timestamp: Date;
  fromAddress: string;
  toAddress: string;
  amount: number;
  uiAmount: number;
  fromName?: string;
  toName?: string;
}

export interface TokenListItem {
  mint: string;
  name: string;
  symbol: string;
  logoUrl?: string;
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
  marketCap?: number;
}