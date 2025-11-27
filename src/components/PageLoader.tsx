'use client'

import LoadingAnimation from './LoadingAnimation'

export default function PageLoader() {
    return (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
            <LoadingAnimation size="lg" />
        </div>
    )
}
