const fs = require('fs');
const path = require('path');

// Get the API key from command line arguments
const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Please provide your Helius API key as an argument:');
  console.error('node update-env.js YOUR_API_KEY');
  process.exit(1);
}

// Path to .env.local file
const envPath = path.join(__dirname, '.env.local');

// Create or update the .env.local file
const envContent = `# Helius API Key
HELIUS_API_KEY=${apiKey}
NEXT_PUBLIC_HELIUS_API_KEY=${apiKey}
NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=${apiKey}
`;

// Write the file
fs.writeFileSync(envPath, envContent);

console.log('.env.local file has been updated with your Helius API key');
console.log('Please restart your Next.js server for the changes to take effect');