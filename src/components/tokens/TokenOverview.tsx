import React from 'react';
import { Token } from '../../types/token';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface TokenOverviewProps {
  token: Token;
}

export default function TokenOverview({ token }: TokenOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium mb-3">Token Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Mint Address</h4>
            <p className="text-sm font-mono break-all">{token.mint}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Decimals</h4>
            <p className="text-sm">{token.decimals}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Total Supply</h4>
            <p className="text-sm">{(token.supply / Math.pow(10, token.decimals)).toLocaleString()} {token.symbol}</p>
          </div>
        </div>
      </div>
      
      {/* Description */}
      {token.description && (
        <div>
          <h3 className="text-lg font-medium mb-3">Description</h3>
          <p className="text-sm text-gray-700">{token.description}</p>
        </div>
      )}
      
      {/* Links */}
      <div>
        <h3 className="text-lg font-medium mb-3">Links</h3>
        <div className="space-y-2">
          {token.website && (
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 w-20">Website:</span>
              <a 
                href={token.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                {token.website.replace(/^https?:\/\//, '')}
                <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
              </a>
            </div>
          )}
          
          {token.twitter && (
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 w-20">Twitter:</span>
              <a 
                href={token.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                {token.twitter.replace(/^https?:\/\/(www\.)?twitter\.com\//, '@')}
                <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
              </a>
            </div>
          )}
          
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 w-20">Explorer:</span>
            <a 
              href={`https://explorer.solana.com/address/${token.mint}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center"
            >
              View on Solana Explorer
              <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          {token.coingeckoId && (
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 w-20">CoinGecko:</span>
              <a 
                href={`https://www.coingecko.com/en/coins/${token.coingeckoId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                View on CoinGecko
                <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}