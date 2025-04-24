'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getEnhancedTransactions } from '../../../services/helius';
import { transformHeliusTransaction } from '../../../lib/utils/transformers';
import { Transaction, TransactionStatus } from '../../../types/transaction';
import Link from 'next/link';
import { 
    ArrowLeftIcon, 
    ArrowTopRightOnSquareIcon as ExternalLinkIcon, 
    ClockIcon, 
    CheckCircleIcon, 
    XCircleIcon 
  } from '@heroicons/react/24/outline';import { format } from 'date-fns';

export default function TransactionPage() {
  const { signature } = useParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransaction() {
      if (!signature || typeof signature !== 'string') {
        setError('Invalid transaction signature');
        setLoading(false);
        return;
      }

      try {
        const transactions = await getEnhancedTransactions([signature]);
        if (transactions.length === 0) {
          setError('Transaction not found');
          setLoading(false);
          return;
        }

        const transformedTx = transformHeliusTransaction(transactions[0]);
        setTransaction(transformedTx);
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError('Failed to fetch transaction details');
      } finally {
        setLoading(false);
      }
    }

    fetchTransaction();
  }, [signature]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-8 h-8 border-4 rounded-full border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
        <p className="ml-2">Loading transaction details...</p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Wallet Explorer
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-2">{error || 'Failed to load transaction details'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Wallet Explorer
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Transaction Details</h1>
            <div className="flex items-center">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                transaction.status === TransactionStatus.SUCCESS
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {transaction.status === TransactionStatus.SUCCESS ? (
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                ) : (
                  <XCircleIcon className="h-4 w-4 mr-1" />
                )}
                {transaction.status}
              </span>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600 font-mono break-all">{transaction.signature}</p>
        </div>

        {/* Basic Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-medium text-gray-900">Basic Information</h2>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Timestamp</p>
              <div className="flex items-center mt-1">
                <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                <p className="text-sm text-gray-800">
                  {format(transaction.timestamp, 'PPpp')}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Block</p>
              <p className="text-sm text-gray-800 mt-1">{transaction.slot.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fee</p>
              <p className="text-sm text-gray-800 mt-1">{(transaction.fee / 1e9).toFixed(6)} SOL</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="text-sm text-gray-800 mt-1 capitalize">
                {transaction.type?.replace(/_/g, ' ') || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Protocol Info */}
        {(transaction.protocol || transaction.protocolCategory) && (
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
            <h2 className="text-base font-medium text-gray-900">Protocol Information</h2>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {transaction.protocol && (
                <div>
                  <p className="text-xs text-gray-500">Protocol</p>
                  <p className="text-sm text-gray-800 font-medium mt-1">{transaction.protocol}</p>
                </div>
              )}
              {transaction.protocolCategory && (
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm text-gray-800 mt-1">{transaction.protocolCategory}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accounts */}
        {transaction.accounts && transaction.accounts.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-medium text-gray-900">Accounts Involved</h2>
            <div className="mt-2 overflow-auto max-h-64">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transaction.accounts.map((account, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900 truncate max-w-xs">
                          {account}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Link 
                          href={`/?address=${account}`}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          View Wallet
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Program IDs */}
        {transaction.programIds && transaction.programIds.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-medium text-gray-900">Programs</h2>
            <div className="mt-2 grid grid-cols-1 gap-2">
              {transaction.programIds.map((programId, index) => (
                <div key={index} className="bg-gray-50 px-3 py-2 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-gray-900 truncate">{programId}</span>
                    <Link 
                      href={`https://explorer.solana.com/address/${programId}`}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Token Transfers */}
        {transaction.tokenTransfers && transaction.tokenTransfers.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-medium text-gray-900">Token Transfers</h2>
            <div className="mt-2 space-y-4">
              {transaction.tokenTransfers.map((transfer, index) => (
                <div key={index} className="bg-gray-50 rounded-md p-4">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-2 md:mb-0">
                      <p className="text-xs text-gray-500">From</p>
                      <Link 
                        href={`/?address=${transfer.fromUserAccount}`}
                        className="text-sm font-mono text-blue-600 hover:text-blue-900 truncate block max-w-xs"
                      >
                        {transfer.fromUserAccount}
                      </Link>
                    </div>
                    <div className="mb-2 md:mb-0">
                      <p className="text-xs text-gray-500">To</p>
                      <Link 
                        href={`/?address=${transfer.toUserAccount}`}
                        className="text-sm font-mono text-blue-600 hover:text-blue-900 truncate block max-w-xs"
                      >
                        {transfer.toUserAccount}
                      </Link>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-medium">
                        {transfer.amount.toLocaleString()} {transfer.symbol || 'tokens'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External Links */}
        <div className="px-6 py-4">
          <h2 className="text-base font-medium text-gray-900">External Links</h2>
          <div className="mt-2 space-y-2">
            <a 
              href={`https://explorer.solana.com/tx/${transaction.signature}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLinkIcon className="h-4 w-4 mr-1" />
              View on Solana Explorer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}