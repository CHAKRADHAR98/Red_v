import { PublicKey } from '@solana/web3.js';
import { showError } from '../lib/utils/notifications';

/**
 * Get transaction history for a wallet address using Helius API
 */
export async function getWalletTransactions(address: string, limit: number = 50): Promise<any[]> {
  try {
    if (!address || address.trim() === '') {
      console.error('Empty address provided');
      return [];
    }
    
    // Validate the address format before sending to API
    try {
      new PublicKey(address);
    } catch (e) {
      console.error('Invalid Solana address format:', address);
      return [];
    }
    
    const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
    if (!apiKey) {
      console.error('Helius API key is not configured');
      return [];
    }
    
    // Use direct Helius API endpoint
    const url = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}&limit=${limit}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed with status ${response.status}: ${errorText}`);
      return [];
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    showError('Failed to fetch wallet transactions');
    return [];
  }
}

/**
 * Get detailed information for a specific transaction
 */
export async function getTransactionDetails(signature: string): Promise<any | null> {
  try {
    if (!signature || signature.trim() === '') {
      console.error('Empty signature provided');
      return null;
    }
    
    const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
    if (!apiKey) {
      console.error('Helius API key is not configured');
      return null;
    }
    
    // Use direct Helius API endpoint
    const url = `https://api.helius.xyz/v0/transactions/${signature}?api-key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed with status ${response.status}: ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    showError('Failed to fetch transaction details');
    return null;
  }
}

/**
 * Get enriched name information for addresses
 */
export async function getAddressNames(addresses: string[]): Promise<Record<string, string>> {
  try {
    if (!addresses || addresses.length === 0) {
      return {};
    }
    
    const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
    if (!apiKey) {
      console.error('Helius API key is not configured');
      return {};
    }
    
    // Use direct Helius API endpoint for name service
    const url = `https://api.helius.xyz/v0/addresses/names?api-key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addresses }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed with status ${response.status}: ${errorText}`);
      return {};
    }
    
    const data = await response.json();
    
    // Convert the response to a record of address -> name
    const nameMap: Record<string, string> = {};
    
    for (const item of data) {
      if (item.address && (item.name || item.displayName)) {
        nameMap[item.address] = item.displayName || item.name;
      }
    }
    
    return nameMap;
  } catch (error) {
    console.error('Error fetching address names:', error);
    return {};
  }
}

/**
 * Get balances for a wallet address including tokens
 */
export async function getWalletBalances(address: string): Promise<any> {
  try {
    if (!address || address.trim() === '') {
      console.error('Empty address provided');
      return null;
    }
    
    // Validate the address format before sending to API
    try {
      new PublicKey(address);
    } catch (e) {
      console.error('Invalid Solana address format:', address);
      return null;
    }
    
    const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
    if (!apiKey) {
      console.error('Helius API key is not configured');
      return null;
    }
    
    // Use direct Helius API endpoint
    const url = `https://api.helius.xyz/v0/addresses/${address}/balances?api-key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed with status ${response.status}: ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    showError('Failed to fetch wallet balances');
    return null;
  }
}