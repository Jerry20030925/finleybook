'use client';

import { useState } from 'react';
import { Merchant } from '@/types/rebate';
import MerchantCard from '@/components/MerchantCard';
import PreTransactionModal from '@/components/PreTransactionModal';
import { useAuth } from '@/components/AuthProvider';

interface RewardsClientProps {
    initialMerchants: Merchant[];
}

import { MOVIE_MERCHANTS } from '@/lib/merchants';

export default function RewardsClient({ initialMerchants }: RewardsClientProps) {
    const { user } = useAuth();
    const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // In a real app, you might want to fetch the user's subscription status from Firestore
    // For now, we'll assume 'free' unless we have that data in the user object
    // If your AuthProvider provides the full user document, you can use that.
    // Let's assume user object has a 'subscription' field or we default to false.
    const isPro = (user as any)?.subscription?.plan === 'pro';

    const handleShopClick = (merchant: Merchant) => {
        setSelectedMerchant(merchant);
        setIsModalOpen(true);
    };

    const allMerchants = [...MOVIE_MERCHANTS, ...initialMerchants];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rewards Hub</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Shop with our partners and earn cashback directly into your wallet.
                    <span className="block mt-1 text-indigo-600 dark:text-indigo-400 font-medium">
                        Pro members earn 50% cashback (3x more than Free)!
                    </span>
                </p>
            </div>

            {/* Movie & Entertainment Section */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="mr-2">🎬</span> Movie & Entertainment Rewards
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MOVIE_MERCHANTS.map((merchant) => (
                        <MerchantCard
                            key={merchant.id}
                            merchant={merchant}
                            isPro={isPro}
                            onShopClick={handleShopClick}
                        />
                    ))}
                </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">All Partners</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialMerchants.map((merchant) => (
                    <MerchantCard
                        key={merchant.id}
                        merchant={merchant}
                        isPro={isPro}
                        onShopClick={handleShopClick}
                    />
                ))}
            </div>

            <PreTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                merchant={selectedMerchant}
                userId={user?.uid || ''}
            />
        </div>
    );
}
