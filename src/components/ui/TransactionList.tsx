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
            {transactions.map((transaction) => (
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
                  <span className="px-2 py-1 text-xs font-medium capitalize rounded-full bg-gray-100">
                    {transaction.type?.replace(/_/g, ' ')}
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
            ))}
            
            {transactions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-sm text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}