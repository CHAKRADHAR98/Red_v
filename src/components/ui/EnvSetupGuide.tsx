import React from 'react';
import { ArrowTopRightOnSquareIcon as ExternalLinkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function EnvSetupGuide() {
  return (
    <div className="p-6 bg-white rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Setup Guide</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              To use this application, you need to set up a Helius API key. Follow the steps below to get started.
            </p>
          </div>
        </div>
      </div>
      
      <ol className="space-y-6">
        <li className="flex">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white">
              1
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium">Create a Helius Account</h3>
            <p className="mt-1 text-gray-600">
              Visit the Helius Developer Portal and sign up for an account
            </p>
            <Link 
              href="https://dev.helius.xyz/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              Helius Developer Portal
              <ExternalLinkIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </li>
        
        <li className="flex">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white">
              2
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium">Create an API Key</h3>
            <p className="mt-1 text-gray-600">
              After creating an account, generate an API key from your dashboard
            </p>
          </div>
        </li>
        
        <li className="flex">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white">
              3
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium">Configure Environment Variables</h3>
            <p className="mt-1 text-gray-600">
              Create a <code className="px-1 py-0.5 bg-gray-100 rounded">.env.local</code> file in the project root with your API key
            </p>
            <div className="mt-2 p-3 bg-gray-800 text-white rounded-md text-sm font-mono">
              <p>HELIUS_API_KEY=your_api_key_here</p>
              <p>NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your_api_key_here</p>
            </div>
          </div>
        </li>
        
        <li className="flex">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white">
              4
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium">Restart the Development Server</h3>
            <p className="mt-1 text-gray-600">
              After setting up your environment variables, restart the server:
            </p>
            <div className="mt-2 p-3 bg-gray-800 text-white rounded-md text-sm font-mono">
              <p>npm run dev</p>
            </div>
          </div>
        </li>
      </ol>
      
      <div className="mt-6 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium mb-2">Need More Help?</h3>
        <p className="text-gray-600">
          Check out the Helius documentation for more information on available endpoints and features.
        </p>
        <Link 
          href="https://docs.helius.dev/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          Helius Documentation
          <ExternalLinkIcon className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}