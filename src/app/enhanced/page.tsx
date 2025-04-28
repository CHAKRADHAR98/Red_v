'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import WalletSearch from '../../components/ui/WalletSearch';
import EnhancedWalletInfo from '../../components/ui/EnhancedWalletInfo';
import SimplifiedTransactionList from '../../components/ui/SimplifiedTransactionList';
import { useEnhancedWalletData } from '../../hooks/useEnhancedWalletData';
import EnvChecker from '../../components/ui/EnvChecker';
import { showSuccess, showError, showInfo } from '../../lib/utils/notifications';
import { ArrowPathIcon as RefreshIcon } from '@heroicons/react/24/outline';

export default function EnhancedHome() {
  const searchParams = useSearchParams();
  const [searchAddress, setSearchAddress] = useState<string>('');
  
  // Get address from URL if available
  useEffect(() => {
    const address = searchParams.get('address');
    if (address) {
      setSearchAddress(address);
      showInfo(`Loading wallet: ${address}`);
    }
  }, [searchParams]);
  
  const { 
    wallet, 
    transactions, 
    accountNames,
    isLoading, 
    isError,
    refetch
  } = useEnhancedWalletData(searchAddress);

  const handleSearch = (address: string) => {
    setSearchAddress(address);
    // Update the URL to make it shareable
    const url = new URL(window.location.href);
    url.searchParams.set('address', address);
    window.history.pushState({}, '', url);
  };

  const handleRefresh = () => {
    showInfo('Refreshing wallet data...');
    refetch();
  };

  return (
    <div className="space-y-6">
      <EnvChecker />
      
      <div className="p-4 bg-white rounded shadow">
        <h2 className="mb-4 text-xl font-semibold">Enhanced Wallet Explorer</h2>
        <div className="flex space-x-2">
          <div className="flex-1">
            <WalletSearch onSearch={handleSearch} />
          </div>
          {searchAddress && (
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshIcon className={`-ml-1 mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Enter a Solana wallet address to view enhanced details and transactions.
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
          <EnhancedWalletInfo wallet={wallet} />
          <SimplifiedTransactionList 
            transactions={transactions}
            accountNames={accountNames}
          />
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