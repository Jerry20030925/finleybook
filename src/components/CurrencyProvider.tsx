'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthProvider'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type CurrencyCode = 'CNY' | 'USD' | 'AUD' | 'GBP' | 'JPY' | 'CAD' | 'EUR'
export type CountryCode = 'CN' | 'US' | 'AU' | 'GB' | 'JP' | 'CA' | 'EU'

interface Country {
    code: CountryCode
    name: string
    currency: CurrencyCode
    symbol: string
    flag: string
}

export const COUNTRIES: Country[] = [
    { code: 'CN', name: 'China', currency: 'CNY', symbol: '¥', flag: '🇨🇳' },
    { code: 'US', name: 'United States', currency: 'USD', symbol: '$', flag: '🇺🇸' },
    { code: 'AU', name: 'Australia', currency: 'AUD', symbol: '$', flag: '🇦🇺' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£', flag: '🇬🇧' },
    { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥', flag: '🇯🇵' },
    { code: 'CA', name: 'Canada', currency: 'CAD', symbol: '$', flag: '🇨🇦' },
    { code: 'EU', name: 'Europe', currency: 'EUR', symbol: '€', flag: '🇪🇺' },
]

interface CurrencyContextType {
    country: Country
    setCountry: (code: CountryCode) => Promise<void>
    formatAmount: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [country, setCountryState] = useState<Country>(COUNTRIES[0]) // Default to China
    const { user } = useAuth()
    const [isInitialized, setIsInitialized] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCode = localStorage.getItem('countryCode') as CountryCode
            if (savedCode) {
                const savedCountry = COUNTRIES.find(c => c.code === savedCode)
                if (savedCountry) {
                    setCountryState(savedCountry)
                }
            }
            setIsInitialized(true)
        }
    }, [])

    // Sync with Firestore when user logs in
    useEffect(() => {
        const syncUserPreference = async () => {
            if (user && isInitialized) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid))
                    if (userDoc.exists()) {
                        const userData = userDoc.data()
                        if (userData.countryCode) {
                            const userCountry = COUNTRIES.find(c => c.code === userData.countryCode)
                            if (userCountry) {
                                setCountryState(userCountry)
                                localStorage.setItem('countryCode', userCountry.code)
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error syncing currency preference:', error)
                }
            }
        }

        syncUserPreference()
    }, [user, isInitialized])

    const setCountry = async (code: CountryCode) => {
        const newCountry = COUNTRIES.find(c => c.code === code)
        if (!newCountry) return

        setCountryState(newCountry)
        localStorage.setItem('countryCode', code)

        if (user) {
            try {
                await setDoc(doc(db, 'users', user.uid), {
                    countryCode: code,
                    currency: newCountry.currency
                }, { merge: true })
            } catch (error) {
                console.error('Error saving currency preference:', error)
            }
        }
    }

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: country.currency,
        }).format(amount)
    }

    return (
        <CurrencyContext.Provider value={{ country, setCountry, formatAmount }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency() {
    const context = useContext(CurrencyContext)
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider')
    }
    return context
}
