// src/components/tokens/TokenMetrics.tsx - Updated with Jupiter price data

import React from 'react';
import { TokenMetrics } from '../../types/token';
import { format } from 'date-fns';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  UsersIcon, 
  BanknotesIcon, 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface TokenMetricsProps {
  metrics: TokenMetrics | null | undefined;
}

export default function TokenMetricsPanel({ metrics }: TokenMetricsProps) {
  if (!metrics) {
    return (
      <div className="p-4 text-center text-gray-500">
        No metrics data available for this token.
      </div>
    );
  }

  // Format price with appropriate precision
  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return 'N/A';
    
    if (price < 0.000001) {
      return price.toExponential(4);
    } else if (price < 0.001) {
      return price.toFixed(6);
    } else if (price < 1) {
      return price.toFixed(4);
    } else {
      return price.toFixed(2);
    }
  };
  
  // Format large numbers with appropriate suffixes (K, M, B)
  const formatNumber = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    } else {
      return value.toLocaleString();
    }
  };
  
  // Format price change with plus/minus and color
  const getPriceChangeElement = (change: number | undefined) => {
    if (change === undefined) return 'N/A';
    
    const isPositive = change >= 0;
    const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
    const icon = isPositive ? (
      <ArrowTrendingUpIcon className="h-4 w-4" />
    ) : (
      <ArrowTrendingDownIcon className="h-4 w-4" />
    );
    
    return (
      <div className={`flex items-center ${colorClass}`}>
        {icon}
        <span className="ml-1">{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
      </div>
    );
  };

  // Get confidence level styling
  const getConfidenceStyle = (confidence?: string) => {
    switch (confidence) {
      case 'high':
        return {
          icon: <CheckCircleIcon className="h-4 w-4 text-green-500" />,
          text: 'High Confidence',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700'
        };
      case 'medium':
        return {
          icon: <InformationCircleIcon className="h-4 w-4 text-yellow-500" />,
          text: 'Medium Confidence',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700'
        };
      case 'low':
        return {
          icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />,
          text: 'Low Confidence',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700'
        };
      default:
        return null;
    }
  };

  const confidenceStyle = getConfidenceStyle(metrics.confidence);

  return (
    <div className="space-y-6">
      {/* Jupiter Price Information */}
      {(metrics.price || metrics.buyPrice || metrics.sellPrice) && (
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
            Jupiter Price Data
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Current Price */}
            {metrics.price && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Current Price</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      ${formatPrice(metrics.price)}
                    </p>
                  </div>
                  {metrics.priceChange24h !== undefined && (
                    <div className="text-right">
                      {getPriceChangeElement(metrics.priceChange24h)}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Buy Price */}
            {metrics.buyPrice && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-start">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Buy Price</p>
                    <p className="text-xl font-bold text-green-900 mt-1">
                      ${formatPrice(metrics.buyPrice)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Sell Price */}
            {metrics.sellPrice && (
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-start">
                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm text-red-600 font-medium">Sell Price</p>
                    <p className="text-xl font-bold text-red-900 mt-1">
                      ${formatPrice(metrics.sellPrice)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Confidence and Last Updated */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {confidenceStyle && (
              <div className={`${confidenceStyle.bgColor} rounded-lg p-3`}>
                <div className={`flex items-center ${confidenceStyle.textColor}`}>
                  {confidenceStyle.icon}
                  <span className="ml-2 text-sm font-medium">{confidenceStyle.text}</span>
                </div>
              </div>
            )}
            
            {metrics.lastUpdated && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center text-gray-700">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Last updated: {format(metrics.lastUpdated, 'MMM d, HH:mm')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price Impact Analysis */}
      {metrics.priceImpact && (
        <div>
          <h3 className="text-lg font-medium mb-4">Price Impact Analysis</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buy Impact */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  Buy Price Impact
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">10 SOL buy</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(metrics.priceImpact.buy.small * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">100 SOL buy</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(metrics.priceImpact.buy.medium * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">1000 SOL buy</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(metrics.priceImpact.buy.large * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Sell Impact */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  Sell Price Impact
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">10 SOL sell</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(metrics.priceImpact.sell.small * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">100 SOL sell</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(metrics.priceImpact.sell.medium * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">1000 SOL sell</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(metrics.priceImpact.sell.large * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Lower price impact indicates better liquidity. Values shown are percentage price changes.
            </div>
          </div>
        </div>
      )}

      {/* Market Metrics */}
      <div>
        <h3 className="text-lg font-medium mb-4">Market Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Daily Volume */}
          {(metrics.volume24h || metrics.dailyVolume) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">24h Volume</p>
                  <p className="text-xl font-medium mt-1">
                    ${formatNumber(metrics.volume24h || metrics.dailyVolume)}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Market Cap */}
          {metrics.marketCap && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Market Cap</p>
                  <p className="text-xl font-medium mt-1">${formatNumber(metrics.marketCap)}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Holders */}
          {metrics.holders && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Holders</p>
                  <p className="text-xl font-medium mt-1">{formatNumber(metrics.holders)}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Daily Active Users */}
          {metrics.dailyActiveUsers && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Daily Active Users</p>
                  <p className="text-xl font-medium mt-1">{formatNumber(metrics.dailyActiveUsers)}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Total Value Locked */}
          {metrics.tvl && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Total Value Locked</p>
                  <p className="text-xl font-medium mt-1">${formatNumber(metrics.tvl)}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* 24h Transactions */}
          {metrics.transactions24h && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <div>
                  <p className="text-sm text-gray-500">24h Transactions</p>
                  <p className="text-xl font-medium mt-1">{formatNumber(metrics.transactions24h)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Creation Date */}
      {metrics.createdAt && (
        <div>
          <h3 className="text-lg font-medium mb-4">Token Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-lg font-medium mt-1">{format(metrics.createdAt, 'MMM d, yyyy')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}