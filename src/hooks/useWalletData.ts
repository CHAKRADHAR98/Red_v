import { useQuery } from '@tanstack/react-query';
import { getAccountInfo, getTransactionsForAddress } from '../services/helius';
import { transformWalletData } from '../lib/utils/transformers';
import { detectTransactionType } from '../lib/utils/transaction-type-detector'; 
import { Wallet } from '../types/wallet';
import { Transaction, TransactionStatus } from '../types/transaction';
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
      
      // Process transactions with simpler, more reliable type detection
      const transactions: Transaction[] = [];
      
      for (const rawTx of rawTransactions) {
        try {
          // Create basic transaction object
          const tx: Transaction = {
            signature: rawTx.transaction?.signatures?.[0] || rawTx.signature || '',
            timestamp: new Date((rawTx.blockTime || 0) * 1000),
            blockTime: rawTx.blockTime || 0,
            slot: rawTx.slot || 0,
            fee: rawTx.meta?.fee || rawTx.fee || 0,
            status: (rawTx.meta?.err || rawTx.err) ? TransactionStatus.FAILED : TransactionStatus.SUCCESS,
            accounts: rawTx.transaction?.message?.accountKeys?.map((key: any) => 
              typeof key === 'string' ? key : key.pubkey
            ) || [],
            programIds: [],
          };
          
          // Detect transaction type using our simplified detector
          tx.type = detectTransactionType(rawTx);
          
          transactions.push(tx);
        } catch (error) {
          console.error('Error processing transaction:', error);
        }
      }
      
      console.log('Processed transactions with type detection:', 
        transactions.length, 
        'Types distribution:', 
        Object.entries(
          transactions.reduce((acc: Record<string, number>, tx) => {
            const type = tx.type || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {})
        )
      );
      
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