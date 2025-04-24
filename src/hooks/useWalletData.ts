import { useQuery } from '@tanstack/react-query';
 import { getAccountInfo, getTransactionsForAddress } from '../services/helius';
 import { transformHeliusTransaction, transformWalletData } from '../lib/utils/transformers';
 import { Wallet } from '../types/wallet';
 import { Transaction } from '../types/transaction';
 import { PublicKey } from '@solana/web3.js';
 
 export function useWalletData(address: string) {
   // Only enable queries if we have a valid-looking address
   const isValidAddress = !!address && address.trim() !== '';
   
   // Try to validate the address format
   let isValidFormat = false;
   if (isValidAddress) {
     try {
       new PublicKey(address);
       isValidFormat = true;
     } catch (e) {
       console.warn('Invalid address format provided to useWalletData:', address);
       isValidFormat = false;
     }
   }
   
   // Fetch account info
   const accountInfoQuery = useQuery({
     queryKey: ['accountInfo', address],
     queryFn: async () => {
       const accountInfo = await getAccountInfo(address);
       return accountInfo;
     },
     enabled: isValidAddress && isValidFormat,
     retry: 1, // Limit retries for invalid addresses
   });
 
   // Fetch transactions
   const transactionsQuery = useQuery({
     queryKey: ['transactions', address],
     queryFn: async () => {
       const rawTransactions = await getTransactionsForAddress(address, 100);
       const transactions: Transaction[] = rawTransactions
         .map(transformHeliusTransaction)
         .filter(Boolean) as Transaction[];
       return transactions;
     },
     enabled: isValidAddress && isValidFormat,
     retry: 1, // Limit retries for invalid addresses
   });
 
   // Transform combined data into a wallet object
   const wallet: Wallet | undefined = isValidAddress && isValidFormat && accountInfoQuery.data ? 
     transformWalletData(
       address, 
       accountInfoQuery.data, 
       transactionsQuery.data || []
     ) : undefined;
 
   return {
     wallet,
     transactions: transactionsQuery.data || [],
     isLoading: accountInfoQuery.isLoading || transactionsQuery.isLoading,
     isError: accountInfoQuery.isError || transactionsQuery.isError || (isValidAddress && !isValidFormat),
     error: accountInfoQuery.error || transactionsQuery.error,
   };
 }