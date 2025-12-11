'use client';

import { Merchant } from '@/types/rebate';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Lock, Zap } from 'lucide-react';

interface MerchantCardProps {
    merchant: Merchant;
    isPro: boolean;
    onShopClick: (merchant: Merchant) => void;
}

export default function MerchantCard({ merchant, isPro, onShopClick }: MerchantCardProps) {
    const proRate = (merchant.base_commission_rate * 100).toFixed(1);
    // Free users get ~1/3 of the Pro rate (e.g. 15% vs 50%)
    const freeRate = (merchant.base_commission_rate * 0.33 * 100).toFixed(1);

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full group hover:shadow-md transition-all"
        >
            <div className="p-6 flex items-center justify-center h-32 bg-gray-50 relative">
                {merchant.is_featured && (
                    <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Zap size={10} /> FEATURED
                    </span>
                )}
                <div className="relative w-32 h-16 grayscale group-hover:grayscale-0 transition-all duration-300">
                    <Image
                        src={merchant.logo_url}
                        alt={merchant.name}
                        fill
                        className="object-contain"
                        sizes="150px"
                    />
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="font-bold text-lg text-gray-900">{merchant.name}</h3>
                    <p className="text-sm text-gray-500">{merchant.category}</p>
                </div>

                <div className="space-y-2 mb-6">
                    {/* Free Tier */}
                    <div className={`flex justify-between items-center p-2 rounded-lg ${!isPro ? 'bg-gray-100' : 'opacity-50'}`}>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            <span className="text-sm font-medium text-gray-600">Free</span>
                        </div>
                        <span className="font-bold text-gray-900">{freeRate}%</span>
                    </div>

                    {/* Pro Tier */}
                    <div className={`flex justify-between items-center p-2 rounded-lg ${isPro ? 'bg-indigo-50 border border-indigo-100' : 'bg-indigo-50/50'}`}>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-600" />
                            <span className="text-sm font-bold text-indigo-700">Pro</span>
                            {!isPro && <Lock size={12} className="text-indigo-400" />}
                        </div>
                        <span className="font-bold text-indigo-600">{proRate}%</span>
                    </div>
                </div>

                <button
                    onClick={() => onShopClick(merchant)}
                    className="mt-auto w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                >
                    <span>Shop Now</span>
                </button>
            </div>
        </motion.div>
    );
}
