import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Transaction } from '../../types/transaction';

interface TransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionModal({ 
  transaction, 
  isOpen, 
  onClose 
}: TransactionModalProps) {
  if (!transaction) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <DocumentTextIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Transaction Details
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 font-mono break-all">
                          {transaction.signature}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="max-h-96 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="rounded-md bg-gray-50 p-4 shadow-sm">
                          <h4 className="text-sm font-medium text-gray-900">Basic Information</h4>
                          <div className="mt-2 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Timestamp</p>
                              <p className="text-sm font-medium">
                                {transaction.timestamp.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Status</p>
                              <p className={`text-sm font-medium ${
                                transaction.status === 'success' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.status}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Block</p>
                              <p className="text-sm font-medium">{transaction.slot.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Fee</p>
                              <p className="text-sm font-medium">
                                {(transaction.fee / 1e9).toFixed(6)} SOL
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {transaction.accounts && transaction.accounts.length > 0 && (
                          <div className="rounded-md bg-gray-50 p-4 shadow-sm">
                            <h4 className="text-sm font-medium text-gray-900">Accounts Involved</h4>
                            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                              {transaction.accounts.map((account, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="text-xs font-mono text-gray-600 truncate">
                                    {account}
                                  </span>
                                  <span className="text-xs text-gray-500">Account {index + 1}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {transaction.tokenTransfers && transaction.tokenTransfers.length > 0 && (
                          <div className="rounded-md bg-gray-50 p-4 shadow-sm">
                            <h4 className="text-sm font-medium text-gray-900">Token Transfers</h4>
                            <div className="mt-2 space-y-3 max-h-48 overflow-y-auto">
                              {transaction.tokenTransfers.map((transfer, index) => (
                                <div key={index} className="border-l-2 border-blue-500 pl-3">
                                  <div className="text-xs text-gray-500">From</div>
                                  <div className="text-xs font-mono truncate">{transfer.fromUserAccount}</div>
                                  <div className="text-xs text-gray-500 mt-1">To</div>
                                  <div className="text-xs font-mono truncate">{transfer.toUserAccount}</div>
                                  <div className="text-xs text-gray-500 mt-1">Amount</div>
                                  <div className="text-xs font-medium">
                                    {transfer.amount.toLocaleString()} {transfer.symbol || 'tokens'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {transaction.programIds && transaction.programIds.length > 0 && (
                          <div className="rounded-md bg-gray-50 p-4 shadow-sm">
                            <h4 className="text-sm font-medium text-gray-900">Programs Involved</h4>
                            <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                              {transaction.programIds.map((program, index) => (
                                <div key={index} className="text-xs font-mono text-gray-600 truncate">
                                  {program}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      window.open(`https://explorer.solana.com/tx/${transaction.signature}`, '_blank');
                    }}
                  >
                    View in Explorer
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}