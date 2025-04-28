import { useQuery } from '@tanstack/react-query';
import { Token, TokenMetrics, TokenHolder, TokenTransfer } from '../types/token';
import { getTokenInfo, getTokenHolders, getTokenTransfers, getTokenMetrics } from '../services/token-service';

export function useTokenData(tokenMint: string | null) {
  // Only enable queries if we have a valid token mint
  const isValidTokenMint = !!tokenMint && tokenMint.trim() !== '';

  // Fetch token basic info
  const tokenQuery = useQuery({
    queryKey: ['token', tokenMint],
    queryFn: async () => {
      const tokenInfo = await getTokenInfo(tokenMint!);
      return tokenInfo;
    },
    enabled: isValidTokenMint,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch token metrics
  const metricsQuery = useQuery({
    queryKey: ['tokenMetrics', tokenMint],
    queryFn: async () => {
      const metrics = await getTokenMetrics(tokenMint!);
      return metrics;
    },
    enabled: isValidTokenMint,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch token holders
  const holdersQuery = useQuery({
    queryKey: ['tokenHolders', tokenMint],
    queryFn: async () => {
      const holders = await getTokenHolders(tokenMint!);
      return holders;
    },
    enabled: isValidTokenMint,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch token transfers
  const transfersQuery = useQuery({
    queryKey: ['tokenTransfers', tokenMint],
    queryFn: async () => {
      const transfers = await getTokenTransfers(tokenMint!);
      return transfers;
    },
    enabled: isValidTokenMint,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    token: tokenQuery.data,
    metrics: metricsQuery.data,
    holders: holdersQuery.data || [],
    transfers: transfersQuery.data || [],
    isLoading: tokenQuery.isLoading || metricsQuery.isLoading || holdersQuery.isLoading || transfersQuery.isLoading,
    isError: tokenQuery.isError || metricsQuery.isError || holdersQuery.isError || transfersQuery.isError,
    error: tokenQuery.error || metricsQuery.error || holdersQuery.error || transfersQuery.error,
    refetch: () => {
      tokenQuery.refetch();
      metricsQuery.refetch();
      holdersQuery.refetch();
      transfersQuery.refetch();
    },
  };
}