import { NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

type SearchTransactionResult = {
    id: string
    title: string
    category: string
    amount: number
    date: string
    href: string
}

const DEFAULT_LIMIT = 6
const MAX_LIMIT = 20
const MAX_QUERY_LENGTH = 120
const FETCH_POOL_LIMIT = 500

const toSafeDate = (value: unknown): Date => {
    if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
        return (value as { toDate: () => Date }).toDate()
    }
    const parsed = new Date(String(value || ''))
    return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

const normalize = (value: unknown) => String(value || '').trim().toLowerCase()

const scoreTransaction = (haystack: string, query: string) => {
    if (!query) return 0
    if (haystack === query) return 120
    if (haystack.startsWith(query)) return 90
    if (haystack.includes(` ${query}`)) return 70
    if (haystack.includes(query)) return 50
    return 0
}

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' }, { status: 401 })
        }

        const token = authHeader.slice('Bearer '.length)
        const decoded = await getAdminAuth().verifyIdToken(token)
        const uid = decoded.uid

        const { searchParams } = new URL(req.url)
        const rawQuery = (searchParams.get('q') || '').slice(0, MAX_QUERY_LENGTH)
        const query = normalize(rawQuery)
        const requestedLimit = Number(searchParams.get('limit') || DEFAULT_LIMIT)
        const limit = Math.max(1, Math.min(MAX_LIMIT, Number.isFinite(requestedLimit) ? requestedLimit : DEFAULT_LIMIT))

        const db = getAdminDb()
        let docs: FirebaseFirestore.QueryDocumentSnapshot[] = []

        try {
            const ordered = await db
                .collection('transactions')
                .where('userId', '==', uid)
                .orderBy('date', 'desc')
                .limit(FETCH_POOL_LIMIT)
                .get()
            docs = ordered.docs
        } catch (orderedError) {
            console.error('[search] Ordered query failed, falling back:', orderedError)
            const fallback = await db
                .collection('transactions')
                .where('userId', '==', uid)
                .limit(FETCH_POOL_LIMIT)
                .get()
            docs = fallback.docs
        }

        const rows = docs
            .map((doc) => {
                const data = doc.data()
                const date = toSafeDate(data.date)
                const description = String(data.description || '').trim()
                const category = String(data.category || 'Other').trim()
                const merchantName = String(data.merchantName || '').trim()
                const paymentMethod = String(data.paymentMethod || '').trim()
                const type = String(data.type || '').trim()
                const title = description || merchantName || 'Transaction'
                const amount = Number(data.amount || 0)

                const searchText = normalize([title, category, merchantName, paymentMethod, type].join(' '))

                return {
                    id: doc.id,
                    title,
                    category,
                    amount: Number.isFinite(amount) ? amount : 0,
                    date,
                    searchText,
                    href: `/transactions?q=${encodeURIComponent(description || category || rawQuery)}`,
                }
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime())

        const filtered = query
            ? rows
                .map((row) => ({
                    ...row,
                    score: scoreTransaction(row.searchText, query),
                }))
                .filter((row) => row.score > 0)
                .sort((a, b) => (b.score - a.score) || (b.date.getTime() - a.date.getTime()))
            : rows

        const results: SearchTransactionResult[] = filtered.slice(0, limit).map((row) => ({
            id: row.id,
            title: row.title,
            category: row.category,
            amount: row.amount,
            date: row.date.toISOString(),
            href: row.href,
        }))

        return NextResponse.json({
            query: rawQuery,
            total: filtered.length,
            results,
        })
    } catch (error: any) {
        console.error('[search] Error:', error)
        if (error?.code === 'auth/id-token-expired' || error?.code === 'auth/argument-error') {
            return NextResponse.json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' }, { status: 401 })
        }
        return NextResponse.json({ error: 'Search failed', errorCode: 'SEARCH_FAILED' }, { status: 500 })
    }
}
