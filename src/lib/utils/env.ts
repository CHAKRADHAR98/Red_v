/**
 * Utility functions for handling environment variables
 */

/**
 * Gets the Helius API key from environment variables,
 * trying different potential sources
 */
export function getHeliusApiKey(): string | null {
    // Try to get the API key directly
    let apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
    
    // If not found, try non-public version (less preferred for client components)
    if (!apiKey) {
      apiKey = process.env.HELIUS_API_KEY;
    }
    
    // If still not found, try to extract from RPC URL
    if (!apiKey) {
      const rpcUrl = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || '';
      const match = rpcUrl.match(/api-key=([^&]+)/);
      if (match && match[1]) {
        apiKey = match[1];
      }
    }
    
    return apiKey || null;
  }
  
  /**
   * Gets the Helius RPC URL from environment variables
   */
  export function getHeliusRpcUrl(): string | null {
    // Try to get the RPC URL directly
    let rpcUrl = process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
    
    // If not found but we have an API key, construct the URL
    if (!rpcUrl) {
      const apiKey = getHeliusApiKey();
      if (apiKey) {
        rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
      }
    }
    
    return rpcUrl || null;
  }
  
  /**
   * Checks if Helius API configuration is available
   */
  export function hasHeliusConfig(): boolean {
    return !!getHeliusApiKey();
  }