export interface Wallet {
  address: string;
  balance: number;
  tokenBalances?: TokenBalance[];
  transactionCount?: number;
  label?: string;
  type?: WalletType;
  firstActivityAt?: Date;
  lastActivityAt?: Date;
  name?: string; // Added: Name resolution from Solana Name Service
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
  NFT_COLLECTOR = 'nft_collector', // Added: For wallets with many NFT transactions
}

export interface WalletConnection {
  source: string;
  target: string;
  value: number;
  transactions: number;
  lastInteraction: Date;
}