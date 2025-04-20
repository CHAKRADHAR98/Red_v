import { Connection, PublicKey } from '@solana/web3.js';
import { Transaction } from '../types/transaction';

// Create a connection to the Helius enhanced RPC
export const heliusConnection = new Connection(
  process.env.NEXT_PUBLIC_HELIUS_RPC_URL || '',
  'confirmed'
);

// Fetch individual transaction details
export async function getEnhancedTransactions(signatures: string[]): Promise<any[]> {
  try {
    console.log('Fetching transaction details for signatures:', signatures);
    
    // Use standard getTransaction method instead of enhanced API
    const promises = signatures.map(signature => 
      fetch(process.env.NEXT_PUBLIC_HELIUS_RPC_URL || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: signature,
          method: 'getTransaction',
          params: [signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }],
        }),
      }).then(res => res.json())
    );
    
    const responses = await Promise.all(promises);
    
    // Extract result and filter out any failures
    return responses
      .map(resp => resp.result)
      .filter(result => result !== null);
      
  } catch (error) {
    console.error('Error in getEnhancedTransactions:', error);
    return [];
  }
}

export async function getTransactionsForAddress(address: string, limit: number = 50): Promise<any[]> {
  try {
    if (!address || address.trim() === '') {
      console.error('Empty address provided to getTransactionsForAddress');
      return [];
    }
    
    // Validate the address format before sending to API
    try {
      new PublicKey(address);
    } catch (e) {
      console.error('Invalid Solana address format:', address);
      return [];
    }
    
    // Check if API URL is available
    const apiUrl = process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
    if (!apiUrl) {
      console.error('Helius API URL is not configured. Please check your .env.local file.');
      return [];
    }
    
    console.log('Fetching transactions for address:', address);
    
    // First try with getSignaturesForAddress which is a standard Solana RPC method
    try {
      const signaturesResponse = await fetch(
        apiUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'signatures-request',
            method: 'getSignaturesForAddress',
            params: [
              address,
              {
                limit,
              },
            ],
          }),
        }
      );
  
      if (!signaturesResponse.ok) {
        console.warn(`Signatures API request failed with status ${signaturesResponse.status}`);
        return [];
      }
  
      const signaturesData = await signaturesResponse.json();
      
      if (signaturesData.error) {
        console.warn('Error from API when fetching signatures:', signaturesData.error);
        return [];
      }
  
      // Extract signatures and some basic data from the response
      const sigResults = signaturesData.result || [];
      console.log(`Found ${sigResults.length} transactions for address ${address}`);
      
      // Return simple transaction data if detailed fetching fails
      if (sigResults.length === 0) {
        return [];
      }
      
      // Get as many transactions as possible without hitting rate limits
      // For now, process in smaller batches of 10 since that's typically safe
      try {
        const maxTransactionsToFetch = Math.min(sigResults.length, 20); // Fetch up to 20 transactions
        const signatures = sigResults
          .slice(0, maxTransactionsToFetch)
          .map((item: any) => item.signature);
          
        if (signatures.length > 0) {
          // Process in smaller batches to avoid rate limits
          const batchSize = 5;
          let allTransactions: any[] = [];
          
          for (let i = 0; i < signatures.length; i += batchSize) {
            const batchSignatures = signatures.slice(i, i + batchSize);
            const batchData = await getEnhancedTransactions(batchSignatures);
            allTransactions = [...allTransactions, ...batchData];
            
            // Small delay between batches to avoid rate limits
            if (i + batchSize < signatures.length) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
          
          if (allTransactions.length > 0) {
            console.log(`Successfully fetched ${allTransactions.length} enhanced transactions`);
            
            // Ensure transactions have program IDs for protocol detection
            allTransactions = allTransactions.map(tx => {
              // Extract program IDs from the transaction for better typing
              const programIds = new Set<string>();
              
              // Extract from instructions
              if (tx.transaction?.message?.instructions) {
                tx.transaction.message.instructions.forEach((instruction: any) => {
                  if (instruction.programId) {
                    programIds.add(instruction.programId);
                  }
                });
              }
              
              return {
                ...tx,
                programIds: Array.from(programIds)
              };
            });
            
            return allTransactions;
          }
        }
      } catch (error) {
        console.warn('Error fetching enhanced transactions, falling back to signature data:', error);
      }
      
      // Fallback to signature data if enhanced fetching fails
      console.log('Using basic signature data as fallback');
      return sigResults.map((item: any) => ({
        signature: item.signature,
        slot: item.slot,
        blockTime: item.blockTime,
        err: item.err,
        memo: item.memo,
        // Add basic formatting for our transformer
        fee: 0, // We don't have fee info yet
        timestamp: item.blockTime, // Use blockTime as timestamp
        // Add an array of program IDs even if empty to maintain type consistency
        programIds: []
      }));
      
    } catch (error) {
      console.error('Error fetching signatures:', error);
      return [];
    }
  } catch (error) {
    console.error('Error in getTransactionsForAddress:', error);
    return [];
  }
}

export async function getAccountInfo(address: string): Promise<any> {
  try {
    if (!address || address.trim() === '') {
      console.error('Empty address provided');
      return null;
    }
    
    console.log('Fetching account info for address:', address);
    
    // Convert the string address to a PublicKey object
    const publicKey = new PublicKey(address);
    
    try {
      // Get SOL balance
      const balance = await heliusConnection.getBalance(publicKey);
      
      // Get account info if possible
      try {
        const accountInfo = await heliusConnection.getAccountInfo(publicKey);
        return {
          ...accountInfo,
          lamports: balance,
        };
      } catch (accountError) {
        console.warn('Error fetching account info, using balance only:', accountError);
        // Return balance only if account info fails
        return {
          lamports: balance,
        };
      }
    } catch (balanceError) {
      console.error('Error fetching balance:', balanceError);
      // Return empty account with minimal data
      return {
        lamports: 0,
      };
    }
  } catch (error) {
    console.error('Error in getAccountInfo:', error, 'for address:', address);
    return null;
  }
}