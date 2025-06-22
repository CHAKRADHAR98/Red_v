// src/components/tokens/TokenOverview.tsx - Updated with Jupiter data

import React from 'react';
import { Token } from '../../types/token';
import { 
  ArrowTopRightOnSquareIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface TokenOverviewProps {
  token: Token;
}

export default function TokenOverview({ token }: TokenOverviewProps) {
  // Format supply with proper decimals
  const formatSupply = (supply: number | undefined, decimals: number) => {
    if (!supply) return 'N/A';
    const actualSupply = supply / Math.pow(10, decimals);
    return actualSupply.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  // Get tag styling
  const getTagStyle = (tag: string) => {
    switch (tag) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'strict':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'community':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'lst':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'token-2022':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'birdeye-trending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Security indicators
  const getSecurityIndicators = () => {
    const indicators = [];
    
    if (token.freeze_authority === null) {
      indicators.push({
        type: 'positive',
        icon: <ShieldCheckIcon className="h-4 w-4" />,
        text: 'No Freeze Authority',
        description: 'Token cannot be frozen by any authority'
      });
    } else if (token.freeze_authority) {
      indicators.push({
        type: 'warning',
        icon: <ExclamationTriangleIcon className="h-4 w-4" />,
        text: 'Has Freeze Authority',
        description: 'Token can be frozen by the authority'
      });
    }
    
    if (token.mint_authority === null) {
      indicators.push({
        type: 'positive',
        icon: <ShieldCheckIcon className="h-4 w-4" />,
        text: 'No Mint Authority',
        description: 'No new tokens can be minted'
      });
    } else if (token.mint_authority) {
      indicators.push({
        type: 'warning',
        icon: <ExclamationTriangleIcon className="h-4 w-4" />,
        text: 'Has Mint Authority',
        description: 'New tokens can be minted by the authority'
      });
    }
    
    if (token.permanent_delegate === null) {
      indicators.push({
        type: 'positive',
        icon: <ShieldCheckIcon className="h-4 w-4" />,
        text: 'No Permanent Delegate',
        description: 'No permanent delegate authority exists'
      });
    } else if (token.permanent_delegate) {
      indicators.push({
        type: 'warning',
        icon: <ExclamationTriangleIcon className="h-4 w-4" />,
        text: 'Has Permanent Delegate',
        description: 'A permanent delegate authority exists'
      });
    }
    
    return indicators;
  };

  const securityIndicators = getSecurityIndicators();

  return (
    <div className="space-y-6">
      {/* Token Tags */}
      {token.tags && token.tags.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <TagIcon className="h-5 w-5 mr-2 text-gray-500" />
            Verification & Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {token.tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTagStyle(tag)}`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Security Information */}
      {securityIndicators.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-gray-500" />
            Security Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {securityIndicators.map((indicator, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 ${
                    indicator.type === 'positive' ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {indicator.icon}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${
                      indicator.type === 'positive' ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {indicator.text}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {indicator.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium mb-3">Token Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Token Address</h4>
            <div className="flex items-center justify-between">
              <p className="text-sm font-mono text-gray-900 truncate mr-2">{token.address}</p>
              <button
                onClick={() => navigator.clipboard.writeText(token.address)}
                className="text-blue-600 hover:text-blue-800 text-xs"
                title="Copy address"
              >
                Copy
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Decimals</h4>
            <p className="text-sm font-mono text-gray-900">{token.decimals}</p>
          </div>
          
          {token.supply !== undefined && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Total Supply</h4>
              <p className="text-sm text-gray-900">
                {formatSupply(token.supply, token.decimals)} {token.symbol}
              </p>
            </div>
          )}
          
          {token.daily_volume && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Daily Volume</h4>
              <p className="text-sm text-gray-900">
                ${token.daily_volume.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Timestamps */}
      {(token.created_at || token.minted_at) && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
            Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {token.created_at && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Created On Jupiter</h4>
                <p className="text-sm text-gray-900">
                  {format(new Date(token.created_at), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            )}
            
            {token.minted_at && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Token Minted</h4>
                <p className="text-sm text-gray-900">
                  {format(new Date(token.minted_at), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Authorities */}
      {(token.freeze_authority || token.mint_authority || token.permanent_delegate) && (
        <div>
          <h3 className="text-lg font-medium mb-3">Authority Information</h3>
          <div className="space-y-3">
            {token.freeze_authority && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Freeze Authority</h4>
                <p className="text-sm font-mono text-yellow-700 break-all">{token.freeze_authority}</p>
              </div>
            )}
            
            {token.mint_authority && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Mint Authority</h4>
                <p className="text-sm font-mono text-yellow-700 break-all">{token.mint_authority}</p>
              </div>
            )}
            
            {token.permanent_delegate && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Permanent Delegate</h4>
                <p className="text-sm font-mono text-yellow-700 break-all">{token.permanent_delegate}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Description */}
      {token.description && (
        <div>
          <h3 className="text-lg font-medium mb-3">Description</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed">{token.description}</p>
          </div>
        </div>
      )}
      
      {/* Links */}
      <div>
        <h3 className="text-lg font-medium mb-3">Links</h3>
        <div className="space-y-3">
          {token.website && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Website</span>
              <a 
                href={token.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                {token.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
              </a>
            </div>
          )}
          
          {token.twitter && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Twitter</span>
              <a 
                href={token.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                {token.twitter.replace(/^https?:\/\/(www\.)?twitter\.com\//, '@')}
                <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
              </a>
            </div>
          )}
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Solana Explorer</span>
            <a 
              href={`https://explorer.solana.com/address/${token.address}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              View on Explorer
              <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Jupiter</span>
            <a 
              href={`https://jup.ag/swap/SOL-${token.address}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              Trade on Jupiter
              <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          {token.coingeckoId && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">CoinGecko</span>
              <a 
                href={`https://www.coingecko.com/en/coins/${token.coingeckoId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                View on CoinGecko
                <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Jupiter-specific Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">Jupiter Integration</h4>
            <p className="text-sm text-blue-700">
              This token is indexed by Jupiter and can be traded through their aggregator. 
              Price and volume data is sourced from Jupiter's comprehensive market coverage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}