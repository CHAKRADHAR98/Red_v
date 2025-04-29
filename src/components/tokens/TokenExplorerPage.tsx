'use client';

import { useState, useEffect } from 'react';
import TokenList from './TokenList';
import TokenOverview from './TokenOverview';
import TokenMetrics from './TokenMetrics';
import TokenHolders from './TokenHolders';
import TokenTransfers from './TokenTransfers';
import EnvChecker from '../ui/EnvChecker';
import { showInfo, showError } from '../../lib/utils/notifications';
import { useTokenData } from '../../hooks/useTokenData';

export default function TokenExplorerPage() {
  // State for the currently selected token
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'holders' | 'transfers'>('overview');
  
  // Use our token data hook to fetch token information
  const { token, holders, transfers, metrics, isLoading, isError } = useTokenData(selectedToken);

  // Handle token selection
  const handleSelectToken = (tokenMint: string) => {
    setSelectedToken(tokenMint);
    showInfo(`Loading token data for: ${tokenMint}`);
  };

  return (
    <div className="space-y-6">
      <EnvChecker />
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Solana Token Explorer</h1>
        <p className="text-gray-600 mb-6">
          Explore the top tokens on Solana blockchain, view their metrics, holders, and recent transfers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Token List */}
        <div className="lg:col-span-1">
          <TokenList onSelectToken={handleSelectToken} selectedToken={selectedToken} />
        </div>
        
        {/* Right column - Token Details */}
        <div className="lg:col-span-2">
          {isLoading && (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 rounded-full border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading token data...</p>
            </div>
          )}
          
          {isError && (
            <div className="p-4 bg-red-50 rounded shadow">
              <h3 className="font-medium text-red-700">Error loading token data</h3>
              <p className="mt-1 text-red-600">
                There was a problem retrieving the token information.
              </p>
            </div>
          )}
          
          {!isLoading && !isError && token && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Token header info */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  {token.logoUrl && (
                    <img src={token.logoUrl} alt={token.name} className="w-12 h-12 rounded-full" />
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{token.name} ({token.symbol})</h2>
                    <p className="text-sm text-gray-500 font-mono">{token.mint}</p>
                  </div>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-3 text-sm font-medium ${
                      activeTab === 'overview'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('metrics')}
                    className={`px-4 py-3 text-sm font-medium ${
                      activeTab === 'metrics'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Metrics
                  </button>
                  <button
                    onClick={() => setActiveTab('holders')}
                    className={`px-4 py-3 text-sm font-medium ${
                      activeTab === 'holders'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Holders
                  </button>
                  <button
                    onClick={() => setActiveTab('transfers')}
                    className={`px-4 py-3 text-sm font-medium ${
                      activeTab === 'transfers'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Transfers
                  </button>
                </nav>
              </div>
              
              {/* Tab content */}
              <div className="p-6">
                {activeTab === 'overview' && <TokenOverview token={token} />}
                {activeTab === 'metrics' && <TokenMetrics metrics={metrics} />}
                {activeTab === 'holders' && <TokenHolders holders={holders} />}
                {activeTab === 'transfers' && <TokenTransfers transfers={transfers} />}
              </div>
            </div>
          )}
          
          {!isLoading && !isError && !token && selectedToken && (
            <div className="p-4 bg-yellow-50 rounded shadow">
              <p className="text-yellow-700">
                No data found for this token. It may not exist or have any activity.
              </p>
            </div>
          )}
          
          {!selectedToken && !isLoading && (
            <div className="p-4 bg-blue-50 rounded shadow text-center">
              <p className="text-blue-700">
                Select a token from the list to view detailed information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}