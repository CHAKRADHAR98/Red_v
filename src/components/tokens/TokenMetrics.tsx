import React from 'react';
import { TokenMetrics } from '../../types/token';
import { format } from 'date-fns';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  UsersIcon, 
  BanknotesIcon, 
  ChartBarIcon 
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
      <ArrowTrendingUpIcon className="h-5 w-5" />
    ) : (
      <ArrowTrendingDownIcon className="h-5 w-5" />
    );
    
    return (
      <div className={`flex items-center ${colorClass}`}>
        {icon}
        <span className="ml-1">{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-medium mb-4">Market Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Price */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-xl font-medium mt-1">${formatPrice(metrics.price)}</p>
              </div>
              <div>
                {getPriceChangeElement(metrics.priceChange24h)}
              </div>
            </div>
          </div>
          
          {/* Market Cap */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Market Cap</p>
                <p className="text-xl font-medium mt-1">${formatNumber(metrics.marketCap)}</p>
              </div>
            </div>
          </div>
          
          {/* 24h Volume */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">24h Volume</p>
                <p className="text-xl font-medium mt-1">${formatNumber(metrics.volume24h)}</p>
              </div>
            </div>
          </div>
          
          {/* Holders */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Holders</p>
                <p className="text-xl font-medium mt-1">{formatNumber(metrics.holders)}</p>
              </div>
            </div>
          </div>
          
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
        </div>
      </div>
      
      {/* Activity Metrics */}
      <div>
        <h3 className="text-lg font-medium mb-4">Activity Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 24h Transactions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <div>
                <p className="text-sm text-gray-500">24h Transactions</p>
                <p className="text-xl font-medium mt-1">{formatNumber(metrics.transactions24h)}</p>
              </div>
            </div>
          </div>
          
          {/* Created At */}
          {metrics.createdAt && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-xl font-medium mt-1">{format(metrics.createdAt, 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}