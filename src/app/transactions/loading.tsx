'use client'

export default function TransactionsLoading() {
    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div className="h-8 w-48 bg-gray-200 rounded-lg animate-shimmer" />
                <div className="h-10 w-32 bg-gray-200 rounded-lg animate-shimmer" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex gap-4">
                    <div className="h-10 w-full max-w-xs bg-gray-100 rounded-lg animate-shimmer" />
                    <div className="h-10 w-32 bg-gray-100 rounded-lg animate-shimmer" />
                </div>

                <div className="divide-y divide-gray-100">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl animate-shimmer" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-32 bg-gray-200 rounded animate-shimmer" />
                                    <div className="h-3 w-24 bg-gray-100 rounded animate-shimmer" />
                                </div>
                            </div>
                            <div className="h-6 w-20 bg-gray-200 rounded animate-shimmer" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
