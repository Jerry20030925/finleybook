import { db } from './firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

export interface BankConnection {
    id: string
    userId: string
    institutionId: string
    institutionName: string
    status: 'connected' | 'disconnected' | 'error'
    lastSync: Date
}

export interface BankAccount {
    id: string
    connectionId: string
    userId: string
    name: string // e.g. "Chase Sapphire"
    mask: string // e.g. "8899"
    type: 'checking' | 'savings' | 'credit' | 'investment'
    subtype?: string
    balance: {
        current: number
        available?: number
        limit?: number
        isoCurrencyCode: string
    }
}

// MOCK: Generate a Link Token (would normally call backend -> Plaid)
export const createLinkToken = async (userId: string) => {
    console.log('[Mock] Creating Link Token for user:', userId)
    await new Promise(resolve => setTimeout(resolve, 500))
    return 'link-sandbox-' + Math.random().toString(36).substring(7)
}

// MOCK: Exchange Public Token (would normally call backend -> Plaid)
export const exchangePublicToken = async (userId: string, publicToken: string, institution: any) => {
    console.log('[Mock] Exchanging Public Token:', publicToken)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simulate saving connection to DB
    const connection: Omit<BankConnection, 'id'> = {
        userId,
        institutionId: institution.id || 'ins_mock',
        institutionName: institution.name || 'Mock Bank',
        status: 'connected',
        lastSync: new Date()
    }

    // In a real app, this happens server-side
    // await addDoc(collection(db, 'bankConnections'), connection)

    return {
        access_token: 'access-sandbox-' + Math.random().toString(36).substring(7),
        itemId: 'item-' + Math.random().toString(36).substring(7)
    }
}
