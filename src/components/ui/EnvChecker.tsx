'use client';

import { useEffect, useState } from 'react';

export default function EnvChecker() {
  const [hasHeliusApiKey, setHasHeliusApiKey] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if the API key is configured
    const apiUrl = process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
    setHasHeliusApiKey(!!apiUrl && apiUrl.includes('api-key='));
  }, []);
  
  if (hasHeliusApiKey === true) {
    return null; // API key is configured, don't show anything
  }
  
  // Show loading indicator while checking
  if (hasHeliusApiKey === null) {
    return null;
  }
  
  return (
    <div className="p-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-md">
      <h3 className="text-lg font-medium text-yellow-800">Helius API Key Not Configured</h3>
      <div className="mt-2 text-sm text-yellow-700">
        <p>To use this application, you need to configure your Helius API key:</p>
        <ol className="mt-2 ml-6 list-decimal">
          <li className="mt-1">Sign up for a Helius API key at <a href="https://dev.helius.xyz/" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Helius Developer Portal</a></li>
          <li className="mt-1">Create a <code className="px-1 py-0.5 bg-gray-100 rounded">.env.local</code> file in the project root directory</li>
          <li className="mt-1">Add the following lines to the file:</li>
        </ol>
        <pre className="p-3 mt-2 overflow-x-auto text-xs bg-gray-800 rounded text-gray-200">
          HELIUS_API_KEY=your_api_key_here{'\n'}
          NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your_api_key_here
        </pre>
        <p className="mt-3">After making these changes, restart the development server.</p>
      </div>
    </div>
  );
}