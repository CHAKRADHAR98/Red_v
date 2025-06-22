// src/services/token-service.ts - Updated to use Jupiter APIs

import { 
  Token, 
  TokenMetrics, 
  TokenHolder, 
  TokenTransfer, 
  TokenListItem,
  JupiterTokenInfo,
  JupiterPriceInfo,
  TokenTag,
  TokenFilters
} from '../types/token';
import { 
  getJupiterTokenInfo,
  getJupiterTokensByTag,
  getJupiterTokenPrices,
  getJupiterTokenPricesDetailed,
  getJupiterTopTokensByVolume,
  searchJupiterTokens,
  getJupiterNewTokens
} from './jupiter-api';
import { getHeliusApiKey } from '../lib/utils/env';
import { showError, showInfo } from '../lib/utils/notifications';
import { PublicKey } from '@solana/web3.js';

// Cache configuration
const tokenCache = new Map<string, any>();
const TOKEN_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Cache utilities
 */
function getCachedData(key: string): any {
  const cachedItem = tokenCache.get(key);
  if (cachedItem && Date.now() < cachedItem.expiry) {
    return cachedItem.data;
  }
  return null;
}

function setCachedData(key: string, data: any, ttl: number): void {
  tokenCache.set(key, {
    data,
    expiry: Date.now() + ttl
  });
}

/**
 * Transform Jupiter token info to our Token type
 */
function transformJupiterToken(jupiterToken: JupiterTokenInfo): Token {
  return {
    address: jupiterToken.address,
    name: jupiterToken.name,
    symbol: jupiterToken.symbol,
    decimals: jupiterToken.decimals,
    logoURI: jupiterToken.logoURI,
    tags: jupiterToken.tags,
    daily_volume: jupiterToken.daily_volume,
    created_at: jupiterToken.created_at,
    freeze_authority: jupiterToken.freeze_authority,
    mint_authority: jupiterToken.mint_authority,
    permanent_delegate: jupiterToken.permanent_delegate,
    minted_at: jupiterToken.minted_at,
    extensions: jupiterToken.extensions,
    
    // Backward compatibility
    mint: jupiterToken.address,
    logoUrl: jupiterToken.logoURI,
    coingeckoId: jupiterToken.extensions?.coingeckoId,
    supply: 0, // Would need separate API call to get this
  };
}

/**
 * Transform Jupiter token info to TokenListItem
 */
function transformToTokenListItem(
  jupiterToken: JupiterTokenInfo, 
  priceInfo?: JupiterPriceInfo
): TokenListItem {
  const price = priceInfo ? parseFloat(priceInfo.price) : undefined;
  
  return {
    address: jupiterToken.address,
    name: jupiterToken.name,
    symbol: jupiterToken.symbol,
    logoURI: jupiterToken.logoURI,
    price,
    volume24h: jupiterToken.daily_volume,
    tags: Array.isArray(jupiterToken.tags) ? jupiterToken.tags : [], // Ensure tags is always an array
    daily_volume: jupiterToken.daily_volume,
    
    // Backward compatibility
    mint: jupiterToken.address,
    logoUrl: jupiterToken.logoURI,
  };
}

/**
 * Get list of top tokens with enhanced filtering
 */
export async function getTopTokens(
  limit: number = 50, 
  filters?: TokenFilters
): Promise<TokenListItem[]> {
  try {
    console.log(`Fetching top ${limit} tokens with filters:`, filters);
    
    // Check cache first
    const cacheKey = `top-tokens-${limit}-${JSON.stringify(filters)}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log('Returning cached token list');
      return cachedData;
    }

    let tokens: JupiterTokenInfo[] = [];

    // Fetch tokens based on filters
    if (filters?.tags && filters.tags.length > 0) {
      // Get tokens by specific tags
      const tagTokens = await Promise.all(
        filters.tags.map(tag => getJupiterTokensByTag(tag))
      );
      tokens = tagTokens.flat();
      
      // Remove duplicates
      const unique = new Map<string, JupiterTokenInfo>();
      tokens.forEach(token => unique.set(token.address, token));
      tokens = Array.from(unique.values());
    } else {
      // Get top tokens by volume (verified tokens)
      tokens = await getJupiterTopTokensByVolume(limit * 2); // Get more for filtering
    }

    // Apply additional filters
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      tokens = tokens.filter(token =>
        token.name.toLowerCase().includes(searchTerm) ||
        token.symbol.toLowerCase().includes(searchTerm) ||
        token.address.toLowerCase().includes(searchTerm)
      );
    }

    if (filters?.minVolume) {
      tokens = tokens.filter(token => 
        token.daily_volume && token.daily_volume >= filters.minVolume!
      );
    }

    if (filters?.maxVolume) {
      tokens = tokens.filter(token => 
        token.daily_volume && token.daily_volume <= filters.maxVolume!
      );
    }

    if (filters?.verified) {
      tokens = tokens.filter(token => 
        token.tags?.includes('verified') || token.tags?.includes('strict')
      );
    }

    // Limit results
    tokens = tokens.slice(0, limit);

    // Get prices for the tokens
    const tokenAddresses = tokens.map(t => t.address);
    let priceData: Record<string, JupiterPriceInfo> = {};
    
    if (tokenAddresses.length > 0) {
      try {
        priceData = await getJupiterTokenPrices(tokenAddresses);
      } catch (priceError) {
        console.warn('Failed to fetch prices, continuing without price data:', priceError);
      }
    }

    // Transform to TokenListItem with price data
    const tokenList = tokens.map(token => 
      transformToTokenListItem(token, priceData[token.address])
    );

    // Sort by volume if no other sorting specified
    tokenList.sort((a, b) => (b.daily_volume || 0) - (a.daily_volume || 0));

    // Cache the result
    setCachedData(cacheKey, tokenList, TOKEN_CACHE_DURATION);
    
    console.log(`Successfully fetched ${tokenList.length} tokens`);
    return tokenList;

  } catch (error) {
    console.error('Error fetching top tokens:', error);
    showError('Failed to fetch token list');
    
    // Return fallback known tokens
    return getFallbackTokens();
  }
}

/**
 * Get detailed information about a specific token
 */
export async function getTokenInfo(tokenMint: string): Promise<Token | null> {
  try {
    // Check cache first
    const cacheKey = `token-info-${tokenMint}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // Validate the token mint address format
    try {
      new PublicKey(tokenMint);
    } catch (e) {
      console.error('Invalid token mint address format:', tokenMint);
      return null;
    }
    
    // Get token info from Jupiter
    const jupiterToken = await getJupiterTokenInfo(tokenMint);
    if (!jupiterToken) {
      console.warn(`Token ${tokenMint} not found in Jupiter API`);
      return null;
    }

    // Transform to our Token type
    const token = transformJupiterToken(jupiterToken);
    
    // Cache the result
    setCachedData(cacheKey, token, TOKEN_CACHE_DURATION);
    
    return token;
  } catch (error) {
    console.error('Error fetching token info:', error);
    showError('Failed to fetch token information');
    return null;
  }
}

/**
 * Get token metrics including Jupiter price data
 */
export async function getTokenMetrics(tokenMint: string): Promise<TokenMetrics | null> {
  try {
    // Check cache first
    const cacheKey = `token-metrics-${tokenMint}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // Get basic token info
    const token = await getTokenInfo(tokenMint);
    if (!token) {
      return null;
    }

    // Get detailed price information from Jupiter
    const priceData = await getJupiterTokenPricesDetailed([tokenMint]);
    const priceInfo = priceData[tokenMint];

    const metrics: TokenMetrics = {
      // Jupiter price data
      price: priceInfo ? parseFloat(priceInfo.price) : undefined,
      confidence: priceInfo?.extraInfo?.confidenceLevel,
      lastUpdated: new Date(),
      dailyVolume: token.daily_volume,
    };

    // Extract detailed price information if available
    if (priceInfo?.extraInfo) {
      const extraInfo = priceInfo.extraInfo;
      
      if (extraInfo.quotedPrice) {
        metrics.buyPrice = parseFloat(extraInfo.quotedPrice.buyPrice);
        metrics.sellPrice = parseFloat(extraInfo.quotedPrice.sellPrice);
      }

      if (extraInfo.depth) {
        metrics.priceImpact = {
          buy: {
            small: extraInfo.depth.buyPriceImpactRatio?.depth?.["10"] || 0,
            medium: extraInfo.depth.buyPriceImpactRatio?.depth?.["100"] || 0,
            large: extraInfo.depth.buyPriceImpactRatio?.depth?.["1000"] || 0,
          },
          sell: {
            small: extraInfo.depth.sellPriceImpactRatio?.depth?.["10"] || 0,
            medium: extraInfo.depth.sellPriceImpactRatio?.depth?.["100"] || 0,
            large: extraInfo.depth.sellPriceImpactRatio?.depth?.["1000"] || 0,
          }
        };
      }
    }

    // Try to get additional market data from CoinGecko if available
    if (token.coingeckoId) {
      try {
        const cgResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/${token.coingeckoId}?localization=false&tickers=false&community_data=false&developer_data=false`
        );
        
        if (cgResponse.ok) {
          const cgData = await cgResponse.json();
          
          metrics.marketCap = cgData.market_data?.market_cap?.usd;
          metrics.priceChange24h = cgData.market_data?.price_change_percentage_24h;
          
          if (cgData.genesis_date) {
            metrics.createdAt = new Date(cgData.genesis_date);
          }
        }
      } catch (cgError) {
        console.warn('Could not fetch CoinGecko data:', cgError);
      }
    }

    // Set creation date from Jupiter data if available
    if (token.created_at && !metrics.createdAt) {
      metrics.createdAt = new Date(token.created_at);
    }

    // Cache the result
    setCachedData(cacheKey, metrics, TOKEN_CACHE_DURATION);
    
    return metrics;
  } catch (error) {
    console.error('Error fetching token metrics:', error);
    showError('Failed to fetch token metrics');
    return null;
  }
}

/**
 * Search tokens using Jupiter API
 */
export async function searchTokens(query: string, limit: number = 20): Promise<TokenListItem[]> {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const tokens = await searchJupiterTokens(query, limit);
    
    // Get prices for search results
    const tokenAddresses = tokens.map(t => t.address);
    let priceData: Record<string, JupiterPriceInfo> = {};
    
    if (tokenAddresses.length > 0) {
      try {
        priceData = await getJupiterTokenPrices(tokenAddresses);
      } catch (priceError) {
        console.warn('Failed to fetch prices for search results:', priceError);
      }
    }

    return tokens.map(token => 
      transformToTokenListItem(token, priceData[token.address])
    );
  } catch (error) {
    console.error('Error searching tokens:', error);
    showError('Failed to search tokens');
    return [];
  }
}

/**
 * Get tokens by category/tag
 */
export async function getTokensByCategory(tag: TokenTag, limit: number = 50): Promise<TokenListItem[]> {
  try {
    const cacheKey = `tokens-category-${tag}-${limit}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const tokens = await getJupiterTokensByTag(tag);
    const limitedTokens = tokens.slice(0, limit);
    
    // Get prices
    const tokenAddresses = limitedTokens.map(t => t.address);
    let priceData: Record<string, JupiterPriceInfo> = {};
    
    if (tokenAddresses.length > 0) {
      try {
        priceData = await getJupiterTokenPrices(tokenAddresses);
      } catch (priceError) {
        console.warn('Failed to fetch prices for category tokens:', priceError);
      }
    }

    const tokenList = limitedTokens.map(token => 
      transformToTokenListItem(token, priceData[token.address])
    );

    setCachedData(cacheKey, tokenList, TOKEN_CACHE_DURATION);
    return tokenList;
  } catch (error) {
    console.error(`Error fetching tokens by category ${tag}:`, error);
    showError(`Failed to fetch ${tag} tokens`);
    return [];
  }
}

/**
 * Get new/recently created tokens
 */
export async function getNewTokens(limit: number = 20, offset: number = 0): Promise<TokenListItem[]> {
  try {
    const tokens = await getJupiterNewTokens(limit, offset);
    
    // Get prices
    const tokenAddresses = tokens.map(t => t.address);
    let priceData: Record<string, JupiterPriceInfo> = {};
    
    if (tokenAddresses.length > 0) {
      try {
        priceData = await getJupiterTokenPrices(tokenAddresses);
      } catch (priceError) {
        console.warn('Failed to fetch prices for new tokens:', priceError);
      }
    }

    return tokens.map(token => 
      transformToTokenListItem(token, priceData[token.address])
    );
  } catch (error) {
    console.error('Error fetching new tokens:', error);
    showError('Failed to fetch new tokens');
    return [];
  }
}

/**
 * Get token holders (still uses Helius/mock data as Jupiter doesn't provide this)
 */
export async function getTokenHolders(tokenMint: string, limit: number = 50): Promise<TokenHolder[]> {
  try {
    // Check cache first
    const cacheKey = `token-holders-${tokenMint}-${limit}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const apiKey = getHeliusApiKey();
    if (!apiKey) {
      console.warn('Helius API key not configured, using mock data');
      return getTemporaryTokenHolders(tokenMint, limit);
    }
    
    // Get token info for decimals
    const token = await getTokenInfo(tokenMint);
    if (!token) {
      return getTemporaryTokenHolders(tokenMint, limit);
    }
    
    // Try Helius API for holders (this endpoint may not exist)
    try {
      const url = `https://api.helius.xyz/v0/tokens/${tokenMint}/largest-accounts?api-key=${apiKey}&limit=${limit}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const holders: TokenHolder[] = data.map((holder: any) => ({
          address: holder.address,
          amount: holder.amount,
          uiAmount: holder.amount / Math.pow(10, token.decimals),
          percentage: holder.percentage,
          ownerType: inferOwnerType(holder.address),
          name: holder.name
        }));
        
        setCachedData(cacheKey, holders, TOKEN_CACHE_DURATION);
        return holders;
      }
    } catch (heliusError) {
      console.warn('Helius holders API not available:', heliusError);
    }
    
    // Fallback to mock data
    const mockHolders = getTemporaryTokenHolders(tokenMint, limit);
    setCachedData(cacheKey, mockHolders, TOKEN_CACHE_DURATION);
    return mockHolders;
    
  } catch (error) {
    console.error('Error fetching token holders:', error);
    showError('Failed to fetch token holders');
    return getTemporaryTokenHolders(tokenMint, limit);
  }
}

/**
 * Get token transfers (still uses Helius/mock data as Jupiter doesn't provide this)
 */
export async function getTokenTransfers(tokenMint: string, limit: number = 50): Promise<TokenTransfer[]> {
  try {
    // Check cache first
    const cacheKey = `token-transfers-${tokenMint}-${limit}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const apiKey = getHeliusApiKey();
    if (!apiKey) {
      console.warn('Helius API key not configured, using mock data');
      return getTemporaryTokenTransfers(tokenMint, limit);
    }
    
    // Get token info for decimals
    const token = await getTokenInfo(tokenMint);
    if (!token) {
      return getTemporaryTokenTransfers(tokenMint, limit);
    }
    
    // Try Helius API for transfers
    try {
      const url = `https://api.helius.xyz/v0/addresses/${tokenMint}/transactions?api-key=${apiKey}&type=TOKEN_TRANSFER&limit=${limit}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const transactions = await response.json();
        const transfers: TokenTransfer[] = [];
        
        for (const tx of transactions) {
          if (tx.tokenTransfers) {
            for (const transfer of tx.tokenTransfers) {
              if (transfer.mint === tokenMint) {
                transfers.push({
                  signature: tx.signature,
                  blockTime: tx.timestamp || tx.blockTime,
                  timestamp: new Date((tx.timestamp || tx.blockTime) * 1000),
                  fromAddress: transfer.fromUserAccount,
                  toAddress: transfer.toUserAccount,
                  amount: transfer.tokenAmount,
                  uiAmount: transfer.tokenAmount / Math.pow(10, token.decimals),
                  fromName: undefined,
                  toName: undefined
                });
              }
            }
          }
          
          if (transfers.length >= limit) break;
        }
        
        if (transfers.length > 0) {
          setCachedData(cacheKey, transfers, TOKEN_CACHE_DURATION);
          return transfers;
        }
      }
    } catch (heliusError) {
      console.warn('Helius transfers API error:', heliusError);
    }
    
    // Fallback to mock data
    const mockTransfers = getTemporaryTokenTransfers(tokenMint, limit);
    setCachedData(cacheKey, mockTransfers, TOKEN_CACHE_DURATION);
    return mockTransfers;
    
  } catch (error) {
    console.error('Error fetching token transfers:', error);
    showError('Failed to fetch token transfers');
    return getTemporaryTokenTransfers(tokenMint, limit);
  }
}

/**
 * Fallback tokens for when APIs fail
 */
function getFallbackTokens(): TokenListItem[] {
  return [
    {
      address: 'So11111111111111111111111111111111111111112',
      name: 'Wrapped SOL',
      symbol: 'SOL',
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      price: 100,
      volume24h: 500000000,
      tags: ['verified', 'strict'],
      daily_volume: 500000000,
      mint: 'So11111111111111111111111111111111111111112',
      logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    },
    {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USD Coin',
      symbol: 'USDC',
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      price: 1,
      volume24h: 250000000,
      tags: ['verified', 'strict'],
      daily_volume: 250000000,
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
    },
    {
      address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      name: 'Jupiter',
      symbol: 'JUP',
      logoURI: 'https://static.jup.ag/jup/icon.png',
      price: 1.08,
      volume24h: 80000000,
      tags: ['verified', 'strict', 'community'],
      daily_volume: 80000000,
      mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      logoUrl: 'https://static.jup.ag/jup/icon.png'
    }
  ];
}

/**
 * Mock data functions (unchanged from original)
 */
function getTemporaryTokenHolders(tokenMint: string, limit: number): TokenHolder[] {
  const mockHolders: TokenHolder[] = [];
  const seed = tokenMint.substring(0, 8);
  let totalSupply = 1000000000000;
  
  for (let i = 0; i < limit; i++) {
    const hex = (parseInt(seed, 16) + i * 12345).toString(16).padStart(8, '0');
    const address = `${hex}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    const percentage = 15 / (i + 1);
    const amount = totalSupply * (percentage / 100);
    
    let ownerType: string | undefined;
    let name: string | undefined;
    
    if (i === 0) {
      ownerType = 'Exchange';
      name = 'Binance Hot Wallet';
    } else if (i === 1) {
      ownerType = 'Exchange';
      name = 'FTX Hot Wallet';
    } else if (i === 2) {
      ownerType = 'Protocol';
      name = 'Jupiter Aggregator';
    } else if (i < 5) {
      ownerType = Math.random() > 0.5 ? 'Protocol' : 'Exchange';
    } else {
      ownerType = Math.random() > 0.7 ? 'User' : undefined;
    }
    
    mockHolders.push({
      address,
      amount: Math.floor(amount),
      uiAmount: amount / 1000000000,
      percentage,
      ownerType,
      name
    });
  }
  
  return mockHolders;
}

function getTemporaryTokenTransfers(tokenMint: string, limit: number): TokenTransfer[] {
  const mockTransfers: TokenTransfer[] = [];
  const seed = tokenMint.substring(0, 8);
  
  for (let i = 0; i < limit; i++) {
    const blockTime = Math.floor(Date.now() / 1000) - (i * 1200);
    const amount = Math.floor(Math.random() * 1000000000) + 10000000;
    
    const fromHex = (parseInt(seed, 16) + i * 12345).toString(16).padStart(8, '0');
    const toHex = (parseInt(seed, 16) + (i + 1) * 67890).toString(16).padStart(8, '0');
    
    const fromAddress = `${fromHex}${Math.random().toString(36).substring(2, 10)}`;
    const toAddress = `${toHex}${Math.random().toString(36).substring(2, 10)}`;
    
    const fromName = i % 7 === 0 ? 'Binance' : (i % 11 === 0 ? 'FTX' : undefined);
    const toName = i % 5 === 0 ? 'Jupiter' : (i % 9 === 0 ? 'Raydium' : undefined);
    
    mockTransfers.push({
      signature: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      blockTime,
      timestamp: new Date(blockTime * 1000),
      fromAddress,
      toAddress,
      amount,
      uiAmount: amount / 1000000000,
      fromName,
      toName
    });
  }
  
  return mockTransfers;
}

function inferOwnerType(address: string): string | undefined {
  return Math.random() > 0.7 ? (Math.random() > 0.5 ? 'Exchange' : 'Protocol') : 'User';
}