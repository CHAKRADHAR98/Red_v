'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function VisualizationPage() {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Blockchain Visualization</h1>
        <p className="text-gray-600 mb-6">
          Choose a visualization mode to get started exploring Solana's blockchain data.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Basic Visualization</h2>
            <p className="text-gray-600 mb-4">
              Simple wallet-to-wallet connections with basic transaction data.
              Best for getting started and exploring the core functionality.
            </p>
            <Link
              href="/visualize/basic"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Basic View
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Enhanced Visualization</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                New in Stage 2
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              Advanced visualization with protocol detection, name resolution,
              and interactive filtering. Recommended for detailed analysis.
            </p>
            <Link
              href="/visualize/enhanced"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Go to Enhanced View
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Select one of the visualization modes above</li>
          <li>Enter a Solana wallet address to visualize</li>
          <li>Search for additional addresses to expand the visualization</li>
          <li>Use filters and controls to customize the view</li>
          <li>Interact with the graph to explore relationships</li>
        </ol>
      </div>
      </div>
  );
}