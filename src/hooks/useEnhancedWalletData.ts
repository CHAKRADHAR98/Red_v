import { useQuery } from '@tanstack/react-query';
import { getWalletTransactions, getWalletBalances, getAddressNames } from '../services/helius-enriched';
import { transformHeliusTransaction, transformWalletData } from '../lib/utils/transformers';
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
  });
  
  // Fetch transactions
  const transactionsQuery = useQuery({
    queryKey: ['walletTransactions', address],
    queryFn: async () => {
      const rawTransactions = await getWalletTransactions(address, 50);
      const transactions: Transaction[] = rawTransactions
        .map(transformHeliusTransaction)
        .filter(Boolean) as Transaction[];
      return transactions;
    },
    enabled: isValidAddress && isValidFormat,
    retry: 1,
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
    queryKey: ['accountNames', accounts.join(',')],
    queryFn: async () => {
      if (accounts.length === 0) return {};
      const names = await getAddressNames(accounts);
      return names;
    },
    enabled: accounts.length > 0,
    retry: 1,
  });

  // Build wallet object from balance data and transactions
  const wallet: Wallet | undefined = isValidAddress && isValidFormat && balancesQuery.data ? {
    address,
    balance: balancesQuery.data.nativeBalance || 0,
    tokenBalances: balancesQuery.data.tokens?.map((token: any) => ({
      mint: token.mint,
      symbol: token.symbol,
      amount: token.amount,
      decimals: token.decimals,
      uiAmount: token.amount / Math.pow(10, token.decimals),
    })) || [],
    transactionCount: transactionsQuery.data?.length || 0,
    firstActivityAt: transactionsQuery.data && transactionsQuery.data.length > 0 ? 
      transactionsQuery.data.reduce((earliest, tx) => 
        tx.timestamp < earliest ? tx.timestamp : earliest, 
        transactionsQuery.data[0].timestamp) : 
      undefined,
    lastActivityAt: transactionsQuery.data && transactionsQuery.data.length > 0 ? 
      transactionsQuery.data.reduce((latest, tx) => 
        tx.timestamp > latest ? tx.timestamp : latest, 
        transactionsQuery.data[0].timestamp) : 
      undefined,
    name: namesQuery.data?.[address],
  } : undefined;

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