import { Token, TokenMetrics, TokenHolder, TokenTransfer, TokenListItem } from '../types/token';
import { getHeliusApiKey } from '../lib/utils/env';
import { showError } from '../lib/utils/notifications';
import { PublicKey } from '@solana/web3.js';

// Helper function for API calls
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Get list of top tokens on Solana
 */
export async function getTopTokens(limit: number = 50): Promise<TokenListItem[]> {
  try {
    const apiKey = getHeliusApiKey();
    if (!apiKey) {
      console.error('Helius API key is not configured');
      return [];
    }
    
    // This is a hypothetical endpoint - you may need to adjust based on what Helius offers
    // or use another service like CoinGecko or Jupiter API for token list
    const url = `https://api.helius.xyz/v0/tokens/top?api-key=${apiKey}&limit=${limit}`;
    
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching top tokens:', error);
    showError('Failed to fetch top tokens');
    
    // For development, return some mock data so UI development can proceed
    return getMockTopTokens(limit);
  }
}

/**
 * Get detailed information about a specific token
 */
export async function getTokenInfo(tokenMint: string): Promise<Token | null> {
  try {
    const apiKey = getHeliusApiKey();
    if (!apiKey) {
      console.error('Helius API key is not configured');
      return null;
    }
    
    // Validate the token mint address format
    try {
      new PublicKey(tokenMint);
    } catch (e) {
      console.error('Invalid token mint address format:', tokenMint);
      return null;
    }
    
    // This is a hypothetical endpoint - you may need to adjust
    const url = `https://api.helius.xyz/v0/tokens/${tokenMint}?api-key=${apiKey}`;
    
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error('Error fetching token info:', error);
    showError('Failed to fetch token information');
    
    // Return mock data for development
    return getMockTokenInfo(tokenMint);
  }
}

/**
 * Get token metrics like price, volume, etc.
 */
export async function getTokenMetrics(tokenMint: string): Promise<TokenMetrics | null> {
  try {
    const apiKey = getHeliusApiKey();
    if (!apiKey) {
      console.error('Helius API key is not configured');
      return null;
    }
    
    // This is a hypothetical endpoint
    const url = `https://api.helius.xyz/v0/tokens/${tokenMint}/metrics?api-key=${apiKey}`;
    
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error('Error fetching token metrics:', error);
    showError('Failed to fetch token metrics');
    
    // Return mock data for development
    return getMockTokenMetrics(tokenMint);
  }
}

/**
 * Get list of token holders
 */
export async function getTokenHolders(tokenMint: string, limit: number = 50): Promise<TokenHolder[]> {
  try {
    const apiKey = getHeliusApiKey();
    if (!apiKey) {
      console.error('Helius API key is not configured');
      return [];
    }
    
    // This is a hypothetical endpoint
    const url = `https://api.helius.xyz/v0/tokens/${tokenMint}/holders?api-key=${apiKey}&limit=${limit}`;
    
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching token holders:', error);
    showError('Failed to fetch token holders');
    
    // Return mock data for development
    return getMockTokenHolders(tokenMint, limit);
  }
}

/**
 * Get recent token transfers
 */
export async function getTokenTransfers(tokenMint: string, limit: number = 50): Promise<TokenTransfer[]> {
  try {
    const apiKey = getHeliusApiKey();
    if (!apiKey) {
      console.error('Helius API key is not configured');
      return [];
    }
    
    // This is a hypothetical endpoint
    const url = `https://api.helius.xyz/v0/tokens/${tokenMint}/transfers?api-key=${apiKey}&limit=${limit}`;
    
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Convert blockTime to Date objects
    return data.map((transfer: any) => ({
      ...transfer,
      timestamp: new Date(transfer.blockTime * 1000)
    })) || [];
  } catch (error) {
    console.error('Error fetching token transfers:', error);
    showError('Failed to fetch token transfers');
    
    // Return mock data for development
    return getMockTokenTransfers(tokenMint, limit);
  }
}

// Mock data generators for development
function getMockTopTokens(limit: number): TokenListItem[] {
  const mockTokens: TokenListItem[] = [
    {
      mint: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      name: 'Samoyed Coin',
      symbol: 'SAMO',
      logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU/logo.png',
      price: 0.0056,
      priceChange24h: 5.2,
      volume24h: 1200000,
      marketCap: 20000000
    },
    {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USD Coin',
      symbol: 'USDC',
      logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      price: 1.0,
      priceChange24h: 0.01,
      volume24h: 350000000,
      marketCap: 45000000000
    },
    {
      mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      name: 'USDT',
      symbol: 'USDT',
      logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
      price: 1.0,
      priceChange24h: -0.02,
      volume24h: 320000000,
      marketCap: 42000000000
    },
    {
      mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      name: 'Bonk',
      symbol: 'BONK',
      logoUrl: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
      price: 0.00000012,
      priceChange24h: 12.5,
      volume24h: 8500000,
      marketCap: 78000000
    },
    {
      mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
      name: 'Marinade staked SOL',
      symbol: 'mSOL',
      logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
      price: 62.5,
      priceChange24h: 2.1,
      volume24h: 4500000,
      marketCap: 380000000
    }
  ];
  
  return mockTokens.slice(0, limit);
}

function getMockTokenInfo(tokenMint: string): Token {
  // Default mock token
  let token: Token = {
    mint: tokenMint,
    name: 'Unknown Token',
    symbol: 'UNKNOWN',
    decimals: 9,
    supply: 1000000000000,
    logoUrl: 'https://via.placeholder.com/150',
    description: 'This is a mock token for development purposes.',
    website: 'https://solana.com',
    twitter: 'https://twitter.com/solana',
  };
  
  // Return known token info for common tokens
  if (tokenMint === '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU') {
    token = {
      mint: tokenMint,
      name: 'Samoyed Coin',
      symbol: 'SAMO',
      decimals: 9,
      supply: 5000000000,
      logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU/logo.png',
      description: 'Samoyed Coin (SAMO) is a memecoin on Solana.',
      website: 'https://samoyedcoin.com',
      twitter: 'https://twitter.com/samoyedcoin',
      coingeckoId: 'samoyedcoin',
    };
  } else if (tokenMint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') {
    token = {
      mint: tokenMint,
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      supply: 45000000000,
      logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      description: 'USDC is a fully collateralized US dollar stablecoin.',
      website: 'https://www.circle.com/usdc',
      twitter: 'https://twitter.com/circle',
      coingeckoId: 'usd-coin',
    };
  }
  
  return token;
}

function getMockTokenMetrics(tokenMint: string): TokenMetrics {
  // Default metrics
  let metrics: TokenMetrics = {
    price: 0.01,
    priceChange24h: 1.2,
    volume24h: 1000000,
    marketCap: 10000000,
    holders: 5000,
    transactions24h: 1200,
    createdAt: new Date('2022-01-01T00:00:00Z'),
    tvl: 500000,
    dailyActiveUsers: 800,
  };
  
  // Return known metrics for common tokens
  if (tokenMint === '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU') { // SAMO
    metrics = {
      price: 0.0056,
      priceChange24h: 5.2,
      volume24h: 1200000,
      marketCap: 20000000,
      holders: 120000,
      transactions24h: 5600,
      createdAt: new Date('2021-04-15T00:00:00Z'),
      tvl: 2500000,
      dailyActiveUsers: 3200,
    };
  } else if (tokenMint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') { // USDC
    metrics = {
      price: 1.0,
      priceChange24h: 0.01,
      volume24h: 350000000,
      marketCap: 45000000000,
      holders: 2500000,
      transactions24h: 185000,
      createdAt: new Date('2020-03-18T00:00:00Z'),
      tvl: 15000000000,
      dailyActiveUsers: 450000,
    };
  }
  
  return metrics;
}

function getMockTokenHolders(tokenMint: string, limit: number): TokenHolder[] {
  const mockHolders: TokenHolder[] = [
    {
      address: '3xxDCjN8s6MgNu8GQnWwJGCTVzMC9Pcy76TkPgHPistt',
      amount: 50000000000,
      uiAmount: 50000,
      percentage: 10.5,
      ownerType: 'Exchange',
      name: 'Binance Hot Wallet'
    },
    {
      address: '8PBx6WQ3cjyzgycLG1GF5UfUDYAwvgXgYet1SNM4hx2q',
      amount: 35000000000,
      uiAmount: 35000,
      percentage: 7.2,
      ownerType: 'Exchange',
      name: 'FTX Hot Wallet'
    },
    {
      address: 'DdASbtHBGwPRNXZ7RA7JLCvRQMQtTYnxF1hrszGgvkTt',
      amount: 27500000000,
      uiAmount: 27500,
      percentage: 5.8,
      ownerType: 'Protocol',
      name: 'Jupiter Aggregator'
    },
    {
      address: 'F6xJ5LfbZd1SeBgLYzEf8Qmxo4JEYgRXNHfzeZWYtUNw',
      amount: 20000000000,
      uiAmount: 20000,
      percentage: 4.2,
      ownerType: 'User'
    },
    {
      address: 'Hf84mVvFMQ6y3ufRD6J7bWSNJtEZHaP2kPs7i8qt9LS7',
      amount: 18500000000,
      uiAmount: 18500,
      percentage: 3.9,
      ownerType: 'User'
    },
  ];
  
  // Generate more mock holders if needed
  if (limit > mockHolders.length) {
    for (let i = mockHolders.length; i < limit; i++) {
      const randAmount = Math.floor(Math.random() * 10000000000) + 1000000000;
      const randPercent = (randAmount / 500000000000) * 100;
      
      mockHolders.push({
        address: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        amount: randAmount,
        uiAmount: randAmount / 1000000000,
        percentage: randPercent,
        ownerType: Math.random() > 0.7 ? 'User' : (Math.random() > 0.5 ? 'Exchange' : 'Protocol')
      });
    }
  }
  
  return mockHolders.slice(0, limit);
}

function getMockTokenTransfers(tokenMint: string, limit: number): TokenTransfer[] {
  const mockTransfers: TokenTransfer[] = [];
  
  // Generate mock transfers
  for (let i = 0; i < limit; i++) {
    const blockTime = Math.floor(Date.now() / 1000) - (i * 1200); // Every 20 minutes
    const amount = Math.floor(Math.random() * 1000000000) + 10000000;
    
    // Create from and to addresses with random strings
    const fromAddress = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const toAddress = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    // Occasionally add names for known addresses
    const fromName = Math.random() > 0.8 ? (Math.random() > 0.5 ? 'Binance' : 'FTX') : undefined;
    const toName = Math.random() > 0.8 ? (Math.random() > 0.5 ? 'Jupiter' : 'Raydium') : undefined;
    
    mockTransfers.push({
      signature: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      blockTime,
      timestamp: new Date(blockTime * 1000),
      fromAddress,
      toAddress,
      amount,
      uiAmount: amount / 1000000000, // Convert to UI amount based on 9 decimals
      fromName,
      toName
    });
  }
  
  return mockTransfers;
}