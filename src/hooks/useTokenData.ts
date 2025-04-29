import { useQuery } from '@tanstack/react-query';
import { Token, TokenMetrics, TokenHolder, TokenTransfer } from '../types/token';
import { getTokenInfo, getTokenHolders, getTokenTransfers, getTokenMetrics } from '../services/token-service';
import { showError } from '../lib/utils/notifications';

export function useTokenData(tokenMint: string | null) {
  // Only enable queries if we have a valid token mint
  const isValidTokenMint = !!tokenMint && tokenMint.trim() !== '';

  // Fetch token basic info
  const tokenQuery = useQuery({
    queryKey: ['token', tokenMint],
    queryFn: async () => {
      try {
        const tokenInfo = await getTokenInfo(tokenMint!);
        return tokenInfo;
      } catch (error) {
        console.error('Error in tokenQuery:', error);
        showError('Failed to fetch token information');
        return null;
      }
    },
    enabled: isValidTokenMint,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch token metrics
  const metricsQuery = useQuery({
    queryKey: ['tokenMetrics', tokenMint],
    queryFn: async () => {
      try {
        const metrics = await getTokenMetrics(tokenMint!);
        return metrics;
      } catch (error) {
        console.error('Error in metricsQuery:', error);
        // Don't show an error here, metrics are optional
        return null;
      }
    },
    enabled: isValidTokenMint && !!tokenQuery.data,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch token holders
  const holdersQuery = useQuery({
    queryKey: ['tokenHolders', tokenMint],
    queryFn: async () => {
      try {
        const holders = await getTokenHolders(tokenMint!);
        return holders;
      } catch (error) {
        console.error('Error in holdersQuery:', error);
        // Return empty array instead of failing completely
        return [];
      }
    },
    enabled: isValidTokenMint && !!tokenQuery.data,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch token transfers
  const transfersQuery = useQuery({
    queryKey: ['tokenTransfers', tokenMint],
    queryFn: async () => {
      try {
        const transfers = await getTokenTransfers(tokenMint!);
        return transfers;
      } catch (error) {
        console.error('Error in transfersQuery:', error);
        // Return empty array instead of failing completely
        return [];
      }
    },
    enabled: isValidTokenMint && !!tokenQuery.data,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    token: tokenQuery.data,
    metrics: metricsQuery.data,
    holders: holdersQuery.data || [],
    transfers: transfersQuery.data || [],
    isLoading: tokenQuery.isLoading || metricsQuery.isLoading || holdersQuery.isLoading || transfersQuery.isLoading,
    // Only consider it an error if the token query fails completely
    isError: tokenQuery.isError,
    error: tokenQuery.error,
    refetch: () => {
      tokenQuery.refetch();
      if (tokenQuery.data) {
        metricsQuery.refetch();
        holdersQuery.refetch();
        transfersQuery.refetch();
      }
    },
  };
}