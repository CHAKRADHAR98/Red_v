import { useQuery } from '@tanstack/react-query';
import { getWalletTransactions, getWalletBalances, getAddressNames } from '../services/helius-enriched';
import { transformHeliusTransaction } from '../lib/utils/transformers';
import { Wallet } from '../types/wallet';
import { Transaction } from '../types/transaction';
import { PublicKey } from '@solana/web3.js';

export function useEnhancedWalletData(address: string) {
  // Only enable queries if we have a valid-looking address
  const isValidAddress = !!address && address.trim() !== '';
  
  // Try to validate the address format
  let isValidFormat = false;
  if (isValidAddress) {
    try {
      new PublicKey(address);
      isValidFormat = true;
    } catch (e) {
      console.warn('Invalid address format provided to useEnhancedWalletData:', address);
      isValidFormat = false;
    }
  }

  // Fetch wallet balances including tokens
  const balancesQuery = useQuery({
    queryKey: ['walletBalances', address],
    queryFn: async () => {
      const balanceData = await getWalletBalances(address);
      return balanceData;
    },
    enabled: isValidAddress && isValidFormat,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch transactions
  const transactionsQuery = useQuery({
    queryKey: ['walletTransactions', address],
    queryFn: async () => {
      const rawTransactions = await getWalletTransactions(address, 100);
      const transactions: Transaction[] = rawTransactions
        .map(transformHeliusTransaction)
        .filter(Boolean) as Transaction[];
      
      // Sort transactions by timestamp (newest first)
      return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    },
    enabled: isValidAddress && isValidFormat,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Extract accounts from transactions for name resolution
  const accounts = transactionsQuery.data ? 
    Array.from(new Set(
      transactionsQuery.data.flatMap(tx => 
        tx.accounts || []
      )
    )) : [];
  
  // Fetch names for accounts
  const namesQuery = useQuery({
    queryKey: ['accountNames', accounts.length],
    queryFn: async () => {
      if (accounts.length === 0) return {};
      const names = await getAddressNames(accounts);
      return names;
    },
    enabled: accounts.length > 0,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Calculate first and last activity timestamps
  let firstActivityAt = undefined;
  let lastActivityAt = undefined;
  
  if (transactionsQuery.data && transactionsQuery.data.length > 0) {
    // Find the earliest transaction timestamp
    firstActivityAt = transactionsQuery.data.reduce((earliest, tx) => {
      const txTime = tx.timestamp instanceof Date ? tx.timestamp : new Date(tx.timestamp);
      return txTime < earliest ? txTime : earliest;
    }, transactionsQuery.data[0].timestamp instanceof Date ? 
       transactionsQuery.data[0].timestamp : 
       new Date(transactionsQuery.data[0].timestamp));
    
    // Find the latest transaction timestamp
    lastActivityAt = transactionsQuery.data.reduce((latest, tx) => {
      const txTime = tx.timestamp instanceof Date ? tx.timestamp : new Date(tx.timestamp);
      return txTime > latest ? txTime : latest;
    }, transactionsQuery.data[0].timestamp instanceof Date ? 
       transactionsQuery.data[0].timestamp : 
       new Date(transactionsQuery.data[0].timestamp));
  }

  // Determine wallet type based on transactions
  const walletType = determineWalletType(transactionsQuery.data || []);

  // Build wallet object from balance data and transactions
  let wallet: Wallet | undefined = undefined;
  
  if (isValidAddress && isValidFormat && balancesQuery.data) {
    const walletData = {
      address,
      balance: balancesQuery.data.nativeBalance || 0,
      tokenBalances: balancesQuery.data.tokens?.map((token: any) => ({
        mint: token.mint,
        symbol: token.symbol || token.mint.substring(0, 4),
        amount: token.amount || 0,
        decimals: token.decimals || 0,
        uiAmount: token.amount ? token.amount / Math.pow(10, token.decimals || 0) : 0,
      })) || [],
      transactionCount: transactionsQuery.data?.length || 0,
      firstActivityAt,
      lastActivityAt,
      name: namesQuery.data?.[address],
    };
    
    // Add the type property separately to avoid TypeScript reserved word issues
    wallet = {
      ...walletData,
      // Use bracket notation to set 'type' property
      ["type"]: walletType
    } as Wallet;
  }

  // Return the wallet data along with loading and error states
  return {
    wallet,
    transactions: transactionsQuery.data || [],
    accountNames: namesQuery.data || {},
    isLoading: balancesQuery.isLoading || transactionsQuery.isLoading,
    isError: balancesQuery.isError || transactionsQuery.isError || (isValidAddress && !isValidFormat),
    error: balancesQuery.error || transactionsQuery.error,
    refetch: () => {
      balancesQuery.refetch();
      transactionsQuery.refetch();
      if (accounts.length > 0) {
        namesQuery.refetch();
      }
    },
  };
}

/**
 * Determine wallet type based on transaction patterns
 */
function determineWalletType(transactions: Transaction[]): string {
  if (transactions.length === 0) return 'unknown';
  
  // Check for program invocations
  const programInvocations = new Map<string, number>();
  transactions.forEach(tx => {
    if (tx.programIds && tx.programIds.length > 0) {
      tx.programIds.forEach(program => {
        programInvocations.set(
          program, 
          (programInvocations.get(program) || 0) + 1
        );
      });
    }
  });
  
  // Check for exchange patterns (high volume, many programs)
  if (transactions.length > 100 || programInvocations.size > 20) {
    return 'exchange';
  }
  
  // Check for protocol wallets
  const hasProtocolInteractions = transactions.some(tx => tx.protocol);
  if (hasProtocolInteractions) {
    const protocolCounts = new Map<string, number>();
    transactions.forEach(tx => {
      if (tx.protocol) {
        protocolCounts.set(
          tx.protocol,
          (protocolCounts.get(tx.protocol) || 0) + 1
        );
      }
    });
    
    // If more than 50% of transactions are with one protocol
    for (const [protocol, count] of protocolCounts.entries()) {
      if (count / transactions.length > 0.5) {
        return 'protocol';
      }
    }
  }
  
  // Check for NFT collectors
  const hasNftTransactions = transactions.some(tx => 
    tx.type === 'nft_sale' || 
    (tx.programIds && tx.programIds.some(id => 
      id === 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
    ))
  );
  
  if (hasNftTransactions) {
    return 'nft_collector';
  }
  
  // Default to user
  return 'user';
}