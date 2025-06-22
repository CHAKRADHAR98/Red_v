// src/types/token.ts - Updated with Jupiter API structure

export interface Token {
  address: string; // Changed from 'mint' to match Jupiter API
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string; // Changed from logoUrl to match Jupiter API
  description?: string;
  website?: string;
  twitter?: string;
  
  // Jupiter-specific fields
  tags?: string[]; // New: verification tags from Jupiter
  daily_volume?: number; // New: daily trading volume
  created_at?: string; // New: token creation timestamp
  freeze_authority?: string | null; // New: freeze authority info
  mint_authority?: string | null; // New: mint authority info
  permanent_delegate?: string | null; // New: permanent delegate info
  minted_at?: string | null; // New: minting timestamp
  extensions?: {
    coingeckoId?: string;
  };
  
  // Calculated fields for backward compatibility
  mint?: string; // For backward compatibility
  supply?: number; // May need to be fetched separately
  logoUrl?: string; // For backward compatibility
  coingeckoId?: string; // For backward compatibility
}

export interface JupiterTokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  daily_volume?: number;
  created_at?: string;
  freeze_authority?: string | null;
  mint_authority?: string | null;
  permanent_delegate?: string | null;
  minted_at?: string | null;
  extensions?: {
    coingeckoId?: string;
  };
}

export interface JupiterPriceInfo {
  id: string;
  type: string;
  price: string;
  extraInfo?: {
    lastSwappedPrice?: {
      lastJupiterSellAt: number;
      lastJupiterSellPrice: string;
      lastJupiterBuyAt: number;
      lastJupiterBuyPrice: string;
    };
    quotedPrice?: {
      buyPrice: string;
      buyAt: number;
      sellPrice: string;
      sellAt: number;
    };
    confidenceLevel?: 'high' | 'medium' | 'low';
    depth?: {
      buyPriceImpactRatio?: {
        depth: {
          "10": number;
          "100": number;
          "1000": number;
        };
        timestamp: number;
      };
      sellPriceImpactRatio?: {
        depth: {
          "10": number;
          "100": number;
          "1000": number;
        };
        timestamp: number;
      };
    };
  };
}

export interface TokenMetrics {
  // Price data from Jupiter
  price?: number;
  buyPrice?: number;
  sellPrice?: number;
  priceChange24h?: number;
  volume24h?: number;
  confidence?: 'high' | 'medium' | 'low';
  lastUpdated?: Date;
  
  // Market data
  marketCap?: number;
  holders?: number;
  transactions24h?: number;
  createdAt?: Date;
  tvl?: number;
  dailyActiveUsers?: number;
  
  // Jupiter-specific metrics
  dailyVolume?: number;
  priceImpact?: {
    buy: { small: number; medium: number; large: number };
    sell: { small: number; medium: number; large: number };
  };
}

export interface TokenHolder {
  address: string;
  amount: number;
  uiAmount: number;
  percentage: number;
  ownerType?: string;
  name?: string;
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
  address: string; // Changed from 'mint'
  name: string;
  symbol: string;
  logoURI?: string; // Changed from logoUrl
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
  marketCap?: number;
  tags?: string[];
  daily_volume?: number;
  
  // For backward compatibility
  mint?: string;
  logoUrl?: string;
}

// Token filtering and categorization types
export interface TokenFilters {
  tags?: string[];
  minVolume?: number;
  maxVolume?: number;
  verified?: boolean;
  search?: string;
}

export enum TokenTag {
  VERIFIED = 'verified',
  STRICT = 'strict',
  COMMUNITY = 'community',
  LST = 'lst',
  TOKEN_2022 = 'token-2022',
  BIRDEYE_TRENDING = 'birdeye-trending'
}

export interface TokenCategory {
  id: string;
  name: string;
  description: string;
  tags: string[];
  color: string;
}

export const TOKEN_CATEGORIES: TokenCategory[] = [
  {
    id: 'verified',
    name: 'Verified Tokens',
    description: 'Community-verified tokens with high trust',
    tags: ['verified', 'strict'],
    color: 'green'
  },
  {
    id: 'token-2022',
    name: 'Token-2022',
    description: 'Next generation token standard',
    tags: ['token-2022'],
    color: 'purple'
  }
];