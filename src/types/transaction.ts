export interface Transaction {
  signature: string;
  timestamp: Date;
  blockTime: number;
  slot: number;
  fee: number;
  status: TransactionStatus;
  type?: TransactionType;
  accounts: string[];
  tokenTransfers?: TokenTransfer[];
  programIds?: string[];
  protocol?: string;       // Added: Name of the primary protocol
  protocolCategory?: string; // Added: Category of the primary protocol
}

export enum TransactionStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum TransactionType {
  UNKNOWN = 'unknown',
  TOKEN_TRANSFER = 'token_transfer',
  SOL_TRANSFER = 'sol_transfer',
  SWAP = 'swap',
  MINT = 'mint',
  BURN = 'burn',
  NFT_SALE = 'nft_sale',
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  LIQUIDITY_ADD = 'liquidity_add',
  LIQUIDITY_REMOVE = 'liquidity_remove',
  BORROW = 'borrow',    // Added: New transaction type
  REPAY = 'repay',      // Added: New transaction type
  YIELD = 'yield',      // Added: New transaction type
  GOVERNANCE = 'governance', // Added: New transaction type
}

export interface TokenTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
  mint: string;
  tokenStandard?: string;
  symbol?: string;
}