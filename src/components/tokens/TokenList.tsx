import React, { useState, useEffect } from 'react';
import { TokenListItem } from '../../types/token';
import { getTopTokens } from '../../services/token-service';

interface TokenListProps {
  onSelectToken: (mint: string) => void;
  selectedToken: string | null;
}

export default function TokenList({ onSelectToken, selectedToken }: TokenListProps) {
  const [tokens, setTokens] = useState<TokenListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Fetch tokens on component mount
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setIsLoading(true);
        const tokenData = await getTopTokens(100);
        setTokens(tokenData);
        setError(null);
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError('Failed to load token list');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTokens();
  }, []);
  
  // Filter tokens based on search term
  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.mint.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format price change with appropriate color
  const formatPriceChange = (change: number | undefined) => {
    if (change === undefined) return null;
    
    const colorClass = change >= 0 ? 'text-green-500' : 'text-red-500';
    const prefix = change >= 0 ? '+' : '';
    
    return (
      <span className={colorClass}>
        {prefix}{change.toFixed(2)}%
      </span>
    );
  };
  
  // Format price with appropriate decimals
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium">Top Tokens</h2>
        <div className="mt-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tokens..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">24h %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token) => (
                  <tr 
                    key={token.mint}
                    onClick={() => onSelectToken(token.mint)}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedToken === token.mint ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {token.logoUrl ? (
                          <img src={token.logoUrl} alt={token.name} className="w-6 h-6 rounded-full mr-2" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 flex items-center justify-center text-xs">
                            {token.symbol.substring(0, 1)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{token.symbol}</div>
                          <div className="text-xs text-gray-500">{token.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                      ${formatPrice(token.price)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      {formatPriceChange(token.priceChange24h)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    No tokens found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}