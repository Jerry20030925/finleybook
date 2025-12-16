'use client'

import { motion } from 'framer-motion'

export default function SkeletonLoader() {
    return (
        <div className="min-h-screen bg-gray-50 pb-24 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Header Skeleton */}
            <div className="flex justify-between items-end mb-2 mt-4">
                <div className="space-y-3">
                    <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>

            {/* Hero Card Skeleton (Financial Overview) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-48 animate-pulse grid grid-cols-2 gap-4">
                <div className="col-span-2 h-6 w-1/3 bg-gray-100 rounded mb-4" />
                <div className="h-12 w-3/4 bg-gray-100 rounded" />
                <div className="h-12 w-3/4 bg-gray-100 rounded" />
                <div className="h-12 w-3/4 bg-gray-100 rounded" />
                <div className="h-12 w-3/4 bg-gray-100 rounded" />
            </div>

            {/* Quick Actions Skeleton */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="h-6 w-32 bg-gray-200 rounded mb-6 animate-pulse" />
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 bg-gray-200 rounded-2xl animate-pulse" />
                            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Transactions List Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
