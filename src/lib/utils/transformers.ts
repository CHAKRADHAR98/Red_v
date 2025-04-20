import { Transaction, TransactionStatus, TransactionType, TokenTransfer } from '../../types/transaction';
import { Wallet, WalletConnection, WalletType } from '../../types/wallet';
import { ProtocolCategory } from '../../types/protocol';
import { PROGRAM_ID_TO_PROTOCOL } from '../../data/protocols';

/**
 * Transform raw Helius transaction data into our application's Transaction type
 * with enhanced protocol detection
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
        programIds: rawTransaction.programIds || [], // Use provided program IDs if available
        type: determineTransactionTypeFromProgramIds(rawTransaction.programIds || []) // Try to determine type from program IDs
      };
    }
    
    // Handle full transaction data
    const programIds = extractProgramIds(rawTransaction);
    
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
      programIds: programIds
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
    
    // Check for Helius-specific enriched data
    if (rawTransaction.parsedInstruction?.length > 0) {
      // Process Helius parsed instructions to get more context
      for (const instruction of rawTransaction.parsedInstruction) {
        if (instruction.program === 'spl-token' && instruction.parsed.type === 'transfer') {
          // It's a token transfer with detailed information
          transaction.type = TransactionType.TOKEN_TRANSFER;
        }
      }
    }
    
    // Determine transaction type
    if (!transaction.type) {
      transaction.type = determineTransactionType(rawTransaction, programIds);
    }
    
    // If we have native transfers, it's a SOL transfer
    if (rawTransaction.meta?.innerInstructions) {
      const hasSystemTransfer = rawTransaction.meta.innerInstructions.some((inner: any) =>
        inner.instructions?.some((ix: any) => 
          ix.program === 'system' && ix.parsed?.type === 'transfer'
        )
      );
      
      if (hasSystemTransfer) {
        transaction.type = TransactionType.SOL_TRANSFER;
      }
    }
    
    // Enhanced type detection based on program IDs
    if (transaction.type === TransactionType.UNKNOWN && programIds.length > 0) {
      transaction.type = determineTransactionTypeFromProgramIds(programIds);
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
  
  // Use provided program IDs if available
  if (rawTransaction.programIds && Array.isArray(rawTransaction.programIds)) {
    rawTransaction.programIds.forEach((id: string) => programIds.add(id));
  }
  
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
 * Determine transaction type based on program IDs
 */
function determineTransactionTypeFromProgramIds(programIds: string[]): TransactionType {
  // Check against known protocol program IDs
  for (const programId of programIds) {
    // System program: SOL transfers
    if (programId === '11111111111111111111111111111111') {
      return TransactionType.SOL_TRANSFER;
    }
    
    // Token Program: Token transfers
    if (programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
      return TransactionType.TOKEN_TRANSFER;
    }
    
    // Associated Token Account Program
    if (programId === 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL') {
      return TransactionType.TOKEN_TRANSFER;
    }
    
    // Metaplex NFT-related
    if (programId === 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s') {
      return TransactionType.NFT_SALE;
    }
    
    // Jupiter DEX
    if (programId === 'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB' ||
        programId === 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4') {
      return TransactionType.SWAP;
    }
    
    // Raydium DEX
    if (programId === '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8') {
      return TransactionType.SWAP;
    }
    
    // Orca DEX
    if (programId === 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc' ||
        programId === '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP') {
      return TransactionType.SWAP;
    }
    
    // Marinade staking
    if (programId === 'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD') {
      return TransactionType.STAKE;
    }
    
    // Lido staking
    if (programId === 'CrX7kMhLC3cSsXJdT7JDgqrRVWGnUpX3gfEfxxU2NVLi') {
      return TransactionType.STAKE;
    }
    
    // Check protocol database for any other mappings
    const protocol = PROGRAM_ID_TO_PROTOCOL.get(programId);
    if (protocol) {
      return mapProtocolToTransactionType(protocol.category);
    }
  }
  
  return TransactionType.UNKNOWN;
}

/**
 * Determine the type of transaction based on its contents
 */
function determineTransactionType(rawTransaction: any, programIds: string[]): TransactionType {
  // Check if it's a SOL transfer by looking at balances
  if (rawTransaction.meta?.preBalances && rawTransaction.meta?.postBalances) {
    const preBalances = rawTransaction.meta.preBalances;
    const postBalances = rawTransaction.meta.postBalances;
    
    // Check if any balances changed, indicating possible SOL transfer
    let balanceChanged = false;
    for (let i = 0; i < Math.min(preBalances.length, postBalances.length); i++) {
      if (preBalances[i] !== postBalances[i]) {
        balanceChanged = true;
        break;
      }
    }
    
    // If balances changed and there are no token transfers, it's likely a SOL transfer
    if (balanceChanged && 
        (!rawTransaction.meta.preTokenBalances || rawTransaction.meta.preTokenBalances.length === 0) &&
        (!rawTransaction.meta.postTokenBalances || rawTransaction.meta.postTokenBalances.length === 0)) {
      return TransactionType.SOL_TRANSFER;
    }
  }
  
  // Check for token transfers
  if (rawTransaction.meta?.preTokenBalances?.length > 0 || 
      rawTransaction.meta?.postTokenBalances?.length > 0) {
    return TransactionType.TOKEN_TRANSFER;
  }
  
  // Check for specific program IDs
  return determineTransactionTypeFromProgramIds(programIds);
}

/**
 * Map protocol categories to transaction types
 */
function mapProtocolToTransactionType(category: string): TransactionType {
  switch (category) {
    case 'dex':
      return TransactionType.SWAP;
    case 'lending':
      return TransactionType.LENDING_DEPOSIT; // Default to deposit, will be refined later
    case 'nft':
      return TransactionType.NFT_SALE;
    case 'staking':
      return TransactionType.STAKE;
    case 'yield':
      return TransactionType.LIQUIDITY_ADD; // Default, will be refined later
    case 'bridge':
      return TransactionType.BRIDGE_TRANSFER;
    case 'governance':
      return TransactionType.GOVERNANCE_VOTE;
    default:
      return TransactionType.UNKNOWN;
  }
}

/**
 * Transform raw wallet data into our application's Wallet type
 */
export function transformWalletData(address: string, accountInfo: any, transactions: Transaction[] = []): Wallet {
  const lamports = accountInfo?.lamports || accountInfo?.data?.parsed?.info?.lamports || 0;
  
  let tokenBalances: any[] = [];
  
  // Extract token balances from transactions
  if (transactions.length > 0) {
    const tokenMap = new Map<string, any>();
    
    transactions.forEach(tx => {
      if (tx.tokenTransfers) {
        tx.tokenTransfers.forEach(transfer => {
          if (transfer.toUserAccount === address) {
            tokenMap.set(transfer.mint, {
              mint: transfer.mint,
              symbol: transfer.symbol || undefined,
              amount: transfer.amount,
              decimals: 0,
              uiAmount: transfer.amount,
            });
          }
        });
      }
    });
    
    tokenBalances = Array.from(tokenMap.values());
  }
  
  // Create the basic wallet object
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
  };
  
  // Initial wallet type determination
  wallet.type = determineWalletType(wallet, transactions);
  
  return wallet;
}

/**
 * Determine wallet type based on characteristics
 */
function determineWalletType(wallet: Wallet, transactions: Transaction[]): WalletType {
  // If it has a very high balance, it might be an exchange
  if (wallet.balance > 1000 * 1e9) { // 1000 SOL
    return WalletType.EXCHANGE;
  }
  
  // If it has program-owned accounts or a large number of token types, it might be a protocol
  if (wallet.tokenBalances && wallet.tokenBalances.length > 20) {
    return WalletType.PROTOCOL;
  }
  
  // If it has many transactions, it's likely a high-activity user or a protocol
  if (wallet.transactionCount && wallet.transactionCount > 500) {
    return WalletType.PROTOCOL;
  }
  
  // Look for program signature patterns to identify protocol wallets
  const hasProgramPatterns = transactions.some(tx => {
    // Check for program ID signatures
    return tx.programIds && tx.programIds.some(programId => {
      const protocol = PROGRAM_ID_TO_PROTOCOL.get(programId);
      return !!protocol;
    });
  });
  
  if (hasProgramPatterns) {
    return WalletType.PROTOCOL;
  }
  
  // Default to user
  return WalletType.USER;
}

/**
 * Generate wallet connections based on transaction data
 */
export function generateWalletConnections(transactions: Transaction[]): WalletConnection[] {
  const connectionMap = new Map<string, WalletConnection>();
  
  // Process token transfers if available
  const hasTokenTransfers = transactions.some(tx => tx.tokenTransfers && tx.tokenTransfers.length > 0);
  
  if (hasTokenTransfers) {
    // Process based on token transfers
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
            lastInteraction: transaction.timestamp
          });
        }
      });
    });
  } else {
    // For transactions without token transfers, use accounts
    transactions.forEach(transaction => {
      if (!transaction.accounts || transaction.accounts.length < 2) {
        // If no accounts, try to extract from the transaction's signature
        if (transaction.signature) {
          const source = transaction.signature.substring(0, 8);
          const target = transaction.signature.substring(8, 16);
          
          const key = `${source}-${target}`;
          const existingConnection = connectionMap.get(key);
          
          if (existingConnection) {
            existingConnection.transactions += 1;
            if (transaction.timestamp > existingConnection.lastInteraction) {
              existingConnection.lastInteraction = transaction.timestamp;
            }
          } else {
            connectionMap.set(key, {
              source,
              target,
              value: 1, // Default value
              transactions: 1,
              lastInteraction: transaction.timestamp
            });
          }
        }
        return;
      }
      
      // Use the first account as source and potentially interacting accounts as targets
      const source = transaction.accounts[0];
      
      // Create connections with other accounts (simplified approach)
      for (let i = 1; i < Math.min(transaction.accounts.length, 5); i++) {
        const target = transaction.accounts[i];
        
        if (source === target) continue;
        
        const key = `${source}-${target}`;
        const existingConnection = connectionMap.get(key);
        
        if (existingConnection) {
          existingConnection.transactions += 1;
          if (transaction.timestamp > existingConnection.lastInteraction) {
            existingConnection.lastInteraction = transaction.timestamp;
          }
        } else {
          connectionMap.set(key, {
            source,
            target,
            value: 1, // Default value
            transactions: 1,
            lastInteraction: transaction.timestamp
          });
        }
      }
    });
  }
  
  return Array.from(connectionMap.values());
}