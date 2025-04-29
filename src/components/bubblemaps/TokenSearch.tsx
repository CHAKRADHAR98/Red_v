import React, { useState } from 'react';

interface TokenSearchProps {
  onSearch: (address: string) => void;
  isLoading: boolean;
}

export default function TokenSearch({ onSearch, isLoading }: TokenSearchProps) {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onSearch(address.trim());
    }
  };

  return (
    <div className="my-4">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter Solana token address"
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !address.trim()}
          className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
        >
          {isLoading ? 'Checking...' : 'View Bubblemap'}
        </button>
      </form>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Enter a token mint address to view its holder distribution visualization.
      </p>
    </div>
  );
}