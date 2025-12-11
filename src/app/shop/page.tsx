'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { motion } from 'framer-motion';
import { ShoppingBag, ExternalLink, Search, ArrowRight } from 'lucide-react';

const MERCHANTS = [
    {
        id: 'amazon',
        name: 'Amazon',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        rate: 'Up to 5%',
        color: 'bg-orange-50',
        hover: 'hover:border-orange-200',
        description: 'Shop electronics, books, and more.'
    },
    {
        id: 'ebay',
        name: 'eBay',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg',
        rate: '1%',
        color: 'bg-blue-50',
        hover: 'hover:border-blue-200',
        description: 'Find great deals on new & used items.'
    },
    // Add more merchants as needed
];

export default function ShopPage() {
    const { user } = useAuth();
    const [productUrl, setProductUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDirectLink = () => {
        if (!productUrl || !user) return;
        setLoading(true);

        // Determine merchant from URL (simple heuristic)
        let merchantId = '';
        if (productUrl.includes('amazon')) merchantId = 'amazon';
        else if (productUrl.includes('ebay')) merchantId = 'ebay';

        if (merchantId) {
            window.location.href = `/api/go?merchantId=${merchantId}&userId=${user.uid}&url=${encodeURIComponent(productUrl)}`;
        } else {
            alert('Unsupported merchant URL. Please use Amazon or eBay links.');
            setLoading(false);
        }
    };

    const handleMerchantClick = (merchantId: string) => {
        if (!user) {
            alert('Please log in to earn cashback.');
            return;
        }
        window.location.href = `/api/go?merchantId=${merchantId}&userId=${user.uid}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                            Shop & Earn <span className="text-blue-600">Cashback</span>
                        </h1>
                        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                            Shop at your favorite stores and get paid. No points, just cash.
                        </p>
                    </motion.div>

                    {/* Direct Link Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-10 max-w-2xl mx-auto"
                    >
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                className="block w-full rounded-full border-gray-300 pl-6 pr-14 py-4 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                                placeholder="Paste an Amazon or eBay product link here..."
                                value={productUrl}
                                onChange={(e) => setProductUrl(e.target.value)}
                            />
                            <button
                                onClick={handleDirectLink}
                                disabled={loading || !productUrl}
                                className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white rounded-full px-6 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                            >
                                {loading ? 'Processing...' : <ArrowRight size={20} />}
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-400">
                            Paste a direct link to a product to generate your cashback link instantly.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Merchant Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Supported Stores</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {MERCHANTS.map((merchant, index) => (
                        <motion.div
                            key={merchant.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className={`relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group ${merchant.hover}`}
                            onClick={() => handleMerchantClick(merchant.id)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${merchant.color} p-2`}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={merchant.logo} alt={merchant.name} className="max-h-full max-w-full object-contain" />
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    {merchant.rate} Cashback
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{merchant.name}</h3>
                            <p className="mt-2 text-gray-500 text-sm">{merchant.description}</p>
                            <div className="mt-4 flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                                Shop Now <ExternalLink size={16} className="ml-1" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
