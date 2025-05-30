import React from 'react';
import { Wallet } from '../../types/wallet';
import { formatDistanceToNow } from 'date-fns';

interface WalletInfoProps {
  wallet: Wallet;
}

export default function WalletInfo({ wallet }: WalletInfoProps) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="mb-2 text-xl font-semibold">Wallet Information</h2>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-500">Address</h3>
        <p className="text-sm font-mono break-all">{wallet.address}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Balance</h3>
          <p className="text-lg font-medium">{(wallet.balance / 1e9).toFixed(4)} SOL</p>
        </div>

        {wallet.label && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Label</h3>
            <p className="text-lg font-medium">{wallet.label}</p>
          </div>
        )}

        {wallet.type && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Type</h3>
            <p className="text-lg font-medium capitalize">{wallet.type}</p>
          </div>
        )}

        {wallet.firstActivityAt && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">First Activity</h3>
            <p className="text-sm">{formatDistanceToNow(wallet.firstActivityAt)} ago</p>
          </div>
        )}

        {wallet.lastActivityAt && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Activity</h3>
            <p className="text-sm">{formatDistanceToNow(wallet.lastActivityAt)} ago</p>
          </div>
        )}
      </div>

      {wallet.tokenBalances && wallet.tokenBalances.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-medium text-gray-500">Token Balances</h3>
          <div className="overflow-auto max-h-40">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Token</th>
                  <th className="px-3 py-2 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wallet.tokenBalances.map((token, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">
                      {token.symbol || token.mint.slice(0, 8)}...
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-gray-500">
                      {token.uiAmount?.toLocaleString() || 
                        (token.amount / Math.pow(10, token.decimals)).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}