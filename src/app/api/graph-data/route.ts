import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { getWalletTransactions } from '../../../services/helius-enriched';

// Define types for React Flow graph data
interface NodeData { 
  label: string; 
  type?: string;
  details?: any;
}

interface Node {
  id: string;
  position: { x: number; y: number; };
  data: NodeData;
  type?: string;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

/**
 * API route to fetch and transform wallet transaction data for visualization
 */
export async function GET(request: NextRequest) {
  try {
    // Get the wallet address from query params
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    
    // Limit how many transactions to fetch (default 50, max 100)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const topN = parseInt(searchParams.get('topN') || '10'); // Number of top connections to show

    if (!address) {
      return NextResponse.json({ error: 'Address query parameter is required' }, { status: 400 });
    }

    // Validate wallet address format
    try {
      new PublicKey(address);
    } catch (e) {
      return NextResponse.json({ error: `Invalid Solana address: ${address}` }, { status: 400 });
    }

    // Fetch transactions for this wallet
    console.log(`Fetching transactions for ${address}...`);
    const transactions = await getWalletTransactions(address, limit);
    
    // If no transactions, return empty graph
    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ nodes: [], edges: [] });
    }
    
    console.log(`Found ${transactions.length} transactions.`);

    // Track connections between wallets
    const connections = new Map<string, { totalSOL: number, count: number }>();
    
    // Process transactions to extract connections
    transactions.forEach(tx => {
      // Check for native SOL transfers
      if (tx.nativeTransfers) {
        tx.nativeTransfers.forEach((transfer: any) => {
          if (transfer.fromUserAccount === address && transfer.toUserAccount && transfer.amount) {
            const dest = transfer.toUserAccount;
            const amount = transfer.amount; // In lamports
            
            // Update or create connection
            const existing = connections.get(dest);
            if (existing) {
              existing.totalSOL += amount;
              existing.count += 1;
            } else {
              connections.set(dest, { totalSOL: amount, count: 1 });
            }
          }
        });
      }
    });

    // If using token transfers and no native transfers found, check token transfers
    if (connections.size === 0) {
      transactions.forEach(tx => {
        if (tx.tokenTransfers) {
          tx.tokenTransfers.forEach((transfer: any) => {
            if (transfer.fromUserAccount === address && transfer.toUserAccount) {
              const dest = transfer.toUserAccount;
              // Since these are token transfers, we'll just count them rather than tracking amount
              // We could add token-specific logic later
              
              const existing = connections.get(dest);
              if (existing) {
                existing.count += 1;
              } else {
                connections.set(dest, { totalSOL: 0, count: 1 });
              }
            }
          });
        }
      });
    }

    // If still no connections, look at accounts involved in transactions
    if (connections.size === 0) {
      transactions.forEach(tx => {
        if (tx.accounts) {
          // Get other accounts involved (not the source wallet)
          const otherAccounts = tx.accounts.filter((acc: string) => acc !== address);
          
          // Add a connection to each account
          otherAccounts.forEach((account: string) => {
            const existing = connections.get(account);
            if (existing) {
              existing.count += 1;
            } else {
              connections.set(account, { totalSOL: 0, count: 1 });
            }
          });
        }
      });
    }

    // Sort connections by total SOL (or count if SOL is 0) and take top N
    const sortedConnections = Array.from(connections.entries())
      .map(([destAddress, data]) => ({ 
        address: destAddress, 
        totalSOL: data.totalSOL / 1e9, // Convert lamports to SOL
        count: data.count 
      }))
      .sort((a, b) => {
        // Sort by SOL amount if available, otherwise by count
        if (a.totalSOL > 0 || b.totalSOL > 0) {
          return b.totalSOL - a.totalSOL;
        }
        return b.count - a.count;
      })
      .slice(0, topN);

    // Generate nodes and edges
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeIds = new Set<string>();

    // Add the source wallet node
    nodes.push({ 
      id: address, 
      position: { x: 100, y: 400 }, // Center position
      data: { 
        label: `${address.substring(0, 4)}...${address.substring(address.length - 4)}`,
        type: 'wallet',
        details: { address, isSource: true }
      },
      type: 'custom' 
    });
    nodeIds.add(address);

    // Add nodes and edges for connected wallets
    sortedConnections.forEach((connection, index) => {
      const destAddress = connection.address;
      
      if (!nodeIds.has(destAddress)) {
        // Create a new node for this wallet
        nodes.push({ 
          id: destAddress, 
          position: { x: 600, y: 100 + index * (600 / Math.max(1, topN-1)) }, // Arrange in a vertical line
          data: {
            label: `${destAddress.substring(0, 4)}...${destAddress.substring(destAddress.length - 4)}`,
            type: 'wallet',
            details: { address: destAddress }
          },
          type: 'custom' 
        });
        nodeIds.add(destAddress);
      }
      
      // Add edge from source to this wallet
      let edgeLabel = '';
      if (connection.totalSOL > 0) {
        // Format with proper decimals
        edgeLabel = `${connection.totalSOL.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4
        })} SOL`;
      } else {
        edgeLabel = `${connection.count} txns`;
      }
      
      edges.push({
        id: `edge-${address}-${destAddress}`,
        source: address,
        target: destAddress,
        label: edgeLabel,
        animated: true
      });
    });

    // Return the graph data
    return NextResponse.json({ nodes, edges });
  } catch (error) {
    console.error('Error generating graph data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}