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
  // New fields for protocol intelligence
  protocols?: ProtocolInteraction[];
  description?: string;
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
  LENDING_DEPOSIT = 'lending_deposit',
  LENDING_WITHDRAW = 'lending_withdraw',
  LENDING_BORROW = 'lending_borrow',
  LENDING_REPAY = 'lending_repay',
  GOVERNANCE_VOTE = 'governance_vote',
  BRIDGE_TRANSFER = 'bridge_transfer',
}

export interface TokenTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
  mint: string;
  tokenStandard?: string;
  symbol?: string;
}

// New interface for protocol interactions
export interface ProtocolInteraction {
  protocolId: string;
  protocolName: string;
  programId: string;
  category: string;
  action?: string;
  description?: string;
}