'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { showInfo, showError } from '../../lib/utils/notifications';
import TokenSearch from '../../components/bubblemaps/TokenSearch';

export default function BubblemapsExplorer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // Get token from URL if available
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setTokenAddress(token);
      checkTokenAvailability(token);
    }
  }, [searchParams]);
  
  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('bubblemaps-search-history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history', e);
      }
    }
  }, []);
  
  // Save search history to localStorage
  const updateSearchHistory = (address: string) => {
    const updatedHistory = [
      address,
      ...searchHistory.filter(item => item !== address)
    ].slice(0, 10); // Keep only 10 most recent
    
    setSearchHistory(updatedHistory);
    localStorage.setItem('bubblemaps-search-history', JSON.stringify(updatedHistory));
  };

  const checkTokenAvailability = async (address: string) => {
    if (!address.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setIsAvailable(false);
    
    try {
      // Check if the map is available
      const availabilityResponse = await fetch(
        `https://api-legacy.bubblemaps.io/map-availability?chain=sol&token=${address}`
      );
      
      const availabilityData = await availabilityResponse.json();
      
      if (availabilityData.status === 'OK' && availabilityData.availability) {
        setIsAvailable(true);
        updateSearchHistory(address);
        
        // Update URL for shareability
        router.push(`/bubblemaps?token=${address}`);
        showInfo(`Loaded bubble map for token: ${address}`);
      } else if (availabilityData.status === 'OK') {
        setError('This token map is not available or not yet computed.');
        showError('Token map not available');
      } else {
        setError(availabilityData.message || 'Error checking token availability');
        showError('Error checking token availability');
      }
    } catch (err) {
      setError('Error connecting to Bubblemaps API. Please try again later.');
      showError('Connection error');
      console.error('Bubblemaps availability error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (address: string) => {
    setTokenAddress(address);
    checkTokenAvailability(address);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Bubblemaps Explorer</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Explore token holder distribution using Bubblemaps visualization. Enter a Solana token address to view its bubble map.
        </p>
        
        <TokenSearch onSearch={handleSearch} isLoading={isLoading} />
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Try These Examples</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Click on any of these popular Solana tokens to see their bubble maps:
          </p>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleSearch("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
            >
              USDC
            </button>
            <button 
              onClick={() => handleSearch("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263")}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
            >
              BONK
            </button>
            <button 
              onClick={() => handleSearch("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So")}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
            >
              mSOL
            </button>
            
            <button 
              onClick={() => handleSearch("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB")}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
            >
              USDT
            </button>
            <button 
              onClick={() => handleSearch("JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN")}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
            >
              JUP
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="inline-block w-8 h-8 border-4 rounded-full border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Checking token availability...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded shadow">
          <h3 className="font-medium text-red-700 dark:text-red-400">Error</h3>
          <p className="mt-1 text-red-600 dark:text-red-300">{error}</p>
          <p className="mt-2 text-sm text-red-500 dark:text-red-400">
            Note: Only publicly available tokens on Bubblemaps can be displayed.
          </p>
        </div>
      )}

      {isAvailable && tokenAddress && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Token Bubble Map</h2>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Token:</span>
            <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">{tokenAddress}</code>
            <Link 
              href={`https://explorer.solana.com/address/${tokenAddress}`} 
              target="_blank"
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View in Explorer ↗
            </Link>
          </div>
          <div className="w-full h-[700px] border border-gray-200 dark:border-gray-700 rounded">
            <iframe 
              src={`https://app.bubblemaps.io/sol/token/${tokenAddress}?prevent_scroll_zoom`}
              className="w-full h-full border-none"
              title="Bubblemaps Token Visualization"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
            Visualization powered by Bubblemaps.io
          </p>
        </div>
      )}
      
      {/* Recent Searches */}
      {searchHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Recent Searches</h3>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((address, index) => (
              <button
                key={index}
                onClick={() => handleSearch(address)}
                className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 truncate max-w-xs"
                title={address}
              >
                {address.slice(0, 8)}...{address.slice(-4)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}