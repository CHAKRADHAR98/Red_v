import { TransactionType } from '../../types/transaction';

/**
 * A simplified detector for transaction types that focuses on reliability
 */
export function detectTransactionType(transaction: any): TransactionType {
  try {
    // 1. Check for system program transfers (SOL transfers)
    const hasSystemTransfer = checkForSystemTransfer(transaction);
    if (hasSystemTransfer) {
      console.log(`Detected SOL transfer in transaction ${transaction.signature?.slice(0, 8)}`);
      return TransactionType.SOL_TRANSFER;
    }
    
    // 2. Check for token transfers
    const hasTokenTransfer = checkForTokenTransfer(transaction);
    if (hasTokenTransfer) {
      console.log(`Detected token transfer in transaction ${transaction.signature?.slice(0, 8)}`);
      return TransactionType.TOKEN_TRANSFER;
    }
    
    // 3. Check for specific program IDs
    const programType = checkProgramBasedType(transaction);
    if (programType !== TransactionType.UNKNOWN) {
      console.log(`Detected program-based type in transaction ${transaction.signature?.slice(0, 8)}: ${programType}`);
      return programType;
    }
    
    // Default to unknown if no specific type detected
    return TransactionType.UNKNOWN;
  } catch (error) {
    console.error("Error in detectTransactionType:", error);
    return TransactionType.UNKNOWN;
  }
}

/**
 * Check if the transaction involves a SOL transfer
 */
function checkForSystemTransfer(transaction: any): boolean {
  try {
    // Check for system program (11111111111111111111111111111111)
    const systemProgramId = '11111111111111111111111111111111';
    
    // Check if programId is directly in transaction
    if (transaction.programId === systemProgramId) {
      return true;
    }
    
    // Check programIds array
    if (transaction.programIds && transaction.programIds.includes(systemProgramId)) {
      return true;
    }
    
    // Check for system program in instructions
    if (transaction.transaction?.message?.instructions) {
      for (const instruction of transaction.transaction.message.instructions) {
        if (instruction.programId === systemProgramId) {
          return true;
        }
        
        // Check by program index
        if (instruction.programIdIndex !== undefined) {
          const accountKeys = transaction.transaction.message.accountKeys;
          if (accountKeys && instruction.programIdIndex < accountKeys.length) {
            const programId = typeof accountKeys[instruction.programIdIndex] === 'string'
              ? accountKeys[instruction.programIdIndex]
              : accountKeys[instruction.programIdIndex]?.pubkey;
              
            if (programId === systemProgramId) {
              return true;
            }
          }
        }
      }
    }
    
    // Check for SOL balance changes
    if (transaction.meta?.preBalances && transaction.meta?.postBalances) {
      for (let i = 0; i < transaction.meta.preBalances.length; i++) {
        if (transaction.meta.preBalances[i] !== transaction.meta.postBalances[i]) {
          // If there was a balance change and no token transfers, it's likely a SOL transfer
          const noTokenActivity = 
            (!transaction.meta.preTokenBalances || transaction.meta.preTokenBalances.length === 0) &&
            (!transaction.meta.postTokenBalances || transaction.meta.postTokenBalances.length === 0);
            
          if (noTokenActivity) {
            return true;
          }
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error checking for system transfer:", error);
    return false;
  }
}

/**
 * Check if the transaction involves a token transfer
 */
function checkForTokenTransfer(transaction: any): boolean {
  try {
    // Token program ID
    const tokenProgramId = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
    
    // Check if programId is directly in transaction
    if (transaction.programId === tokenProgramId) {
      return true;
    }
    
    // Check programIds array
    if (transaction.programIds && transaction.programIds.includes(tokenProgramId)) {
      return true;
    }
    
    // Check for token program in instructions
    if (transaction.transaction?.message?.instructions) {
      for (const instruction of transaction.transaction.message.instructions) {
        if (instruction.programId === tokenProgramId) {
          return true;
        }
        
        // Check by program index
        if (instruction.programIdIndex !== undefined) {
          const accountKeys = transaction.transaction.message.accountKeys;
          if (accountKeys && instruction.programIdIndex < accountKeys.length) {
            const programId = typeof accountKeys[instruction.programIdIndex] === 'string'
              ? accountKeys[instruction.programIdIndex]
              : accountKeys[instruction.programIdIndex]?.pubkey;
              
            if (programId === tokenProgramId) {
              return true;
            }
          }
        }
      }
    }
    
    // Check for token balance changes
    if (transaction.meta?.preTokenBalances?.length > 0 || transaction.meta?.postTokenBalances?.length > 0) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking for token transfer:", error);
    return false;
  }
}

/**
 * Determine transaction type based on program IDs
 */
function checkProgramBasedType(transaction: any): TransactionType {
  try {
    // Extract program IDs from the transaction
    const programIds: string[] = [];
    
    // Use programIds array if available
    if (transaction.programIds && Array.isArray(transaction.programIds)) {
      programIds.push(...transaction.programIds);
    }
    
    // Extract from instructions
    if (transaction.transaction?.message?.instructions) {
      transaction.transaction.message.instructions.forEach((instruction: any) => {
        if (instruction.programId) {
          programIds.push(instruction.programId);
        }
      });
    }
    
    // Check for known program IDs
    for (const programId of programIds) {
      // DEX programs (Jupiter, Raydium, Orca)
      if (
        programId === 'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB' || // Jupiter v4
        programId === 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4' || // Jupiter v6
        programId === '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8' || // Raydium
        programId === 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc' || // Orca
        programId === '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP'   // Orca v2
      ) {
        return TransactionType.SWAP;
      }
      
      // NFT programs (Metaplex)
      if (
        programId === 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' || // Token Metadata
        programId === 'p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98' || // Auction
        programId === 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K'   // Magic Eden
      ) {
        return TransactionType.NFT_SALE;
      }
      
      // Staking programs
      if (
        programId === 'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD' || // Marinade
        programId === 'CrX7kMhLC3cSsXJdT7JDgqrRVWGnUpX3gfEfxxU2NVLi'   // Lido
      ) {
        return TransactionType.STAKE;
      }
      
      // Lending programs
      if (
        programId === 'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo' || // Solend
        programId === 'mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDTG52b'    // Mango
      ) {
        return TransactionType.LENDING_DEPOSIT;
      }
    }
    
    return TransactionType.UNKNOWN;
  } catch (error) {
    console.error("Error checking program-based type:", error);
    return TransactionType.UNKNOWN;
  }
}