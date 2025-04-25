'use client';

import { useEffect, useState } from 'react';
import EnvSetupGuide from './EnvSetupGuide';
import { hasHeliusConfig } from '../../lib/utils/env';

export default function EnvChecker() {
  const [hasHeliusApiKey, setHasHeliusApiKey] = useState<boolean | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  
  useEffect(() => {
    // Check if the API key is configured using our utility
    setHasHeliusApiKey(hasHeliusConfig());
    
    // Debug log - remove in production
    console.log('Env check - API key found:', hasHeliusConfig());
  }, []);
  
  // Show loading indicator while checking
  if (hasHeliusApiKey === null) {
    return null;
  }
  
  // API key is configured, don't show anything
  if (hasHeliusApiKey === true) {
    return null;
  }
  
  return (
    <>
      <div className="p-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="text-lg font-medium text-yellow-800">Helius API Key Not Configured</h3>
        <div className="mt-2 text-sm text-yellow-700">
          <p>To use this application, you need to configure your Helius API key.</p>
          <button
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className="mt-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
          >
            {showSetupGuide ? 'Hide Setup Guide' : 'Show Setup Guide'}
          </button>
        </div>
      </div>
      
      {showSetupGuide && <EnvSetupGuide />}
    </>
  );
}