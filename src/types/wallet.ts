export interface Wallet {
  address: string;
  balance: number;
  tokenBalances?: TokenBalance[];
  transactionCount?: number;
  label?: string;
  type?: WalletType;
  firstActivityAt?: Date;
  lastActivityAt?: Date;
  // New fields for protocol intelligence
  protocolId?: string;
  protocolName?: string;
  protocolCategory?: string;
  protocolInteractions?: ProtocolInteractionSummary[];
}

export interface TokenBalance {
  mint: string;
  symbol?: string;
  amount: number;
  decimals: number;
  uiAmount?: number;
}

export enum WalletType {
  UNKNOWN = 'unknown',
  EXCHANGE = 'exchange',
  PROTOCOL = 'protocol',
  USER = 'user',
  CONTRACT = 'contract',
  // New types for more specific classification
  DEX = 'dex',
  LENDING = 'lending',
  NFT_MARKETPLACE = 'nft_marketplace',
  STAKING = 'staking',
  YIELD = 'yield',
  BRIDGE = 'bridge',
  GOVERNANCE = 'governance',
}

export interface WalletConnection {
  source: string;
  target: string;
  value: number;
  transactions: number;
  lastInteraction: Date;
  // New fields for protocol intelligence
  protocolId?: string;
  protocolName?: string;
  category?: string;
}

// New interface for summarizing protocol interactions
export interface ProtocolInteractionSummary {
  protocolId: string;
  protocolName: string;
  category: string;
  interactionCount: number;
  lastInteraction: Date;
}