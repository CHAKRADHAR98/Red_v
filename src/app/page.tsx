'use client';

import { useState } from 'react';
import WalletSearch from '../components/ui/WalletSearch';
import WalletInfo from '../components/ui/WalletInfo';
import TransactionList from '../components/ui/TransactionList';
import { useWalletData } from '../hooks/useWalletData';
import EnvChecker from '../components/ui/EnvChecker';

export default function Home() {
  const [searchAddress, setSearchAddress] = useState<string>('');
  
  const { 
    wallet, 
    transactions, 
    isLoading, 
    isError 
  } = useWalletData(searchAddress);

  const handleSearch = (address: string) => {
    setSearchAddress(address);
  };

  return (
    <div className="space-y-6">
      <EnvChecker />
      
      <div className="p-4 bg-white rounded shadow">
        <h2 className="mb-4 text-xl font-semibold">Search for a Wallet</h2>
        <WalletSearch onSearch={handleSearch} />
        <p className="mt-2 text-sm text-gray-500">
          Enter a Solana wallet address to view its details and transactions.
        </p>
      </div>

      {isLoading && (
        <div className="p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 rounded-full border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading wallet data...</p>
        </div>
      )}

      {isError && (
        <div className="p-4 bg-red-50 rounded shadow">
          <h3 className="font-medium text-red-700">Error loading wallet data</h3>
          <p className="mt-1 text-red-600">
            There was a problem connecting to the Helius API. Please check your API key configuration in the .env.local file.
          </p>
          <p className="mt-2 text-sm text-red-500">
            Make sure you have added HELIUS_API_KEY and NEXT_PUBLIC_HELIUS_RPC_URL to your environment variables.
          </p>
        </div>
      )}

      {wallet && !isLoading && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WalletInfo wallet={wallet} />
          <TransactionList transactions={transactions} />
        </div>
      )}

      {searchAddress && !isLoading && !wallet && !isError && (
        <div className="p-4 bg-yellow-50 rounded shadow">
          <p className="text-yellow-700">
            No data found for this address. It may not exist or have any transactions.
          </p>
        </div>
      )}
    </div>
  );
}