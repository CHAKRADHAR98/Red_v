import React from 'react';
import { Transaction, TransactionStatus } from '../../types/transaction';
import { format } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  onSelectTransaction?: (transaction: Transaction) => void;
}

export default function TransactionList({ 
  transactions, 
  onSelectTransaction 
}: TransactionListProps) {
  // Log transactions to inspect what data we're receiving
  console.log('Transactions in TransactionList:', transactions);

  // Helper function to get style for transaction type
  const getTypeStyle = (type?: string) => {
    if (!type) return 'bg-gray-100';
    
    switch(type) {
      case 'token_transfer':
        return 'bg-blue-100 text-blue-800';
      case 'sol_transfer':
        return 'bg-green-100 text-green-800';
      case 'swap':
        return 'bg-purple-100 text-purple-800';
      case 'nft_sale':
        return 'bg-pink-100 text-pink-800';
      case 'stake':
      case 'unstake':
        return 'bg-indigo-100 text-indigo-800';
      case 'liquidity_add':
      case 'liquidity_remove':
        return 'bg-cyan-100 text-cyan-800';
      case 'lending_deposit':
      case 'lending_withdraw':
      case 'lending_borrow':
      case 'lending_repay':
        return 'bg-emerald-100 text-emerald-800';
      case 'governance_vote':
        return 'bg-amber-100 text-amber-800';
      case 'bridge_transfer':
        return 'bg-lime-100 text-lime-800';
      default:
        return 'bg-gray-100';
    }
  };
  
  return (
    <div className="bg-white rounded shadow">
      <h2 className="p-4 text-xl font-semibold">Recent Transactions</h2>
      
      <div className="overflow-auto max-h-96">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Signature</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Time</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr 
                  key={transaction.signature}
                  onClick={() => onSelectTransaction?.(transaction)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm font-mono">
                    {transaction.signature.slice(0, 8)}...{transaction.signature.slice(-8)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {format(transaction.timestamp, 'MMM d, h:mm a')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs font-medium capitalize rounded-full ${getTypeStyle(transaction.type)}`}>
                      {transaction.type ? transaction.type.replace(/_/g, ' ') : 'unknown'}
                      {/* Debug: Show raw type */}
                      <span className="ml-1 text-xs text-gray-500">({JSON.stringify(transaction.type)})</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.status === TransactionStatus.SUCCESS 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-sm text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {transactions.length > 0 && (
        <div className="p-3 text-xs text-center text-gray-500 border-t">
          Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          <div className="mt-1 font-mono">
            Debug: Types present: {transactions.filter(tx => tx.type).length}/{transactions.length}
          </div>
        </div>
      )}
    </div>
  );
}