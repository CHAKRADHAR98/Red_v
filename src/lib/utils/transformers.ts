// src/lib/utils/transformers.ts.new
import { Transaction, TransactionStatus, TransactionType, TokenTransfer } from '../../types/transaction';
import { Wallet, WalletConnection } from '../../types/wallet';
import { determinePrimaryProtocol, getProtocolInfo } from '../data/program-id-mappings';

/**
 * Transform raw Helius transaction data into our application's Transaction type
 */
export function transformHeliusTransaction(rawTransaction: any): Transaction | null {
  if (!rawTransaction) return null;
  
  try {
    // Handle minimal transaction data from signature results
    if (rawTransaction.signature && rawTransaction.blockTime && !rawTransaction.transaction) {
      return {
        signature: rawTransaction.signature,
        timestamp: new Date((rawTransaction.blockTime || 0) * 1000),
        blockTime: rawTransaction.blockTime || 0,
        slot: rawTransaction.slot || 0,
        fee: rawTransaction.fee || 0,
        status: rawTransaction.err ? TransactionStatus.FAILED : TransactionStatus.SUCCESS,
        accounts: [],
        programIds: [],
        type: TransactionType.UNKNOWN,
      };
    }
    
    // Extract program IDs from the transaction
    const programIds = extractProgramIds(rawTransaction);
    
    // Get the primary protocol information
    const protocolInfo = determinePrimaryProtocol(programIds);
    
    // Handle full transaction data
    const transaction: Transaction = {
      signature: rawTransaction.transaction?.signatures?.[0] || rawTransaction.signature || '',
      timestamp: new Date((rawTransaction.blockTime || 0) * 1000),
      blockTime: rawTransaction.blockTime || 0,
      slot: rawTransaction.slot || 0,
      fee: rawTransaction.meta?.fee || rawTransaction.fee || 0,
      status: (rawTransaction.meta?.err || rawTransaction.err) ? TransactionStatus.FAILED : TransactionStatus.SUCCESS,
      accounts: rawTransaction.transaction?.message?.accountKeys?.map((key: any) => 
        typeof key === 'string' ? key : key.pubkey
      ) || [],
      programIds,
      protocol: protocolInfo ? protocolInfo.name : undefined,
      protocolCategory: protocolInfo ? protocolInfo.category : undefined,
    };
    
    // Extract token transfers if available
    if (rawTransaction.meta?.preTokenBalances && rawTransaction.meta?.postTokenBalances) {
      // This is a simplified extraction - you'll want to enhance this for production
      const preBalances = rawTransaction.meta.preTokenBalances;
      const postBalances = rawTransaction.meta.postTokenBalances;
      
      // Group by mint address to identify transfers
      const mintAccountMap = new Map();
      
      // Track pre-balances
      preBalances.forEach((balance: any) => {
        const key = `${balance.mint}-${balance.owner}`;
        mintAccountMap.set(key, {
          mint: balance.mint,
          owner: balance.owner,
          preBal: Number(balance.uiTokenAmount.amount) / Math.pow(10, balance.uiTokenAmount.decimals),
          postBal: 0, // Will be updated if it exists in postBalances
          tokenStandard: null,
          symbol: null
        });
      });
      
      // Update with post-balances and calculate differences
      postBalances.forEach((balance: any) => {
        const key = `${balance.mint}-${balance.owner}`;
        const existing = mintAccountMap.get(key);
        
        if (existing) {
          existing.postBal = Number(balance.uiTokenAmount.amount) / Math.pow(10, balance.uiTokenAmount.decimals);
        } else {
          mintAccountMap.set(key, {
            mint: balance.mint,
            owner: balance.owner,
            preBal: 0,
            postBal: Number(balance.uiTokenAmount.amount) / Math.pow(10, balance.uiTokenAmount.decimals),
            tokenStandard: null,
            symbol: null
          });
        }
      });
      
      // Extract transfers based on balance changes
      const tokenTransfers: TokenTransfer[] = [];
      
      // This is simplified - actual transfer extraction would be more complex
      // We'd need to match senders and receivers based on instructionData
      
      transaction.tokenTransfers = tokenTransfers;
      if (tokenTransfers.length > 0) {
        transaction.type = TransactionType.TOKEN_TRANSFER;
      }
    }
    
    // Determine transaction type based on available data
    if (!transaction.type) {
      transaction.type = determineTransactionType(rawTransaction, protocolInfo?.category);
    }
    
    return transaction;
  } catch (error) {
    console.error('Error transforming transaction:', error);
    return null;
  }
}

/**
 * Extract program IDs from a raw transaction
 */
function extractProgramIds(rawTransaction: any): string[] {
  const programIds = new Set<string>();
  
  // Extract from message instruction program IDs (standard Solana RPC format)
  if (rawTransaction.transaction?.message?.instructions) {
    rawTransaction.transaction.message.instructions.forEach((instruction: any) => {
      if (instruction.programId) {
        programIds.add(instruction.programId);
      } else if (instruction.programIdIndex !== undefined) {
        // Handle program ID by index
        const accountKeys = rawTransaction.transaction.message.accountKeys;
        const programIdIndex = instruction.programIdIndex;
        
        if (accountKeys && programIdIndex < accountKeys.length) {
          const programId = typeof accountKeys[programIdIndex] === 'string' 
            ? accountKeys[programIdIndex] 
            : accountKeys[programIdIndex]?.pubkey;
            
          if (programId) {
            programIds.add(programId);
          }
        }
      }
    });
  }
  
  // Extract from inner instructions if available (standard Solana RPC format)
  if (rawTransaction.meta?.innerInstructions) {
    rawTransaction.meta.innerInstructions.forEach((innerInst: any) => {
      innerInst.instructions?.forEach((instruction: any) => {
        if (instruction.programId) {
          programIds.add(instruction.programId);
        } else if (instruction.programIdIndex !== undefined) {
          // Handle program ID by index
          const accountKeys = rawTransaction.transaction?.message?.accountKeys;
          const programIdIndex = instruction.programIdIndex;
          
          if (accountKeys && programIdIndex < accountKeys.length) {
            const programId = typeof accountKeys[programIdIndex] === 'string' 
              ? accountKeys[programIdIndex] 
              : accountKeys[programIdIndex]?.pubkey;
              
            if (programId) {
              programIds.add(programId);
            }
          }
        }
      });
    });
  }
  
  // Also handle Helius-specific format if present
  if (rawTransaction.instructions) {
    rawTransaction.instructions.forEach((instruction: any) => {
      if (instruction.programId) {
        programIds.add(instruction.programId);
      }
    });
  }
  
  if (rawTransaction.innerInstructions) {
    rawTransaction.innerInstructions.forEach((innerInst: any) => {
      innerInst.instructions?.forEach((instruction: any) => {
        if (instruction.programId) {
          programIds.add(instruction.programId);
        }
      });
    });
  }
  
  return Array.from(programIds);
}

/**
 * Determine the type of transaction based on its contents
 */
function determineTransactionType(rawTransaction: any, protocolCategory?: string): TransactionType {
  // If we have a protocol category, use that to determine the type
  if (protocolCategory) {
    switch (protocolCategory) {
      case 'DEX':
        return TransactionType.SWAP;
      case 'Lending':
        return TransactionType.BORROW;
      case 'Staking':
        return TransactionType.STAKE;
      case 'NFT':
        return TransactionType.NFT_SALE;
      case 'Stableswap':
        return TransactionType.SWAP;
    }
  }

  // Check for token transfers by examining pre/post token balances
  if (rawTransaction.meta?.preTokenBalances?.length > 0 || 
      rawTransaction.meta?.postTokenBalances?.length > 0) {
    return TransactionType.TOKEN_TRANSFER;
  }
  
  // Check for SOL transfers by examining pre/post balances
  if (rawTransaction.meta?.preBalances && rawTransaction.meta?.postBalances) {
    const preBalances = rawTransaction.meta.preBalances;
    const postBalances = rawTransaction.meta.postBalances;
    
    // If balances changed and it's not a token transfer, it might be a SOL transfer
    if (preBalances.some((pre: number, i: number) => pre !== postBalances[i])) {
      return TransactionType.SOL_TRANSFER;
    }
  }
  
  // Check for Helius-specific tokenTransfers field (if it exists)
  if (rawTransaction.tokenTransfers?.length > 0) {
    return TransactionType.TOKEN_TRANSFER;
  }
  
  // Check for Helius-specific nativeTransfers field (if it exists)
  if (rawTransaction.nativeTransfers?.length > 0) {
    return TransactionType.SOL_TRANSFER;
  }
  
  // Check for known program IDs
  const programIds = extractProgramIds(rawTransaction);
  
  // Example checks for specific programs
  if (programIds.includes('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin')) { // Serum v3
    return TransactionType.SWAP;
  }
  
  if (programIds.includes('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')) { // Metaplex
    return TransactionType.NFT_SALE;
  }
  
  // Check Jupiter DEX aggregator program ID for swaps
  if (programIds.includes('JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB')) {
    return TransactionType.SWAP;
  }
  
  // Check for Marinade staking program
  if (programIds.includes('MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD')) {
    return TransactionType.STAKE;
  }
  
  return TransactionType.UNKNOWN;
}

/**
 * Transform raw wallet data into our application's Wallet type
 */
export function transformWalletData(address: string, accountInfo: any, transactions: Transaction[] = []): Wallet {
  const lamports = accountInfo?.lamports || accountInfo?.data?.parsed?.info?.lamports || 0;
  
  let tokenBalances: any[] = [];
  
  // Try to extract token balances from transactions
  if (transactions.length > 0) {
    // This is a simplified approach - in a real app, you'd want to track the latest
    // state of each token by looking at the most recent transactions
    const tokenMap = new Map<string, any>();
    
    // Look through transactions to find token balances
    transactions.forEach(tx => {
      if (tx.tokenTransfers) {
        tx.tokenTransfers.forEach(transfer => {
          // If this wallet is the recipient, record the token balance
          if (transfer.toUserAccount === address) {
            tokenMap.set(transfer.mint, {
              mint: transfer.mint,
              symbol: transfer.symbol || undefined,
              amount: transfer.amount,
              decimals: 0, // This would need to be extracted from the token metadata
              uiAmount: transfer.amount, // This is simplified
            });
          }
        });
      }
    });
    
    tokenBalances = Array.from(tokenMap.values());
  }
  
  // Determine wallet type based on transaction patterns
  let walletType = determineWalletType(address, transactions);
  
  const wallet: Wallet = {
    address,
    balance: lamports,
    tokenBalances: tokenBalances.length > 0 ? tokenBalances : undefined,
    transactionCount: transactions.length,
    firstActivityAt: transactions.length > 0 ? 
      transactions.reduce((earliest, tx) => 
        tx.timestamp < earliest ? tx.timestamp : earliest, 
        transactions[0].timestamp) : 
      undefined,
    lastActivityAt: transactions.length > 0 ? 
      transactions.reduce((latest, tx) => 
        tx.timestamp > latest ? tx.timestamp : latest, 
        transactions[0].timestamp) : 
      undefined,
    type: walletType as any,  // Add type assertion
  };
  
  return wallet;
}

/**
 * Determine the type of a wallet based on its transaction patterns
 */
function determineWalletType(address: string, transactions: Transaction[]): string {
  if (transactions.length === 0) return 'unknown';
  
  // Count transaction types
  const typeCounts: Record<string, number> = {};
  transactions.forEach(tx => {
    const type = tx.type || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  
  // Check if this is a high-volume trading wallet
  const swapCount = typeCounts[TransactionType.SWAP] || 0;
  if (swapCount > 5) return 'exchange';
  
  // Check if this is a protocol wallet (many transactions from the same program)
  const protocolCounts: Record<string, number> = {};
  transactions.forEach(tx => {
    if (tx.protocol) {
      protocolCounts[tx.protocol] = (protocolCounts[tx.protocol] || 0) + 1;
    }
  });
  
  // If more than 50% of transactions are from the same protocol, it might be a protocol wallet
  const totalTxs = transactions.length;
  for (const [protocol, count] of Object.entries(protocolCounts)) {
    if (count / totalTxs > 0.5) return 'protocol';
  }
  
  // If there are NFT transactions, it might be an NFT collector
  const nftCount = typeCounts[TransactionType.NFT_SALE] || 0;
  if (nftCount > 0) return 'nft_collector';
  
  // Default to user
  return 'user';
}

/**
 * Generate wallet connections based on transaction data
 */
export function generateWalletConnections(transactions: Transaction[]): WalletConnection[] {
  const connectionMap = new Map<string, WalletConnection>();
  
  // First check if we have tokenTransfers data
  const hasTokenTransfers = transactions.some(tx => tx.tokenTransfers && tx.tokenTransfers.length > 0);
  
  if (hasTokenTransfers) {
    // Process based on token transfers if available
    transactions.forEach(transaction => {
      if (!transaction.tokenTransfers) return;
      
      transaction.tokenTransfers.forEach(transfer => {
        const source = transfer.fromUserAccount;
        const target = transfer.toUserAccount;
        
        if (!source || !target || source === target) return;
        
        const key = `${source}-${target}`;
        const existingConnection = connectionMap.get(key);
        
        if (existingConnection) {
          existingConnection.value += transfer.amount;
          existingConnection.transactions += 1;
          if (transaction.timestamp > existingConnection.lastInteraction) {
            existingConnection.lastInteraction = transaction.timestamp;
          }
        } else {
          connectionMap.set(key, {
            source,
            target,
            value: transfer.amount,
            transactions: 1,
            lastInteraction: transaction.timestamp,
          });
        }
      });
    });
  } else {
    // For simplified transaction data, extract accounts involved
    transactions.forEach(transaction => {
      if (!transaction.accounts || transaction.accounts.length < 2) return;
      
      // Get unique accounts from the transaction
      const accounts = [...new Set(transaction.accounts)];
      
      // Create connections between accounts
      // This is simplified - in reality, you'd want to analyze the instructions to determine
      // the actual flow of funds between accounts
      for (let i = 0; i < accounts.length; i++) {
        for (let j = i + 1; j < accounts.length; j++) {
          const source = accounts[i];
          const target = accounts[j];
          
          if (source === target) continue;
          
          const key = `${source}-${target}`;
          const reverseKey = `${target}-${source}`;
          
          if (connectionMap.has(key)) {
            const connection = connectionMap.get(key)!;
            connection.transactions += 1;
            if (transaction.timestamp > connection.lastInteraction) {
              connection.lastInteraction = transaction.timestamp;
            }
          } else if (connectionMap.has(reverseKey)) {
            const connection = connectionMap.get(reverseKey)!;
            connection.transactions += 1;
            if (transaction.timestamp > connection.lastInteraction) {
              connection.lastInteraction = transaction.timestamp;
            }
          } else {
            connectionMap.set(key, {
              source,
              target,
              value: 1, // Placeholder value since we don't know the actual value
              transactions: 1,
              lastInteraction: transaction.timestamp,
            });
          }
        }
      }
    });
  }
  
  return Array.from(connectionMap.values());
}