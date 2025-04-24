'use client';

import { useState, useEffect, useRef } from 'react';
import WalletSearch from '../../../components/ui/WalletSearch';
import BasicGraph from '../../../components/visualization/BasicGraph';
import { useWalletData } from '../../../hooks/useWalletData';
import { Wallet, WalletConnection } from '../../../types/wallet';
import { generateWalletConnections } from '../../../lib/utils/transformers';
import EnvChecker from '../../../components/ui/EnvChecker';

export default function BasicVisualizePage() {
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
    if (!wallet) return;
    
    try {
      // Add wallet to list if not already present
      const walletExists = walletMap.has(wallet.address);
      
      if (!walletExists) {
        const updatedMap = new Map(walletMap);
        updatedMap.set(wallet.address, wallet);
        setWalletMap(updatedMap);
      }

      // Generate connections from transactions
      const newConnections = generateWalletConnections(transactions);
      
      if (newConnections.length === 0) {
        console.log('No connections generated from transactions. Transaction count:', transactions.length);
        // For visualization testing, create at least one dummy connection if none were found
        if (transactions.length > 0 && walletMap.size === 0) {
          const dummyConnection = {
            source: wallet.address,
            target: 'dummy-target',
            value: 1,
            transactions: 1,
            lastInteraction: new Date()
          };
          
          const updatedMap = new Map(walletMap);
          updatedMap.set('dummy-target', {
            address: 'dummy-target',
            balance: 0,
            transactionCount: 1
          });
          setWalletMap(updatedMap);
          setConnectionList([dummyConnection]);
          
          return;
        }
      }
      
      // Add wallet addresses from connections to our list
      const addressSet = new Set<string>();
      
      // Add the source and target addresses to our set
      newConnections.forEach(conn => {
        addressSet.add(conn.source);
        addressSet.add(conn.target);
      });
      
      // Create placeholder wallets for any new addresses
      const newAddresses = Array.from(addressSet).filter(
        addr => !walletMap.has(addr) && addr !== wallet.address
      );
      
      if (newAddresses.length > 0) {
        const updatedMap = new Map(walletMap);
        
        newAddresses.forEach(addr => {
          updatedMap.set(addr, {
            address: addr,
            balance: 0, // Placeholder
          });
        });
        
        setWalletMap(updatedMap);
      }
      
      // Update connections only if we have new ones
      if (newConnections.length > 0) {
        setConnectionList(prev => {
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
    } catch (error) {
      console.error('Error processing wallet data for visualization:', error);
    }
  }, [wallet, transactions]);

  // Convert our Map and Array data structures to arrays for the graph component
  const walletArray = Array.from(walletMap.values());

  return (
    <div className="space-y-6">
      <EnvChecker />
      
      <div className="p-4 bg-white rounded shadow">
        <h2 className="mb-4 text-xl font-semibold">Basic Wallet Visualization</h2>
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
        </div>
      )}
    </div>
  );
}