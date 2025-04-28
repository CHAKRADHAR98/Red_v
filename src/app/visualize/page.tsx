'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ReactFlowProvider } from 'reactflow';
import { ThemeProvider } from '../../context/ThemeContext';
import EnvChecker from '../../components/ui/EnvChecker';
import Link from 'next/link';

// Dynamically import the SolanaVisualizer component to avoid SSR issues with ReactFlow
const SolanaVisualizer = dynamic(
  () => import('../../components/visualization/SolanaVisualizer'),
  { ssr: false } // This will only load the component on the client
);

export default function VisualizationPage() {
  const [isClient, setIsClient] = useState(false);

  // Used to ensure we only render the component on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="space-y-6">
      <EnvChecker />
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Solana Blockchain Visualizer</h1>
        <p className="text-gray-600 mb-6">
          Explore the Solana blockchain through an interactive graph visualization. Enter a wallet address to see its connections.
        </p>
        
        {/* Include a back button to the wallet explorer */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Wallet Explorer
          </Link>
        </div>
        
        {/* Visualization container */}
        <div className="h-[800px] border rounded-lg overflow-hidden">
          {isClient && (
            <ReactFlowProvider>
              <ThemeProvider>
                <SolanaVisualizer />
              </ThemeProvider>
            </ReactFlowProvider>
          )}
          {!isClient && (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border text-sm">
          <h3 className="font-medium mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Enter a Solana wallet address in the search box</li>
            <li>Click on nodes to see more details about a wallet</li>
            <li>Double-click a node to explore its connections</li>
            <li>Use the controls to zoom and pan the visualization</li>
            <li>Click the history button to view previously searched addresses</li>
          </ol>
        </div>
      </div>
    </div>
  );
}