'use client'

export default function WealthLoading() {
    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-shimmer mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-shimmer">
                        <div className="h-48 bg-gray-100" />
                        <div className="p-6 space-y-4">
                            <div className="h-4 w-3/4 bg-gray-200 rounded" />
                            <div className="h-4 w-1/2 bg-gray-100 rounded" />
                            <div className="flex justify-between items-center pt-4">
                                <div className="h-6 w-16 bg-gray-200 rounded" />
                                <div className="h-10 w-24 bg-gray-200 rounded-lg" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
