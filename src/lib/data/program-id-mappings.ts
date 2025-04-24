// src/lib/data/program-id-mappings.ts
export interface ProtocolInfo {
    name: string;
    category: string;
    website?: string;
  }
  
  // Map of known program IDs to protocol information
  export const PROGRAM_ID_MAPPINGS: Record<string, ProtocolInfo> = {
    // Jupiter Aggregator
    "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB": {
      name: "Jupiter Aggregator",
      category: "DEX",
      website: "https://jup.ag"
    },
    
    // Marinade Staking
    "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD": {
      name: "Marinade Finance",
      category: "Staking",
      website: "https://marinade.finance"
    },
    
    // Metaplex
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s": {
      name: "Metaplex",
      category: "NFT",
      website: "https://metaplex.com"
    },
    
    // Serum V3
    "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin": {
      name: "Serum DEX v3",
      category: "DEX",
      website: "https://projectserum.com"
    },
    
    // Solend
    "So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo": {
      name: "Solend",
      category: "Lending",
      website: "https://solend.fi"
    },
    
    // Raydium
    "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": {
      name: "Raydium Liquidity Pool V4",
      category: "DEX",
      website: "https://raydium.io"
    },
    
    // Saber
    "SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ": {
      name: "Saber",
      category: "Stableswap",
      website: "https://saber.so"
    },
    
    // Orca
    "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP": {
      name: "Orca Swap V2",
      category: "DEX",
      website: "https://orca.so"
    },
    
    // System Program
    "11111111111111111111111111111111": {
      name: "System Program",
      category: "Native"
    },
    
    // Token Program
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA": {
      name: "Token Program",
      category: "Native"
    },
    
    // Associated Token Account Program
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL": {
      name: "Associated Token Account Program",
      category: "Native"
    },
    
    // Memo Program
    "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr": {
      name: "Memo Program",
      category: "Native"
    }
  };
  
  /**
   * Get protocol information for a given program ID
   */
  export function getProtocolInfo(programId: string): ProtocolInfo | null {
    return PROGRAM_ID_MAPPINGS[programId] || null;
  }
  
  /**
   * Determines the primary protocol used in a transaction based on program IDs
   */
  export function determinePrimaryProtocol(programIds: string[]): ProtocolInfo | null {
    // Filter out native programs first
    const nonNativeProgramIds = programIds.filter(id => {
      const info = PROGRAM_ID_MAPPINGS[id];
      return info && info.category !== 'Native';
    });
    
    // If there are no non-native programs, return null
    if (nonNativeProgramIds.length === 0) {
      return null;
    }
    
    // Return the first non-native program's info
    return PROGRAM_ID_MAPPINGS[nonNativeProgramIds[0]] || null;
  }