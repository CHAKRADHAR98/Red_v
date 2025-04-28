import React from 'react';
import { TokenHolder } from '../../types/token';
import Link from 'next/link';

interface TokenHoldersProps {
  holders: TokenHolder[];
}

export default function TokenHolders({ holders }: TokenHoldersProps) {
  if (!holders || holders.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No holder data available for this token.
      </div>
    );
  }

  // Format percentage
  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

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

  // Get badge color based on owner type
  const getOwnerTypeBadge = (ownerType: string | undefined) => {
    if (!ownerType) return null;
    
    let colorClass = 'bg-gray-100 text-gray-800';
    
    switch (ownerType.toLowerCase()) {
      case 'exchange':
        colorClass = 'bg-blue-100 text-blue-800';
        break;
      case 'protocol':
        colorClass = 'bg-green-100 text-green-800';
        break;
      case 'user':
        colorClass = 'bg-yellow-100 text-yellow-800';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {ownerType}
      </span>
    );
  };

  return (
    <div>
      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {holders.map((holder, index) => (
              <tr key={holder.address} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-1">
                      <div className="text-sm font-medium text-gray-900">
                        {holder.name || (
                          <span className="font-mono">
                            {holder.address.substring(0, 6)}...{holder.address.substring(holder.address.length - 4)}
                          </span>
                        )}
                      </div>
                      <Link href={`/?address=${holder.address}`} className="text-xs text-blue-600 hover:text-blue-900">
                        View Wallet
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {formatAmount(holder.uiAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {formatPercentage(holder.percentage)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {getOwnerTypeBadge(holder.ownerType)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}