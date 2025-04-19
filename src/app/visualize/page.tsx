'use client';

import { useState, useEffect, useRef } from 'react';
import WalletSearch from '../../components/ui/WalletSearch';
import BasicGraph from '../../components/visualization/BasicGraph';
import { useWalletData } from '../../hooks/useWalletData';
import { Wallet, WalletConnection } from '../../types/wallet';
import { generateWalletConnections } from '../../lib/utils/transformers';
import EnvChecker from '../../components/ui/EnvChecker';

export default function VisualizePage() {
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [walletMap, setWalletMap] = useState<Map<string, Wallet>>(new Map());
  const [connectionList, setConnectionList] = useState<WalletConnection[]>([]);
  const processedTransactions = useRef<Set<string>>(new Set());
  
  const { 
    wallet, 
    transactions, 
    isLoading, 
    isError 
  } = useWalletData(searchAddress);

  // Handle the search action
  const handleSearch = (address: string) => {
    setSearchAddress(address);
  };

  // Handle clearing the visualization
  const handleClearData = () => {
    setWalletMap(new Map());
    setConnectionList([]);
    processedTransactions.current = new Set();
  };

  // Process new wallet and transaction data when it arrives
  useEffect(() => {
    if (!wallet || !transactions || transactions.length === 0) return;

    // Add the current wallet to our map if not already present
    const updatedWalletMap = new Map(walletMap);
    if (!updatedWalletMap.has(wallet.address)) {
      updatedWalletMap.set(wallet.address, wallet);
      setWalletMap(updatedWalletMap);
    }

    // Process only new transactions to avoid duplicate work
    const newTransactions = transactions.filter(tx => 
      !processedTransactions.current.has(tx.signature)
    );

    if (newTransactions.length === 0) return;

    try {
      // Mark these transactions as processed
      newTransactions.forEach(tx => {
        processedTransactions.current.add(tx.signature);
      });

      // Generate connections from the new transactions
      const newConnections = generateWalletConnections(newTransactions);
      
      if (newConnections.length === 0 && updatedWalletMap.size === 1) {
        // Create at least one dummy connection for visualization if none found
        const dummyTarget = `${wallet.address}-peer`;
        const dummyConnection = {
          source: wallet.address,
          target: dummyTarget,
          value: 1,
          transactions: 1,
          lastInteraction: new Date()
        };
        
        // Add the dummy target wallet
        updatedWalletMap.set(dummyTarget, {
          address: dummyTarget,
          balance: 0,
          transactionCount: 1,
          label: "Connected Peer"
        });
        
        setWalletMap(updatedWalletMap);
        setConnectionList(prev => [...prev, dummyConnection]);
        return;
      }

      // Process connections and add new wallets
      if (newConnections.length > 0) {
        // Add any new wallets from connections
        newConnections.forEach(conn => {
          if (!updatedWalletMap.has(conn.source)) {
            updatedWalletMap.set(conn.source, {
              address: conn.source,
              balance: 0,
              transactionCount: 1
            });
          }
          
          if (!updatedWalletMap.has(conn.target)) {
            updatedWalletMap.set(conn.target, {
              address: conn.target,
              balance: 0,
              transactionCount: 1
            });
          }
        });
        
        // Update connections, merging with existing ones
        setConnectionList(prevConnections => {
          const result = [...prevConnections];
          
          newConnections.forEach(newConn => {
            const existingIndex = result.findIndex(
              conn => conn.source === newConn.source && conn.target === newConn.target
            );
            
            if (existingIndex >= 0) {
              // Update existing connection
              result[existingIndex] = {
                ...result[existingIndex],
                value: result[existingIndex].value + newConn.value,
                transactions: result[existingIndex].transactions + newConn.transactions,
                lastInteraction: new Date(Math.max(
                  result[existingIndex].lastInteraction.getTime(),
                  newConn.lastInteraction.getTime()
                ))
              };
            } else {
              // Add new connection
              result.push(newConn);
            }
          });
          
          return result;
        });
        
        // Update the wallet map if we added new wallets
        setWalletMap(updatedWalletMap);
      }
    } catch (error) {
      console.error('Error processing transaction data:', error);
    }
  }, [wallet, transactions]);

  // Convert our Map and Array data structures to arrays for the graph component
  const walletArray = Array.from(walletMap.values());

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

      {walletArray.length > 0 && (
        <div>
          <BasicGraph 
            wallets={walletArray} 
            connections={connectionList} 
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

      {walletArray.length === 0 && !isLoading && !isError && (
        <div className="p-8 text-center bg-white rounded shadow">
          <p className="text-gray-600">
            Search for a wallet address to start building your visualization.
          </p>
        </div>
      )}
      
      {/* Debug information */}
      {walletArray.length > 0 && (
        <div className="p-4 mt-4 text-xs bg-gray-100 rounded text-gray-700 font-mono">
          <h4 className="mb-2 font-semibold">Debug Info</h4>
          <p>Wallets: {walletArray.length}</p>
          <p>Connections: {connectionList.length}</p>
          <p>Processed Transactions: {processedTransactions.current.size}</p>
        </div>
      )}
    </div>
  );
}