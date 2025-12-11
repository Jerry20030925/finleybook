'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Merchant } from '@/types/rebate';
import { useRouter } from 'next/navigation';

interface PreTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    merchant: Merchant | null;
    userId: string; // Needed for tracking link generation
}

export default function PreTransactionModal({ isOpen, onClose, merchant, userId }: PreTransactionModalProps) {
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    if (!merchant) return null;

    const handleContinue = async () => {
        setIsSubmitting(true);

        try {
            // 1. Create a "Pending" transaction in the user's budget (Accounting Hook)
            // This would be an API call to your existing transaction creation endpoint
            // await createPendingTransaction({ amount, merchant: merchant.name });

            // 2. Generate Tracking Link
            // In a real app, you might want to sign this or fetch it from the server to keep secrets safe
            // But for now, we'll hit our tracking API endpoint

            const trackingUrl = `/api/track?mid=${merchant.id}`;

            // 3. Redirect
            window.open(trackingUrl, '_blank');
            onClose();
        } catch (error) {
            console.error('Error starting transaction:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2"
                                >
                                    <span>Activate Cashback for</span>
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{merchant.name}</span>
                                </Dialog.Title>

                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        To help us track your earnings and update your budget automatically, please estimate your spending amount.
                                    </p>

                                    <div className="relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="price"
                                            id="price"
                                            className="block w-full rounded-md border-0 py-3 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="text-gray-500 sm:text-sm">AUD</span>
                                        </div>
                                    </div>

                                    {amount && (
                                        <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Estimated Cashback: ${(parseFloat(amount) * merchant.base_commission_rate).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="button"
                                        className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleContinue}
                                        disabled={!amount || isSubmitting}
                                    >
                                        {isSubmitting ? 'Activating...' : 'Activate & Shop'}
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
