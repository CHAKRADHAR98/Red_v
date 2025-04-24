import React, { useState } from 'react';
import { Wallet, TokenBalance } from '../../types/wallet';
import { formatDistanceToNow } from 'date-fns';
import { 
    ArrowTopRightOnSquareIcon as ExternalLinkIcon, 
    ChartBarIcon,
    BanknotesIcon as CashIcon,
    ClockIcon,
    TagIcon,
    CpuChipIcon as ChipIcon  // Alternative replacement
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface EnhancedWalletInfoProps {
  wallet: Wallet;
}

export default function EnhancedWalletInfo({ wallet }: EnhancedWalletInfoProps) {
  const [showAllTokens, setShowAllTokens] = useState(false);
  
  // Sort tokens by value (approximate)
  const sortedTokens = wallet.tokenBalances ? 
    [...wallet.tokenBalances].sort((a, b) => {
      const aValue = (a.uiAmount || a.amount / Math.pow(10, a.decimals)) || 0;
      const bValue = (b.uiAmount || b.amount / Math.pow(10, b.decimals)) || 0;
      return bValue - aValue;
    }) : [];
  
  // Show only top 5 tokens by default
  const displayTokens = showAllTokens ? sortedTokens : sortedTokens.slice(0, 5);
  
  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold">Wallet Information</h2>
        <Link 
          href={`https://explorer.solana.com/address/${wallet.address}`} 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          View in Explorer
          <ExternalLinkIcon className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      <div className="mt-4">
        <div className="flex items-start">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold">
            {wallet.name ? wallet.name[0].toUpperCase() : wallet.address.substring(0, 2)}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium flex items-center">
              {wallet.name && (
                <span className="mr-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {wallet.name}
                </span>
              )}
              <span className="text-sm font-mono break-all text-gray-600">{wallet.address}</span>
            </h3>
            
            {wallet.type && (
              <div className="mt-1 flex items-center">
                <TagIcon className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-600 capitalize">{wallet.type.replace(/_/g, ' ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <CashIcon className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-base font-medium text-gray-900">Balance</h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-semibold">{(wallet.balance / 1e9).toFixed(4)} SOL</p>
            {wallet.tokenBalances && wallet.tokenBalances.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                + {wallet.tokenBalances.length} token{wallet.tokenBalances.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <ChartBarIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-base font-medium text-gray-900">Activity</h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-semibold">{wallet.transactionCount || 0}</p>
            <p className="text-sm text-gray-500 mt-1">transactions</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex items-center mb-2">
          <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-base font-medium">Activity Timeline</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {wallet.firstActivityAt && (
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-500">First Activity</p>
              <p className="text-sm font-medium">{formatDistanceToNow(wallet.firstActivityAt)} ago</p>
            </div>
          )}
          
          {wallet.lastActivityAt && (
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-500">Last Activity</p>
              <p className="text-sm font-medium">{formatDistanceToNow(wallet.lastActivityAt)} ago</p>
            </div>
          )}
        </div>
      </div>
      
      {displayTokens.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center mb-2">
            <ChipIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-base font-medium">Token Balances</h3>
          </div>
          
          <div className="mt-2 bg-gray-50 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayTokens.map((token, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-800">
                          {token.symbol ? token.symbol[0] : 'T'}
                        </div>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            {token.symbol || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500 font-mono truncate max-w-xs">
                            {token.mint.slice(0, 8)}...{token.mint.slice(-4)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-gray-900 font-medium">
                      {token.uiAmount?.toLocaleString() || 
                        (token.amount / Math.pow(10, token.decimals)).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {sortedTokens.length > 5 && (
              <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
                <button
                  onClick={() => setShowAllTokens(!showAllTokens)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showAllTokens ? 'Show Less' : `Show ${sortedTokens.length - 5} More Tokens`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}