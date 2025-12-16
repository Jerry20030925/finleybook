'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface GlobalModalContextType {
    isAddTransactionOpen: boolean
    openAddTransaction: () => void
    closeAddTransaction: () => void
}

const GlobalModalContext = createContext<GlobalModalContextType | undefined>(undefined)

export function GlobalModalProvider({ children }: { children: ReactNode }) {
    const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)

    const openAddTransaction = () => setIsAddTransactionOpen(true)
    const closeAddTransaction = () => setIsAddTransactionOpen(false)

    return (
        <GlobalModalContext.Provider value={{
            isAddTransactionOpen,
            openAddTransaction,
            closeAddTransaction
        }}>
            {children}
        </GlobalModalContext.Provider>
    )
}

export function useGlobalModal() {
    const context = useContext(GlobalModalContext)
    if (context === undefined) {
        throw new Error('useGlobalModal must be used within a GlobalModalProvider')
    }
    return context
}
