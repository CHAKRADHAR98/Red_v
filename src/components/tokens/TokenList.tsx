// src/components/tokens/TokenList.tsx - Updated with Jupiter API integration

import React, { useState, useEffect } from 'react';
import { 
  TokenListItem, 
  TokenFilters, 
  TokenTag, 
  TOKEN_CATEGORIES, 
  TokenCategory 
} from '../../types/token';
import { 
  getTopTokens, 
  searchTokens, 
  getTokensByCategory 
} from '../../services/token-service';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  XMarkIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

interface TokenListProps {
  onSelectToken: (mint: string) => void;
  selectedToken: string | null;
}

type ViewMode = 'top' | 'search' | 'category';

export default function TokenList({ onSelectToken, selectedToken }: TokenListProps) {
  const [tokens, setTokens] = useState<TokenListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('top');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<TokenFilters>({
    verified: true, // Default to verified tokens
  });
  
  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Fetch tokens based on current view mode and filters
  useEffect(() => {
    fetchTokens();
  }, [viewMode, selectedCategory, debouncedSearchTerm, filters]);
  
  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let fetchedTokens: TokenListItem[] = [];
      
      switch (viewMode) {
        case 'search':
          if (debouncedSearchTerm.trim().length >= 2) {
            fetchedTokens = await searchTokens(debouncedSearchTerm, 50);
          }
          break;
          
        case 'category':
          if (selectedCategory) {
            fetchedTokens = await getTokensByCategory(selectedCategory as TokenTag, 100);
          }
          break;
          
        case 'top':
        default:
          fetchedTokens = await getTopTokens(100, filters);
          break;
      }
      
      setTokens(fetchedTokens);
      
      if (fetchedTokens.length === 0 && viewMode === 'search' && debouncedSearchTerm) {
        setError(`No tokens found for "${debouncedSearchTerm}"`);
      } else {
        setError(null);
      }
      
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError('Failed to load tokens: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim().length >= 2) {
      setViewMode('search');
    } else if (viewMode === 'search') {
      setViewMode('top');
    }
  };
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setViewMode('category');
    setSearchTerm('');
  };
  
  const handleFilterChange = (newFilters: Partial<TokenFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    if (viewMode !== 'search') {
      setViewMode('top');
    }
  };
  
  const clearFilters = () => {
    setFilters({ verified: true });
    setSearchTerm('');
    setSelectedCategory('');
    setViewMode('top');
    setShowFilters(false);
  };
  
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
  
  const formatVolume = (volume: number | undefined) => {
    if (volume === undefined) return 'N/A';
    
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(2)}B`;
    } else if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(2)}K`;
    } else {
      return `$${volume.toFixed(2)}`;
    }
  };
  
  const getTokenBadges = (token: TokenListItem) => {
    const badges = [];
    
    // Ensure tags exists and is an array before using includes
    if (token.tags && Array.isArray(token.tags)) {
      if (token.tags.includes('verified')) {
        badges.push(
          <span key="verified" className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckBadgeIcon className="w-3 h-3 mr-1" />
            Verified
          </span>
        );
      }
      
      if (token.tags.includes('token-2022')) {
        badges.push(
          <span key="token-2022" className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Token-2022
          </span>
        );
      }
    }
    
    return badges;
  };
  
  const getViewTitle = () => {
    switch (viewMode) {
      case 'search':
        return `Search Results${debouncedSearchTerm ? ` for "${debouncedSearchTerm}"` : ''}`;
      case 'category':
        const category = TOKEN_CATEGORIES.find(c => c.id === selectedCategory);
        return category ? category.name : 'Category';
      case 'top':
      default:
        return 'Top Tokens by Volume';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">{getViewTitle()}</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FunnelIcon className="w-4 h-4 mr-1" />
            Filters
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search tokens by name, symbol, or address..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => { setViewMode('top'); setSelectedCategory(''); setSearchTerm(''); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'top' && !selectedCategory
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Top Volume
          </button>
          
          {TOKEN_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Verified Filter */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.verified || false}
                  onChange={(e) => handleFilterChange({ verified: e.target.checked || undefined })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Verified Only</span>
              </label>
            </div>
            
            {/* Volume Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Volume (24h)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minVolume || ''}
                onChange={(e) => handleFilterChange({ 
                  minVolume: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="block w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Volume (24h)
              </label>
              <input
                type="number"
                placeholder="No limit"
                value={filters.maxVolume || ''}
                onChange={(e) => handleFilterChange({ 
                  maxVolume: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="block w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Token List */}
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 rounded-full border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading tokens...</p>
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">
          {error}
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[600px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  24h Volume
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tokens.length > 0 ? (
                tokens.map((token) => (
                  <tr 
                    key={token.address}
                    onClick={() => onSelectToken(token.address)}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedToken === token.address ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {token.logoURI ? (
                          <img 
                            src={token.logoURI} 
                            alt={token.name} 
                            className="w-8 h-8 rounded-full mr-3 flex-shrink-0"
                            onError={(e) => {
                              // Fallback to a default icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${token.logoURI ? 'hidden' : ''}`}>
                          {token.symbol.substring(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="font-medium text-gray-900 truncate">
                              {token.symbol}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {getTokenBadges(token)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {token.name}
                          </div>
                          {viewMode !== 'search' && (
                            <div className="text-xs text-gray-400 font-mono truncate">
                              {token.address.slice(0, 8)}...{token.address.slice(-4)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${formatPrice(token.price)}
                      </div>
                      {token.priceChange24h !== undefined && (
                        <div className={`text-xs ${
                          token.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {formatVolume(token.volume24h || token.daily_volume)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    {viewMode === 'search' && searchTerm 
                      ? `No tokens found for "${searchTerm}"`
                      : 'No tokens available'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Footer with token count */}
      {tokens.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Showing {tokens.length} token{tokens.length !== 1 ? 's' : ''}
            {viewMode === 'search' && debouncedSearchTerm && (
              <span> matching "{debouncedSearchTerm}"</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}