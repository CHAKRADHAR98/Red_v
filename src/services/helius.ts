import { Connection, PublicKey } from '@solana/web3.js';
import { Transaction } from '../types/transaction';

// Create a connection to the Helius enhanced RPC
export const heliusConnection = new Connection(
  process.env.NEXT_PUBLIC_HELIUS_RPC_URL || '',
  'confirmed'
);

export async function getEnhancedTransactions(signatures: string[]): Promise<any[]> {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_HELIUS_RPC_URL || '',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'my-id',
          method: 'getTransactions',
          params: [signatures, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }],
        }),
      }
    );

    const data = await response.json();
    if (data.error) {
      console.error('Error fetching enhanced transactions:', data.error);
      return [];
    }

    return data.result || [];
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
      
      // Return simple transaction data if detailed fetching fails
      if (sigResults.length === 0) {
        return [];
      }
      
      // For the MVP, just use the signature data without fetching full transaction details
      // This gives us enough info to display a basic transaction list
      return sigResults.map((item: any) => ({
        signature: item.signature,
        slot: item.slot,
        blockTime: item.blockTime,
        err: item.err,
        memo: item.memo,
        // Add basic formatting for our transformer
        fee: 0, // We don't have fee info yet
        timestamp: item.blockTime, // Use blockTime as timestamp
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
    
    // Convert the string address to a PublicKey object
    const publicKey = new PublicKey(address);
    const accountInfo = await heliusConnection.getAccountInfo(publicKey);
    return accountInfo;
  } catch (error) {
    console.error('Error fetching account info:', error, 'for address:', address);
    return null;
  }
}

export async function getNameTags(addresses: string[]): Promise<Record<string, string>> {
  try {
    // This is a placeholder for the Helius Name Tags API
    // You'll need to implement the actual API call
    const response = await fetch(
      `https://api.helius.xyz/v0/address-tags?api-key=${process.env.HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addresses }),
      }
    );

    const data = await response.json();
    // Process the response to create a mapping of address -> tag
    const tags: Record<string, string> = {};
    
    // Example processing - adjust based on actual API response
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        if (item.address && item.tag) {
          tags[item.address] = item.tag;
        }
      });
    }
    
    return tags;
  } catch (error) {
    console.error('Error fetching name tags:', error);
    return {};
  }
}