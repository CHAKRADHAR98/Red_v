import React from 'react';
import { TokenTransfer } from '../../types/token';
import { format } from 'date-fns';
import Link from 'next/link';

interface TokenTransfersProps {
  transfers: TokenTransfer[];
}

export default function TokenTransfers({ transfers }: TokenTransfersProps) {
  if (!transfers || transfers.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No transfer data available for this token.
      </div>
    );
  }

  // Format amount with appropriate precision
  const formatAmount = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(2)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)}K`;
    } else {
      return amount.toLocaleString();
    }
  };

  // Format address for display
  const formatAddress = (address: string, name?: string) => {
    if (name) {
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs font-mono text-gray-500">
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </span>
        </div>
      );
    }
    
    return (
      <span className="font-mono">
        {address.substring(0, 6)}...{address.substring(address.length - 4)}
      </span>
    );
  };

  return (
    <div>
      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transfers.map((transfer) => (
              <tr key={transfer.signature} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(transfer.timestamp, 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/?address=${transfer.fromAddress}`} className="text-blue-600 hover:text-blue-900">
                    {formatAddress(transfer.fromAddress, transfer.fromName)}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/?address=${transfer.toAddress}`} className="text-blue-600 hover:text-blue-900">
                    {formatAddress(transfer.toAddress, transfer.toName)}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {formatAmount(transfer.uiAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <a 
                    href={`https://explorer.solana.com/tx/${transfer.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}