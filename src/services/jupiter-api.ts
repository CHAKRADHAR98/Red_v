// src/services/jupiter-api.ts

import { JupiterTokenInfo, JupiterPriceInfo, TokenTag } from '../types/token';
import { showError, showWarning } from '../lib/utils/notifications';

// Jupiter API Configuration
const JUPITER_TOKEN_API_BASE = 'https://lite-api.jup.ag/tokens/v1';
const JUPITER_PRICE_API_BASE = 'https://lite-api.jup.ag/price/v2';

// Cache configuration
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const PRICE_CACHE_DURATION = 30 * 1000; // 30 seconds for prices

/**
 * Cache utilities
 */
function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData<T>(key: string, data: T, duration: number): void {
  cache.set(key, {
    data,
    expiry: Date.now() + duration
  });
}

/**
 * Get information for a specific token by mint address
 */
export async function getJupiterTokenInfo(mintAddress: string): Promise<JupiterTokenInfo | null> {
  const cacheKey = `jupiter-token-${mintAddress}`;
  const cached = getCachedData<JupiterTokenInfo>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${JUPITER_TOKEN_API_BASE}/token/${mintAddress}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Token ${mintAddress} not found in Jupiter API`);
        return null;
      }
      throw new Error(`Jupiter API request failed with status ${response.status}`);
    }

    const tokenInfo: JupiterTokenInfo = await response.json();
    setCachedData(cacheKey, tokenInfo, CACHE_DURATION);
    
    return tokenInfo;
  } catch (error) {
    console.error('Error fetching Jupiter token info:', error);
    showError(`Failed to fetch token information for ${mintAddress}`);
    return null;
  }
}

/**
 * Get all tradable tokens from Jupiter
 */
export async function getJupiterTradableTokens(): Promise<string[]> {
  const cacheKey = 'jupiter-tradable-tokens';
  const cached = getCachedData<string[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${JUPITER_TOKEN_API_BASE}/mints/tradable`);
    
    if (!response.ok) {
      throw new Error(`Jupiter API request failed with status ${response.status}`);
    }

    const tradableTokens: string[] = await response.json();
    setCachedData(cacheKey, tradableTokens, CACHE_DURATION);
    
    return tradableTokens;
  } catch (error) {
    console.error('Error fetching tradable tokens:', error);
    showError('Failed to fetch tradable tokens list');
    return [];
  }
}

/**
 * Get tokens by specific tags
 */
export async function getJupiterTokensByTag(tag: TokenTag | string): Promise<JupiterTokenInfo[]> {
  const cacheKey = `jupiter-tokens-tag-${tag}`;
  const cached = getCachedData<JupiterTokenInfo[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${JUPITER_TOKEN_API_BASE}/tagged/${tag}`);
    
    if (!response.ok) {
      throw new Error(`Jupiter API request failed with status ${response.status}`);
    }

    const tokens: JupiterTokenInfo[] = await response.json();
    setCachedData(cacheKey, tokens, CACHE_DURATION);
    
    return tokens;
  } catch (error) {
    console.error(`Error fetching tokens by tag ${tag}:`, error);
    showError(`Failed to fetch ${tag} tokens`);
    return [];
  }
}

/**
 * Get new tokens sorted by creation date
 */
export async function getJupiterNewTokens(limit: number = 50, offset: number = 0): Promise<JupiterTokenInfo[]> {
  const cacheKey = `jupiter-new-tokens-${limit}-${offset}`;
  const cached = getCachedData<JupiterTokenInfo[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = new URL(`${JUPITER_TOKEN_API_BASE}/new`);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Jupiter API request failed with status ${response.status}`);
    }

    const tokens: JupiterTokenInfo[] = await response.json();
    setCachedData(cacheKey, tokens, CACHE_DURATION);
    
    return tokens;
  } catch (error) {
    console.error('Error fetching new tokens:', error);
    showError('Failed to fetch new tokens');
    return [];
  }
}

/**
 * Get all tokens (WARNING: Large payload ~300MB)
 */
export async function getJupiterAllTokens(): Promise<JupiterTokenInfo[]> {
  const cacheKey = 'jupiter-all-tokens';
  const cached = getCachedData<JupiterTokenInfo[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    showWarning('Fetching all tokens - this may take a while due to large data size');
    
    const response = await fetch(`${JUPITER_TOKEN_API_BASE}/all`);
    
    if (!response.ok) {
      throw new Error(`Jupiter API request failed with status ${response.status}`);
    }

    const tokens: JupiterTokenInfo[] = await response.json();
    
    // Cache for longer since this is expensive
    setCachedData(cacheKey, tokens, 30 * 60 * 1000); // 30 minutes
    
    return tokens;
  } catch (error) {
    console.error('Error fetching all tokens:', error);
    showError('Failed to fetch complete token list');
    return [];
  }
}

/**
 * Get token prices (basic)
 */
export async function getJupiterTokenPrices(
  tokenIds: string[],
  vsToken?: string
): Promise<Record<string, JupiterPriceInfo>> {
  if (tokenIds.length === 0) return {};
  if (tokenIds.length > 100) {
    console.warn('Jupiter Price API supports maximum 100 tokens per request');
    tokenIds = tokenIds.slice(0, 100);
  }

  const cacheKey = `jupiter-prices-${tokenIds.join(',')}-${vsToken || 'USDC'}`;
  const cached = getCachedData<Record<string, JupiterPriceInfo>>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = new URL(JUPITER_PRICE_API_BASE);
    url.searchParams.set('ids', tokenIds.join(','));
    if (vsToken) {
      url.searchParams.set('vsToken', vsToken);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Jupiter Price API request failed with status ${response.status}`);
    }

    const result = await response.json();
    const prices = result.data || {};
    
    setCachedData(cacheKey, prices, PRICE_CACHE_DURATION);
    
    return prices;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    showError('Failed to fetch token prices');
    return {};
  }
}

/**
 * Get token prices with detailed information
 */
export async function getJupiterTokenPricesDetailed(
  tokenIds: string[]
): Promise<Record<string, JupiterPriceInfo>> {
  if (tokenIds.length === 0) return {};
  if (tokenIds.length > 100) {
    console.warn('Jupiter Price API supports maximum 100 tokens per request');
    tokenIds = tokenIds.slice(0, 100);
  }

  const cacheKey = `jupiter-prices-detailed-${tokenIds.join(',')}`;
  const cached = getCachedData<Record<string, JupiterPriceInfo>>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = new URL(JUPITER_PRICE_API_BASE);
    url.searchParams.set('ids', tokenIds.join(','));
    url.searchParams.set('showExtraInfo', 'true');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Jupiter Price API request failed with status ${response.status}`);
    }

    const result = await response.json();
    const prices = result.data || {};
    
    setCachedData(cacheKey, prices, PRICE_CACHE_DURATION);
    
    return prices;
  } catch (error) {
    console.error('Error fetching detailed token prices:', error);
    showError('Failed to fetch detailed token prices');
    return {};
  }
}

/**
 * Get tokens for a specific market/pool
 */
export async function getJupiterMarketTokens(marketAddress: string): Promise<string[]> {
  const cacheKey = `jupiter-market-tokens-${marketAddress}`;
  const cached = getCachedData<string[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${JUPITER_TOKEN_API_BASE}/market/${marketAddress}/mints`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Market ${marketAddress} not found`);
        return [];
      }
      throw new Error(`Jupiter API request failed with status ${response.status}`);
    }

    const tokens: string[] = await response.json();
    setCachedData(cacheKey, tokens, CACHE_DURATION);
    
    return tokens;
  } catch (error) {
    console.error(`Error fetching market tokens for ${marketAddress}:`, error);
    showError(`Failed to fetch tokens for market ${marketAddress}`);
    return [];
  }
}

/**
 * Search tokens by name or symbol
 */
export async function searchJupiterTokens(
  query: string,
  limit: number = 50
): Promise<JupiterTokenInfo[]> {
  try {
    // Get verified tokens first for better search results
    const verifiedTokens = await getJupiterTokensByTag(TokenTag.VERIFIED);
    
    const searchTerm = query.toLowerCase().trim();
    
    const filtered = verifiedTokens
      .filter(token => 
        token.name.toLowerCase().includes(searchTerm) ||
        token.symbol.toLowerCase().includes(searchTerm) ||
        token.address.toLowerCase().includes(searchTerm)
      )
      .slice(0, limit);
    
    return filtered;
  } catch (error) {
    console.error('Error searching tokens:', error);
    showError('Failed to search tokens');
    return [];
  }
}

/**
 * Get top tokens by volume
 */
export async function getJupiterTopTokensByVolume(limit: number = 50): Promise<JupiterTokenInfo[]> {
  try {
    // Get verified tokens and sort by volume
    const verifiedTokens = await getJupiterTokensByTag(TokenTag.VERIFIED);
    
    const sorted = verifiedTokens
      .filter(token => token.daily_volume && token.daily_volume > 0)
      .sort((a, b) => (b.daily_volume || 0) - (a.daily_volume || 0))
      .slice(0, limit);
    
    return sorted;
  } catch (error) {
    console.error('Error fetching top tokens by volume:', error);
    showError('Failed to fetch top tokens');
    return [];
  }
}

/**
 * Clear cache (useful for debugging or forced refresh)
 */
export function clearJupiterCache(): void {
  cache.clear();
  console.log('Jupiter API cache cleared');
}