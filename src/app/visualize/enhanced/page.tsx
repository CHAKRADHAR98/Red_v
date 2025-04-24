'use client';

import { useState, useEffect, useRef } from 'react';
import WalletSearch from '../../../components/ui/WalletSearch';
import BasicGraph from '../../../components/visualization/BasicGraph';
import { useEnhancedWalletData } from '../../../hooks/useEnhancedWalletData';
import { Wallet, WalletConnection } from '../../../types/wallet';
import { generateWalletConnections } from '../../../lib/utils/transformers';
import EnvChecker from '../../../components/ui/EnvChecker';
import { showInfo, showError } from '../../../lib/utils/notifications';
import { 
    ChartBarIcon, 
    Cog6ToothIcon as CogIcon, 
    FunnelIcon as FilterIcon, 
    ArrowPathIcon as RefreshIcon, 
    TrashIcon 
  } from '@heroicons/react/24/outline';
export default function EnhancedVisualizePage() {
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [walletMap, setWalletMap] = useState<Map<string, Wallet>>(new Map());
  const [connectionList, setConnectionList] = useState<WalletConnection[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [minTransactions, setMinTransactions] = useState(1);
  const [maxNodes, setMaxNodes] = useState(50);
  const processedTransactions = useRef<Set<string>>(new Set());
  
  const { 
    wallet, 
    transactions, 
    accountNames,
    isLoading, 
    isError,
    refetch
  } = useEnhancedWalletData(searchAddress);

  // Handle the search action
  const handleSearch = (address: string) => {
    setSearchAddress(address);
    showInfo(`Loading wallet: ${address}`);
  };

  // Handle clearing the visualization
  const handleClearData = () => {
    setWalletMap(new Map());
    setConnectionList([]);
    processedTransactions.current = new Set();
    showInfo('Visualization cleared');
  };
  
  // Handle refreshing the data
  const handleRefresh = () => {
    refetch();
    showInfo('Refreshing data...');
  };

  // Process new wallet and transaction data when it arrives
  useEffect(() => {
    if (!wallet || !transactions || transactions.length === 0) return;

    try {
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
          if (!updatedWalletMap.has(conn.source) && accountNames && accountNames[conn.source]) {
            updatedWalletMap.set(conn.source, {
              address: conn.source,
              balance: 0,
              transactionCount: 1,
              name: accountNames[conn.source]
            });
          } else if (!updatedWalletMap.has(conn.source)) {
            updatedWalletMap.set(conn.source, {
              address: conn.source,
              balance: 0,
              transactionCount: 1
            });
          }
          
          if (!updatedWalletMap.has(conn.target) && accountNames && accountNames[conn.target]) {
            updatedWalletMap.set(conn.target, {
              address: conn.target,
              balance: 0,
              transactionCount: 1,
              name: accountNames[conn.target]
            });
          } else if (!updatedWalletMap.has(conn.target)) {
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
      showError('Error processing transaction data');
    }
  }, [wallet, transactions, accountNames]);

  // Apply filters to the connections and wallets
  const filteredConnections = connectionList.filter(conn => 
    conn.transactions >= minTransactions
  );
  
  // Get the most active connections
  const sortedConnections = [...filteredConnections].sort((a, b) => 
    b.transactions - a.transactions
  ).slice(0, maxNodes * 2);
  
  // Get the wallets involved in these connections
  const activeAddresses = new Set<string>();
  sortedConnections.forEach(conn => {
    activeAddresses.add(conn.source);
    activeAddresses.add(conn.target);
  });
  
  // Convert our Map and Array data structures to arrays for the graph component
  const filteredWallets = Array.from(walletMap.values())
    .filter(w => activeAddresses.has(w.address))
    .slice(0, maxNodes);

  return (
    <div className="space-y-6">
      <EnvChecker />
      
      <div className="p-4 bg-white rounded shadow">
        <h2 className="mb-4 text-xl font-semibold">Enhanced Visualization</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <WalletSearch onSearch={handleSearch} />
          </div>
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
          >
            <FilterIcon className="w-4 h-4 mr-1" />
            Filters
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 text-blue-700 bg-blue-100 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          >
            <RefreshIcon className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleClearData}
            className="px-4 py-2 text-red-700 bg-red-100 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
          >
            <TrashIcon className="w-4 h-4 mr-1" />
            Clear
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Search for multiple wallet addresses to build a network visualization.
        </p>
      </div>

      {isFilterPanelOpen && (
        <div className="p-4 bg-white rounded shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <CogIcon className="w-5 h-5 mr-2 text-gray-500" />
              Visualization Settings
            </h3>
            <button
              onClick={() => setIsFilterPanelOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Transactions Between Wallets
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={minTransactions}
                  onChange={(e) => setMinTransactions(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="ml-2 text-sm text-gray-600">{minTransactions}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Only show connections with at least this many transactions
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Nodes to Display
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={maxNodes}
                  onChange={(e) => setMaxNodes(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="ml-2 text-sm text-gray-600">{maxNodes}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Limit the visualization to this many nodes for better performance
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-blue-500" />
              <span className="text-sm text-gray-700">
                Showing {filteredWallets.length} wallets and {sortedConnections.length} connections
              </span>
            </div>
          </div>
        </div>
      )}

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

      {filteredWallets.length > 0 && (
        <div>
          <BasicGraph 
            wallets={filteredWallets} 
            connections={sortedConnections} 
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
              Node size represents wallet balance and transaction count. Line thickness represents transaction volume.
            </p>
          </div>
        </div>
      )}

      {filteredWallets.length === 0 && !isLoading && !isError && (
        <div className="p-8 text-center bg-white rounded shadow">
          <p className="text-gray-600">
            Search for a wallet address to start building your visualization.
          </p>
        </div>
      )}
      
      {/* Debug information */}
      {filteredWallets.length > 0 && (
        <div className="p-4 mt-4 text-xs bg-gray-100 rounded text-gray-700 font-mono">
          <h4 className="mb-2 font-semibold">Debug Info</h4>
          <p>Total Wallets: {walletMap.size}</p>
          <p>Displayed Wallets: {filteredWallets.length}</p>
          <p>Total Connections: {connectionList.length}</p>
          <p>Displayed Connections: {sortedConnections.length}</p>
          <p>Processed Transactions: {processedTransactions.current.size}</p>
        </div>
      )}
    </div>
  );
}