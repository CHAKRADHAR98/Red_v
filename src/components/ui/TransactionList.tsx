import React, { useState } from 'react';
import { Transaction, TransactionStatus } from '../../types/transaction';
import { format } from 'date-fns';
import { DocumentTextIcon, ArrowTopRightOnSquareIcon as ExternalLinkIcon } from '@heroicons/react/24/outline';
import TransactionModal from '../transaction/TransactionModal';
import Link from 'next/link';

interface TransactionListProps {
  transactions: Transaction[];
  onSelectTransaction?: (transaction: Transaction) => void;
}

export default function TransactionList({ 
  transactions,
  onSelectTransaction
}: TransactionListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
    if (onSelectTransaction) {
      onSelectTransaction(transaction);
    }
  };

  return (
    <>
      <div className="bg-white rounded shadow">
        <h2 className="p-4 text-xl font-semibold">Recent Transactions</h2>
        
        <div className="overflow-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Signature</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr 
                  key={transaction.signature}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm font-mono">
                    <Link href={`/transaction/${transaction.signature}`} className="text-blue-600 hover:underline">
                      {transaction.signature.slice(0, 8)}...{transaction.signature.slice(-8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {format(transaction.timestamp, 'MMM d, h:mm a')}
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
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleTransactionClick(transaction)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200"
                      >
                        <DocumentTextIcon className="w-3 h-3 mr-1" />
                        Details
                      </button>
                      <a
                        href={`https://explorer.solana.com/tx/${transaction.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200"
                      >
                        <ExternalLinkIcon className="w-3 h-3 mr-1" />
                        Explorer
                      </a>
                    </div>
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

      <TransactionModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}