'use client';

import { useState, useEffect } from 'react';
import WalletSearch from '../../components/ui/WalletSearch';
import BasicGraph from '../../components/visualization/BasicGraph';
import { useWalletData } from '../../hooks/useWalletData';
import { Wallet, WalletConnection } from '../../types/wallet';
import { generateWalletConnections } from '../../lib/utils/transformers';
import EnvChecker from '../../components/ui/EnvChecker';

export default function VisualizePage() {
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [connections, setConnections] = useState<WalletConnection[]>([]);

  const { 
    wallet, 
    transactions, 
    isLoading, 
    isError 
  } = useWalletData(searchAddress);

  // Update wallets and connections when data changes
  useEffect(() => {
    if (wallet) {
      // Add wallet to list if not already present
      setWallets(prevWallets => {
        const exists = prevWallets.some(w => w.address === wallet.address);
        if (!exists) {
          return [...prevWallets, wallet];
        }
        return prevWallets;
      });

      // Generate connections from transactions
      const newConnections = generateWalletConnections(transactions);

      // Add wallet addresses from connections to our list
      const addressSet = new Set<string>();

      // Add the source and target addresses to our set
      newConnections.forEach(conn => {
        addressSet.add(conn.source);
        addressSet.add(conn.target);
      });

      // Create placeholder wallets for any new addresses
      const newAddresses = Array.from(addressSet).filter(
        addr => !wallets.some(w => w.address === addr) && addr !== wallet.address
      );

      if (newAddresses.length > 0) {
        const newWallets = newAddresses.map(addr => ({
          address: addr,
          balance: 0, // Placeholder
        }));

        setWallets(prev => [...prev, ...newWallets]);
      }

      // Update connections
      setConnections(prev => {
        const uniqueConns = [...prev];

        newConnections.forEach(newConn => {
          const existingIndex = uniqueConns.findIndex(
            conn => conn.source === newConn.source && conn.target === newConn.target
          );

          if (existingIndex >= 0) {
            // Update existing connection
            uniqueConns[existingIndex] = {
              ...uniqueConns[existingIndex],
              value: uniqueConns[existingIndex].value + newConn.value,
              transactions: uniqueConns[existingIndex].transactions + newConn.transactions,
              lastInteraction: new Date(Math.max(
                uniqueConns[existingIndex].lastInteraction.getTime(),
                newConn.lastInteraction.getTime()
              )),
            };
          } else {
            // Add new connection
            uniqueConns.push(newConn);
          }
        });

        return uniqueConns;
      });
    }
  }, [wallet, transactions]);

  const handleSearch = (address: string) => {
    setSearchAddress(address);
  };

  const handleClearData = () => {
    setWallets([]);
    setConnections([]);
  };

  return (
    <div className="space-y-6">
      <EnvChecker />

      <div className="p-4 bg-white rounded shadow">
        <h2 className="mb-4 text-xl font-semibold">Search for Wallets to Visualize</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <WalletSearch onSearch={handleSearch} />
          </div>
          <button
            onClick={handleClearData}
            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Clear Data
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Search for multiple wallet addresses to build a network visualization.
        </p>
      </div>

      {isLoading && (
        <div className="p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 rounded-full border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading wallet data...</p>
        </div>
      )}

      {isError && (
        <div className="p-4 bg-red-50 rounded shadow">
          <p className="text-red-600">
            Error loading wallet data. Please check the address and try again.
          </p>
        </div>
      )}

      {wallets.length > 0 && (
        <div>
          <BasicGraph 
            wallets={wallets} 
            connections={connections} 
            width={800} 
            height={600} 
          />
          <div className="p-4 mt-4 bg-white rounded shadow">
            <h3 className="mb-2 text-lg font-medium">Visualization Legend</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 rounded-full bg-gray-400"></div>
                <span>Unknown</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 rounded-full bg-blue-400"></div>
                <span>Exchange</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 rounded-full bg-green-400"></div>
                <span>Protocol</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 rounded-full bg-yellow-400"></div>
                <span>User</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 rounded-full bg-red-400"></div>
                <span>Contract</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Node size represents wallet balance. Line thickness represents transaction volume.
            </p>
          </div>
        </div>
      )}

      {wallets.length === 0 && !isLoading && !isError && (
        <div className="p-8 text-center bg-white rounded shadow">
          <p className="text-gray-600">
            Search for a wallet address to start building your visualization.
          </p>
        </div>
      )}
    </div>
  );
}