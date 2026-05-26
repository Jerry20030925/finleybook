'use client'

import React from 'react'

export default function PageTransition({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={className}>
            {children}
        </div>
    )
}
