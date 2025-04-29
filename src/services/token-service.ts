import { Token, TokenMetrics, TokenHolder, TokenTransfer, TokenListItem } from '../types/token';
import { getHeliusApiKey } from '../lib/utils/env';
import { showError, showInfo } from '../lib/utils/notifications';
import { PublicKey } from '@solana/web3.js';

// Cache to store token data
const tokenCache = new Map<string, any>();
const TOKEN_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Get list of top tokens on Solana using Jupiter API
 */
export async function getTopTokens(limit: number = 50): Promise<TokenListItem[]> {
  try {
    // Check cache first
    const cacheKey = `top-tokens-${limit}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Fetch tokens from Jupiter's more reliable 'all' endpoint
    const response = await fetch('https://token.jup.ag/all');
    
    if (!response.ok) {
      throw new Error(`Jupiter API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Jupiter API raw response type:', typeof data, Array.isArray(data) ? 'array' : 'not array'); // Debug log
    
    if (!data) {
      throw new Error('Invalid data format from Jupiter API');
    }
    
    // Transform Jupiter data to our token list format
    const tokens: TokenListItem[] = [];
    
    // Jupiter's 'all' endpoint returns an array
    if (Array.isArray(data)) {
      for (const tokenData of data) {
        if (tokens.length >= limit) break;
        
        // Only include tokens with basic data
        if (tokenData && tokenData.address && tokenData.symbol && tokenData.name) {
          tokens.push({
            mint: tokenData.address,
            name: tokenData.name,
            symbol: tokenData.symbol,
            logoUrl: tokenData.logoURI,
            // We don't have price data from Jupiter, will be fetched separately
            price: undefined,
            priceChange24h: undefined,
            volume24h: undefined,
            marketCap: undefined
          });
        }
      }
    } else {
      // Fallback in case the API returns the object format
      for (const [mint, tokenData] of Object.entries(data)) {
        if (tokens.length >= limit) break;
        
        if (tokenData && typeof tokenData === 'object' && 'symbol' in tokenData && 'name' in tokenData) {
          tokens.push({
            mint: mint,
            name: tokenData.name as string,
            symbol: tokenData.symbol as string,
            logoUrl: (tokenData as any).logoURI,
            price: undefined,
            priceChange24h: undefined,
            volume24h: undefined,
            marketCap: undefined
          });
        }
      }
    }
    
    // Log the count of tokens we found
    console.log(`Found ${tokens.length} tokens from Jupiter API`);
    
    // Try to enrich with price data from CoinGecko
    try {
      await enrichTokensWithPriceData(tokens);
    } catch (priceError) {
      console.warn('Could not enrich tokens with price data:', priceError);
    }
    
    // Cache the result
    setCachedData(cacheKey, tokens, TOKEN_CACHE_DURATION);
    
    // Return the tokens we found, or fallback data if none
    if (tokens.length > 0) {
      return tokens;
    }
    
    throw new Error('No valid tokens found in Jupiter API response');
  } catch (error) {
    console.error('Error fetching top tokens:', error);
    showError('Failed to fetch top tokens');
    
    // Return a few default tokens so the UI has something to show
    return [
      {
        mint: 'So11111111111111111111111111111111111111112',
        name: 'Wrapped SOL',
        symbol: 'SOL',
        logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        price: 100,
        priceChange24h: 2.5,
        volume24h: 500000000,
        marketCap: 40000000000
      },
      {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        name: 'USD Coin',
        symbol: 'USDC',
        logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        price: 1,
        priceChange24h: 0,
        volume24h: 250000000,
        marketCap: 30000000000
      },
      {
        mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        name: 'USDT',
        symbol: 'USDT',
        logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
        price: 1,
        priceChange24h: 0.01,
        volume24h: 300000000,
        marketCap: 29000000000
      },
      {
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        name: 'BONK',
        symbol: 'BONK',
        logoUrl: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
        price: 0.00001,
        priceChange24h: 5.2,
        volume24h: 15000000,
        marketCap: 500000000
      },
      {
        mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
        name: 'Marinade staked SOL',
        symbol: 'mSOL',
        logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
        price: 120,
        priceChange24h: 2.8,
        volume24h: 8500000,
        marketCap: 1200000000
      }
    ];
  }
}

/**
 * Enrich token list with price data from CoinGecko
 */
async function enrichTokensWithPriceData(tokens: TokenListItem[]): Promise<void> {
  // Use CoinGecko API to get price data for popular Solana tokens
  // Note: This is a free API with rate limits
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=solana,bonk,jupiter,serum,raydium,render-token,samoyedcoin,sushi,usd-coin,tether&per_page=100'
  );
  
  if (!response.ok) {
    throw new Error(`CoinGecko API request failed with status ${response.status}`);
  }
  
  const priceData = await response.json();
  
  // Map of token symbols (lowercase) to price data
  const priceMap = new Map();
  
  priceData.forEach((coin: any) => {
    priceMap.set(coin.symbol.toLowerCase(), {
      price: coin.current_price,
      priceChange24h: coin.price_change_percentage_24h,
      volume24h: coin.total_volume,
      marketCap: coin.market_cap
    });
  });
  
  // Update tokens with price data where available
  tokens.forEach(token => {
    const priceInfo = priceMap.get(token.symbol.toLowerCase());
    if (priceInfo) {
      token.price = priceInfo.price;
      token.priceChange24h = priceInfo.priceChange24h;
      token.volume24h = priceInfo.volume24h;
      token.marketCap = priceInfo.marketCap;
    }
  });
}

/**
 * Get information for known tokens to avoid API calls when possible
 */
function getKnownTokenInfo(tokenMint: string): Token | null {
  const knownTokens: Record<string, Token> = {
    'So11111111111111111111111111111111111111112': {
      mint: 'So11111111111111111111111111111111111111112',
      name: 'Wrapped SOL',
      symbol: 'SOL',
      decimals: 9,
      supply: 1000000000000000,
      logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      description: 'Wrapped SOL (SOL) is the native token of the Solana blockchain.',
      website: 'https://solana.com',
      twitter: 'https://twitter.com/solana',
      coingeckoId: 'wrapped-solana'
    },
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      supply: 10000000000000000,
      logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      description: 'USDC is a fully collateralized US dollar stablecoin developed by Circle.',
      website: 'https://www.circle.com/usdc',
      twitter: 'https://twitter.com/circle',
      coingeckoId: 'usd-coin'
    },
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
      mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      name: 'USDT',
      symbol: 'USDT',
      decimals: 6,
      supply: 10000000000000000,
      logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
      description: 'Tether gives you the joint benefits of open blockchain technology and traditional currency by converting your cash into a stable digital currency equivalent.',
      website: 'https://tether.to',
      twitter: 'https://twitter.com/Tether_to',
      coingeckoId: 'tether'
    },
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': {
      mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      name: 'Bonk',
      symbol: 'Bonk',
      decimals: 5,
      supply: 55000000000000,
      logoUrl: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I?ext=png',
      description: 'BONK is the first Solana dog coin for the people, by the people.',
      website: 'https://bonkcoin.com',
      twitter: 'https://twitter.com/bonk_inu',
      coingeckoId: 'bonk'
    },
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': {
      mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
      name: 'Marinade staked SOL',
      symbol: 'mSOL',
      decimals: 9,
      supply: 1000000000000,
      logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
      description: 'Marinade staked SOL (mSOL) is a liquid staking derivative of SOL, created by Marinade Finance.',
      website: 'https://marinade.finance',
      twitter: 'https://twitter.com/MarinadeFinance',
      coingeckoId: 'msol'
    },
    'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': {
      mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      name: 'Jupiter',
      symbol: 'JUP',
      decimals: 6,
      supply: 10000000000000,
      logoUrl: 'https://static.jup.ag/jup/icon.png',
      description: 'Jupiter is the key liquidity aggregator for Solana, offering the widest range of tokens and best route discovery between any token pair.',
      website: 'https://jup.ag',
      twitter: 'https://twitter.com/JupiterExchange',
      coingeckoId: 'jupiter-exchange-solana'
    }
  };
  
  return knownTokens[tokenMint] || null;
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
    
    // Check for common tokens first to avoid API calls
    const knownToken = getKnownTokenInfo(tokenMint);
    if (knownToken) {
      // Cache the result
      setCachedData(cacheKey, knownToken, TOKEN_CACHE_DURATION);
      return knownToken;
    }
    
    // Use Helius API to get token metadata
    const apiKey = getHeliusApiKey();
    if (!apiKey) {
      console.error('Helius API key is not configured');
      return null;
    }

    // Fetch token metadata from Helius
    const url = `https://api.helius.xyz/v0/tokens/metadata?api-key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mintAccounts: [tokenMint]
      })
    });
    
    if (!response.ok) {
      // If we get rate limited, try to return known token info or throw an error
      if (response.status === 429) {
        console.warn('Helius API rate limited. Returning fallback data if available.');
        const fallbackToken = getKnownTokenInfo(tokenMint);
        if (fallbackToken) {
          // Cache the fallback result
          setCachedData(cacheKey, fallbackToken, TOKEN_CACHE_DURATION);
          return fallbackToken;
        }
      }
      throw new Error(`Helius API request failed with status ${response.status}`);
    }
    
    const metadataResult = await response.json();
    console.log('Token metadata from Helius:', metadataResult); // Debug log
    
    if (!metadataResult || !Array.isArray(metadataResult) || metadataResult.length === 0) {
      throw new Error('Invalid or empty response from Helius API');
    }
    
    const metadata = metadataResult[0];
    
    // Format response to our Token type
    const token: Token = {
      mint: tokenMint,
      name: metadata.onChainMetadata?.metadata?.data?.name || metadata.name || 'Unknown Token',
      symbol: metadata.symbol || 'UNKNOWN',
      decimals: metadata.decimals || 9,
      supply: parseFloat(metadata.supply) || 0,
      logoUrl: metadata.logoURI || undefined,
      description: metadata.description || undefined,
      website: metadata.extensions?.website || undefined,
      twitter: metadata.extensions?.twitter ? `https://twitter.com/${metadata.extensions.twitter}` : undefined,
      coingeckoId: metadata.extensions?.coingeckoId || undefined
    };
    
    // Cache the result
    setCachedData(cacheKey, token, TOKEN_CACHE_DURATION);
    
    return token;
  } catch (error) {
    console.error('Error fetching token info:', error);
    showError('Failed to fetch token information');
    
    // Check for known token as a last resort
    return getKnownTokenInfo(tokenMint);
  }
}

/**
 * Get token metrics like price, volume, etc.
 */
export async function getTokenMetrics(tokenMint: string): Promise<TokenMetrics | null> {
  try {
    // Check cache first
    const cacheKey = `token-metrics-${tokenMint}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // Get token info first to get symbol and other details
    const token = await getTokenInfo(tokenMint);
    if (!token) {
      return null;
    }
    
    // Default metrics
    const metrics: TokenMetrics = {
      holders: await getTokenHoldersCount(tokenMint)
    };
    
    // Try to get price data from CoinGecko
    try {
      if (token.coingeckoId) {
        // If we have a CoinGecko ID, we can get precise data
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${token.coingeckoId}?localization=false&tickers=false&community_data=false&developer_data=false`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          metrics.price = data.market_data?.current_price?.usd;
          metrics.priceChange24h = data.market_data?.price_change_percentage_24h;
          metrics.volume24h = data.market_data?.total_volume?.usd;
          metrics.marketCap = data.market_data?.market_cap?.usd;
          
          // If we have a creation date, convert it to a Date object
          if (data.genesis_date) {
            metrics.createdAt = new Date(data.genesis_date);
          }
        }
      } else {
        // If we don't have a CoinGecko ID, try to search by symbol
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${token.symbol.toLowerCase()}`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.length > 0) {
            metrics.price = data[0].current_price;
            metrics.priceChange24h = data[0].price_change_percentage_24h;
            metrics.volume24h = data[0].total_volume;
            metrics.marketCap = data[0].market_cap;
          }
        }
      }
    } catch (priceError) {
      console.warn('Could not fetch price data from CoinGecko:', priceError);
    }
    
    // Get transaction count for the token in the last 24h using Helius
    try {
      const transactions24h = await getTokenTransactionCount(tokenMint, 24);
      metrics.transactions24h = transactions24h;
    } catch (txError) {
      console.warn('Could not fetch transaction count:', txError);
    }
    
    // Cache the result
    setCachedData(cacheKey, metrics, TOKEN_CACHE_DURATION);
    
    return metrics;
  } catch (error) {
    console.error('Error fetching token metrics:', error);
    showError('Failed to fetch token metrics');
    
    // Provide fallback metrics for common tokens
    if (tokenMint === 'So11111111111111111111111111111111111111112') { // SOL
      return {
        price: 100,
        priceChange24h: 2.5,
        volume24h: 500000000,
        marketCap: 40000000000,
        holders: 1500000,
        transactions24h: 50000,
        dailyActiveUsers: 80000
      };
    } else if (tokenMint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') { // USDC
      return {
        price: 1,
        priceChange24h: 0,
        volume24h: 250000000,
        marketCap: 30000000000,
        holders: 2000000,
        transactions24h: 120000,
        dailyActiveUsers: 150000
      };
    }
    
    return null;
  }
}

/**
 * Count transactions involving a token in the last N hours
 */
async function getTokenTransactionCount(tokenMint: string, hours: number): Promise<number> {
  const apiKey = getHeliusApiKey();
  if (!apiKey) {
    throw new Error('Helius API key is not configured');
  }
  
  // Calculate time window
  const endTime = Math.floor(Date.now() / 1000);
  const startTime = endTime - (hours * 60 * 60);
  
  // Use Solana blockchain data API from Helius
  const url = `https://api.helius.xyz/v0/addresses/${tokenMint}/transactions?api-key=${apiKey}&type=TOKEN_TRANSFER&until=${endTime}&since=${startTime}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  
  const data = await response.json();
  
  return Array.isArray(data) ? data.length : 0;
}

/**
 * Get count of token holders
 */
async function getTokenHoldersCount(tokenMint: string): Promise<number | undefined> {
  const apiKey = getHeliusApiKey();
  if (!apiKey) {
    return undefined;
  }
  
  try {
    // This is a hypothetical endpoint - adjust based on what Helius offers
    const url = `https://api.helius.xyz/v0/tokens/${tokenMint}/holders-count?api-key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // If this endpoint doesn't exist or returns an error, we'll return undefined
      return undefined;
    }
    
    const data = await response.json();
    return data.count || undefined;
  } catch (error) {
    console.warn('Could not fetch holder count:', error);
    return undefined;
  }
}

/**
 * Get list of token holders
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
      console.error('Helius API key is not configured');
      return getTemporaryTokenHolders(tokenMint, limit);
    }
    
    // Get token info first to get decimals
    // This might fail if rate limited, so we need to handle that
    let token: Token | null;
    try {
      token = await getTokenInfo(tokenMint);
      if (!token) {
        return getTemporaryTokenHolders(tokenMint, limit);
      }
    } catch (tokenError) {
      console.warn('Error getting token info for holders:', tokenError);
      return getTemporaryTokenHolders(tokenMint, limit);
    }
    
    // Fetch token holders using Helius API
    // Note: Adjust this endpoint based on what Helius offers
    const url = `https://api.helius.xyz/v0/tokens/${tokenMint}/largest-accounts?api-key=${apiKey}&limit=${limit}`;
    
    const response = await fetch(url);
    
    // If the API doesn't support this endpoint or we hit a rate limit, use mock data
    if (!response.ok) {
      console.warn(`Helius API request failed with status ${response.status}. Using temporary mock data.`);
      return getTemporaryTokenHolders(tokenMint, limit);
    }
    
    const data = await response.json();
    
    // Transform to our format
    const holders: TokenHolder[] = data.map((holder: any) => ({
      address: holder.address,
      amount: holder.amount,
      uiAmount: holder.amount / Math.pow(10, token.decimals),
      percentage: holder.percentage,
      ownerType: inferOwnerType(holder.address),
      name: holder.name
    }));
    
    // Cache the result
    setCachedData(cacheKey, holders, TOKEN_CACHE_DURATION);
    
    return holders;
  } catch (error) {
    console.error('Error fetching token holders:', error);
    showError('Failed to fetch token holders');
    
    // Return temporary data for demonstration
    return getTemporaryTokenHolders(tokenMint, limit);
  }
}

/**
 * Provide temporary token holder data for demonstration
 * This can be removed once the real API endpoint is available
 */
function getTemporaryTokenHolders(tokenMint: string, limit: number): TokenHolder[] {
  // Use consistent addresses based on the token mint
  const seed = tokenMint.substring(0, 8);
  const mockHolders: TokenHolder[] = [];
  
  let totalSupply = 1000000000000; // Placeholder for total supply
  
  for (let i = 0; i < limit; i++) {
    const hex = (parseInt(seed, 16) + i * 12345).toString(16).padStart(8, '0');
    const address = `${hex}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    // Decrease amounts logarithmically to simulate realistic distribution
    const percentage = 15 / (i + 1);
    const amount = totalSupply * (percentage / 100);
    
    // Assign known types to first few holders
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
      uiAmount: amount / 1000000000, // Assuming 9 decimals
      percentage,
      ownerType,
      name
    });
  }
  
  return mockHolders;
}

/**
 * Infer owner type from address (placeholder implementation)
 */
function inferOwnerType(address: string): string | undefined {
  // This would normally use a database of known addresses
  // For now, just return undefined or a random type
  return Math.random() > 0.7 ? (Math.random() > 0.5 ? 'Exchange' : 'Protocol') : 'User';
}

/**
 * Get recent token transfers
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
      console.error('Helius API key is not configured');
      return getTemporaryTokenTransfers(tokenMint, limit);
    }
    
    // Get token info first to get decimals
    // This might fail if rate limited, so we need to handle that
    let token: Token | null;
    try {
      token = await getTokenInfo(tokenMint);
      if (!token) {
        return getTemporaryTokenTransfers(tokenMint, limit);
      }
    } catch (tokenError) {
      console.warn('Error getting token info for transfers:', tokenError);
      return getTemporaryTokenTransfers(tokenMint, limit);
    }
    
    // Use Helius API to get token transfers
    const url = `https://api.helius.xyz/v0/addresses/${tokenMint}/transactions?api-key=${apiKey}&type=TOKEN_TRANSFER&limit=${limit}`;
    
    const response = await fetch(url);
    
    // If we hit a rate limit or the API fails, use mock data
    if (!response.ok) {
      console.warn(`Helius API request failed with status ${response.status}. Using temporary mock data.`);
      return getTemporaryTokenTransfers(tokenMint, limit);
    }
    
    const transactions = await response.json();
    
    if (!transactions || !Array.isArray(transactions)) {
      throw new Error('Invalid data format from API');
    }
    
    // Extract token transfers from transactions
    const transfers: TokenTransfer[] = [];
    
    for (const tx of transactions) {
      // Extract token transfers from transaction
      if (tx.tokenTransfers) {
        for (const transfer of tx.tokenTransfers) {
          // Only include transfers for this token
          if (transfer.mint === tokenMint) {
            transfers.push({
              signature: tx.signature,
              blockTime: tx.timestamp || tx.blockTime,
              timestamp: new Date((tx.timestamp || tx.blockTime) * 1000),
              fromAddress: transfer.fromUserAccount,
              toAddress: transfer.toUserAccount,
              amount: transfer.tokenAmount,
              uiAmount: transfer.tokenAmount / Math.pow(10, token.decimals),
              fromName: undefined, // Would come from a name service
              toName: undefined // Would come from a name service
            });
          }
        }
      }
      
      // Stop once we have enough transfers
      if (transfers.length >= limit) {
        break;
      }
    }
    
    // If we didn't get any transfers, use temporary data
    if (transfers.length === 0) {
      console.warn('No transfers found for this token, using temporary mock data');
      return getTemporaryTokenTransfers(tokenMint, limit);
    }
    
    // Cache the result
    setCachedData(cacheKey, transfers, TOKEN_CACHE_DURATION);
    
    return transfers;
  } catch (error) {
    console.error('Error fetching token transfers:', error);
    showError('Failed to fetch token transfers');
    
    // Return temporary data for demonstration
    return getTemporaryTokenTransfers(tokenMint, limit);
  }
}

/**
 * Provide temporary token transfer data for demonstration
 * This can be removed once the real API endpoint is available
 */
function getTemporaryTokenTransfers(tokenMint: string, limit: number): TokenTransfer[] {
  const mockTransfers: TokenTransfer[] = [];
  
  // Use consistent addresses based on the token mint
  const seed = tokenMint.substring(0, 8);
  
  for (let i = 0; i < limit; i++) {
    const blockTime = Math.floor(Date.now() / 1000) - (i * 1200); // Every 20 minutes
    const amount = Math.floor(Math.random() * 1000000000) + 10000000;
    
    // Create consistent but different addresses based on the token mint and index
    const fromHex = (parseInt(seed, 16) + i * 12345).toString(16).padStart(8, '0');
    const toHex = (parseInt(seed, 16) + (i + 1) * 67890).toString(16).padStart(8, '0');
    
    const fromAddress = `${fromHex}${Math.random().toString(36).substring(2, 10)}`;
    const toAddress = `${toHex}${Math.random().toString(36).substring(2, 10)}`;
    
    // Occasionally add names for known addresses
    const fromName = i % 7 === 0 ? 'Binance' : (i % 11 === 0 ? 'FTX' : undefined);
    const toName = i % 5 === 0 ? 'Jupiter' : (i % 9 === 0 ? 'Raydium' : undefined);
    
    mockTransfers.push({
      signature: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      blockTime,
      timestamp: new Date(blockTime * 1000),
      fromAddress,
      toAddress,
      amount,
      uiAmount: amount / 1000000000, // Assuming 9 decimals
      fromName,
      toName
    });
  }
  
  return mockTransfers;
}

/**
 * Cache utility functions
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