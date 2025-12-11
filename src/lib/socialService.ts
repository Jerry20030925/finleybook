import { db } from './firebase'
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    Timestamp,
    orderBy,
    limit,
    arrayUnion
} from 'firebase/firestore'

export interface Challenge {
    id: string
    title: string
    description: string
    type: 'savings_race' | 'streak' | 'budget_cap'
    targetAmount?: number // e.g. Save $500 or Spend < $200
    startDate: Date
    endDate: Date
    participants: string[] // User IDs
    status: 'active' | 'completed' | 'upcoming'
    creatorId: string // 'system' or user ID
    image_url?: string // Cover image
}

export interface ParticipantStats {
    userId: string
    challengeId: string
    progress: number // e.g. amount saved
    rank: number
    lastUpdated: Date
}

// Mock Data for MVP
const MOCK_CHALLENGES: Challenge[] = [
    {
        id: 'no-spend-nov',
        title: 'No Spend November',
        description: 'Limit discretionary spending to $50/week. Can you survive?',
        type: 'budget_cap',
        targetAmount: 200,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        participants: ['user_1', 'user_2', 'user_3'],
        status: 'active',
        creatorId: 'system',
        image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000'
    },
    {
        id: 'save-1k-race',
        title: 'The $1k Sprint',
        description: 'First to save $1,000 in their "Emergency Fund" goal wins.',
        type: 'savings_race',
        targetAmount: 1000,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 60)),
        participants: [],
        status: 'upcoming',
        creatorId: 'system'
    }
]

export const getActiveChallenges = async (): Promise<Challenge[]> => {
    // In real app: fetch from Firestore
    // const q = query(collection(db, 'challenges'), where('status', '==', 'active'))
    // ...
    return new Promise(resolve => setTimeout(() => resolve(MOCK_CHALLENGES), 500))
}

export const joinChallenge = async (userId: string, challengeId: string) => {
    console.log(`[Mock] User ${userId} joined challenge ${challengeId}`)
    return true
}

export const getLeaderboard = async (challengeId: string): Promise<ParticipantStats[]> => {
    // Mock Leaderboard
    return [
        { userId: 'user_x', challengeId, progress: 450, rank: 1, lastUpdated: new Date() },
        { userId: 'user_y', challengeId, progress: 320, rank: 2, lastUpdated: new Date() },
        { userId: 'current_user', challengeId, progress: 150, rank: 3, lastUpdated: new Date() }
    ]
}
