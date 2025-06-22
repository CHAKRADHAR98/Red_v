// src/hooks/useTokenData.ts - Updated to use Jupiter APIs

import { useQuery } from '@tanstack/react-query';
import { Token, TokenMetrics, TokenHolder, TokenTransfer } from '../types/token';
import { getTokenInfo, getTokenHolders, getTokenTransfers, getTokenMetrics } from '../services/token-service';
import { showError } from '../lib/utils/notifications';
import { PublicKey } from '@solana/web3.js';

export function useTokenData(tokenMint: string | null) {
  // Only enable queries if we have a valid token mint
  const isValidTokenMint = !!tokenMint && tokenMint.trim() !== '';
  
  // Validate token mint format
  let isValidFormat = false;
  if (isValidTokenMint) {
    try {
      new PublicKey(tokenMint);
      isValidFormat = true;
    } catch (e) {
      console.warn('Invalid token mint format provided to useTokenData:', tokenMint);
      isValidFormat = false;
    }
  }

  // Fetch token basic info using Jupiter API
  const tokenQuery = useQuery({
    queryKey: ['token', tokenMint],
    queryFn: async () => {
      if (!tokenMint) return null;
      
      try {
        console.log(`Fetching token info for: ${tokenMint}`);
        const tokenInfo = await getTokenInfo(tokenMint);
        
        if (!tokenInfo) {
          console.warn(`No token information found for: ${tokenMint}`);
          return null;
        }
        
        console.log(`Successfully fetched token info:`, tokenInfo);
        return tokenInfo;
      } catch (error) {
        console.error('Error in tokenQuery:', error);
        showError('Failed to fetch token information');
        throw error; // Re-throw to trigger query error state
      }
    },
    enabled: isValidTokenMint && isValidFormat,
    retry: (failureCount, error) => {
      // Don't retry for validation errors
      if (error instanceof Error && error.message.includes('Invalid')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime)
  });
  
  // Fetch token metrics with Jupiter price data
  const metricsQuery = useQuery({
    queryKey: ['tokenMetrics', tokenMint],
    queryFn: async () => {
      if (!tokenMint) return null;
      
      try {
        console.log(`Fetching token metrics for: ${tokenMint}`);
        const metrics = await getTokenMetrics(tokenMint);
        
        if (metrics) {
          console.log(`Successfully fetched token metrics:`, metrics);
        } else {
          console.warn(`No metrics found for token: ${tokenMint}`);
        }
        
        return metrics;
      } catch (error) {
        console.error('Error in metricsQuery:', error);
        // Don't show error for metrics as they're optional
        return null;
      }
    },
    enabled: isValidTokenMint && isValidFormat && !!tokenQuery.data,
    retry: 1,
    staleTime: 1000 * 60 * 2, // 2 minutes for price data
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch token holders (still uses Helius/mock data)
  const holdersQuery = useQuery({
    queryKey: ['tokenHolders', tokenMint],
    queryFn: async () => {
      if (!tokenMint) return [];
      
      try {
        console.log(`Fetching token holders for: ${tokenMint}`);
        const holders = await getTokenHolders(tokenMint, 100);
        
        console.log(`Fetched ${holders.length} holders for token: ${tokenMint}`);
        return holders;
      } catch (error) {
        console.error('Error in holdersQuery:', error);
        // Return empty array instead of failing completely
        return [];
      }
    },
    enabled: isValidTokenMint && isValidFormat && !!tokenQuery.data,
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes for holders
    gcTime: 1000 * 60 * 20, // 20 minutes
  });
  
  // Fetch token transfers (still uses Helius/mock data)
  const transfersQuery = useQuery({
    queryKey: ['tokenTransfers', tokenMint],
    queryFn: async () => {
      if (!tokenMint) return [];
      
      try {
        console.log(`Fetching token transfers for: ${tokenMint}`);
        const transfers = await getTokenTransfers(tokenMint, 50);
        
        console.log(`Fetched ${transfers.length} transfers for token: ${tokenMint}`);
        return transfers;
      } catch (error) {
        console.error('Error in transfersQuery:', error);
        // Return empty array instead of failing completely
        return [];
      }
    },
    enabled: isValidTokenMint && isValidFormat && !!tokenQuery.data,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes for transfers
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Determine loading state
  const isLoading = tokenQuery.isLoading || 
    (tokenQuery.data && (metricsQuery.isLoading || holdersQuery.isLoading || transfersQuery.isLoading));

  // Determine error state - only fail if token query fails
  const isError = tokenQuery.isError || (!isValidFormat && isValidTokenMint);

  // Get the first error encountered
  const error = tokenQuery.error || 
    (!isValidFormat && isValidTokenMint ? new Error('Invalid token address format') : null);

  // Refetch function to refresh all data
  const refetch = async () => {
    console.log(`Refetching data for token: ${tokenMint}`);
    
    const results = await Promise.allSettled([
      tokenQuery.refetch(),
      metricsQuery.refetch(),
      holdersQuery.refetch(),
      transfersQuery.refetch(),
    ]);
    
    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const queryNames = ['token', 'metrics', 'holders', 'transfers'];
        console.error(`Failed to refetch ${queryNames[index]} data:`, result.reason);
      }
    });
  };

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('useTokenData state:', {
      tokenMint,
      isValidTokenMint,
      isValidFormat,
      tokenLoading: tokenQuery.isLoading,
      tokenError: tokenQuery.isError,
      tokenData: !!tokenQuery.data,
      metricsLoading: metricsQuery.isLoading,
      metricsData: !!metricsQuery.data,
      holdersCount: holdersQuery.data?.length || 0,
      transfersCount: transfersQuery.data?.length || 0,
    });
  }

  return {
    // Main data
    token: tokenQuery.data,
    metrics: metricsQuery.data,
    holders: holdersQuery.data || [],
    transfers: transfersQuery.data || [],
    
    // Loading states
    isLoading,
    isTokenLoading: tokenQuery.isLoading,
    isMetricsLoading: metricsQuery.isLoading,
    isHoldersLoading: holdersQuery.isLoading,
    isTransfersLoading: transfersQuery.isLoading,
    
    // Error states
    isError,
    error,
    tokenError: tokenQuery.error,
    
    // Utility functions
    refetch,
    
    // Individual refetch functions for granular control
    refetchToken: tokenQuery.refetch,
    refetchMetrics: metricsQuery.refetch,
    refetchHolders: holdersQuery.refetch,
    refetchTransfers: transfersQuery.refetch,
    
    // Query status for debugging
    tokenStatus: tokenQuery.status,
    metricsStatus: metricsQuery.status,
    holdersStatus: holdersQuery.status,
    transfersStatus: transfersQuery.status,
  };
}

// Export a simplified version for backward compatibility
export function useBasicTokenData(tokenMint: string | null) {
  const {
    token,
    metrics,
    holders,
    transfers,
    isLoading,
    isError,
    error,
    refetch
  } = useTokenData(tokenMint);

  return {
    token,
    metrics,
    holders,
    transfers,
    isLoading,
    isError,
    error,
    refetch,
  };
}