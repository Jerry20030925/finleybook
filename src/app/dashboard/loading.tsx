'use client'

import { motion } from 'framer-motion'

export default function DashboardLoading() {
    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="h-8 w-48 bg-gray-200 rounded-lg animate-shimmer" />
                <div className="h-10 w-32 bg-gray-200 rounded-lg animate-shimmer" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-32 animate-shimmer">
                        <div className="h-4 w-24 bg-gray-100 rounded mb-4" />
                        <div className="h-8 w-32 bg-gray-200 rounded" />
                    </div>
                ))}
            </div>

            {/* Large Card Skeleton */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-64 animate-shimmer">
                <div className="h-6 w-32 bg-gray-100 rounded mb-4" />
                <div className="space-y-4">
                    <div className="h-4 w-full bg-gray-50 rounded" />
                    <div className="h-4 w-full bg-gray-50 rounded" />
                    <div className="h-4 w-2/3 bg-gray-50 rounded" />
                </div>
            </div>
        </div>
    )
}
