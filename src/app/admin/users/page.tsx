'use client'

import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Search, Users, Crown, Mail } from 'lucide-react'

interface AdminUser {
    id: string
    email?: string
    displayName?: string
    createdAt?: Date
    subscription?: {
        planKey?: string
        status?: string
    }
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const usersQuery = query(collection(db, 'users'), limit(120))
                const snapshot = await getDocs(usersQuery)
                const records = snapshot.docs.map((doc) => {
                    const data = doc.data() as any
                    return {
                        id: doc.id,
                        email: data.email,
                        displayName: data.displayName,
                        createdAt: typeof data.createdAt?.toDate === 'function' ? data.createdAt.toDate() : undefined,
                        subscription: data.subscription
                    } satisfies AdminUser
                })

                records.sort((a, b) => {
                    const aTime = a.createdAt?.getTime() || 0
                    const bTime = b.createdAt?.getTime() || 0
                    return bTime - aTime
                })

                setUsers(records)
            } catch (error) {
                console.error('Failed to load users:', error)
            } finally {
                setLoading(false)
            }
        }

        loadUsers()
    }, [])

    const filteredUsers = useMemo(() => {
        const keyword = search.trim().toLowerCase()
        if (!keyword) return users

        return users.filter((user) => {
            const email = (user.email || '').toLowerCase()
            const name = (user.displayName || '').toLowerCase()
            return email.includes(keyword) || name.includes(keyword) || user.id.includes(keyword)
        })
    }, [users, search])

    const proUsers = useMemo(
        () => users.filter((user) => user.subscription?.planKey && user.subscription.planKey !== 'FREE').length,
        [users]
    )

    return (
        <section className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-1">Review account profile and subscription status.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                        <p className="text-xs text-gray-500">Total Users</p>
                        <p className="text-xl font-bold text-gray-900">{users.length}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                        <p className="text-xs text-gray-500">Pro Users</p>
                        <p className="text-xl font-bold text-emerald-600">{proUsers}</p>
                    </div>
                </div>
            </header>

            <div className="relative max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by email, name, or UID"
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-100 bg-gray-50">
                    <span className="col-span-4">User</span>
                    <span className="col-span-4">Email</span>
                    <span className="col-span-2">Plan</span>
                    <span className="col-span-2 text-right">Created</span>
                </div>

                {loading ? (
                    <div className="px-4 py-10 text-center text-gray-500">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="px-4 py-10 text-center text-gray-500">No users found.</div>
                ) : (
                    filteredUsers.map((user) => {
                        const planKey = user.subscription?.planKey || 'FREE'
                        const isPro = planKey !== 'FREE'
                        return (
                            <div key={user.id} className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 items-center text-sm">
                                <div className="col-span-4 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{user.displayName || 'Unnamed User'}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.id}</p>
                                </div>
                                <div className="col-span-4 min-w-0 text-gray-700 truncate flex items-center gap-1">
                                    <Mail size={14} className="text-gray-400 shrink-0" />
                                    <span className="truncate">{user.email || '-'}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${isPro ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {isPro && <Crown size={12} />}
                                        {planKey}
                                    </span>
                                </div>
                                <div className="col-span-2 text-right text-gray-500 text-xs">
                                    {user.createdAt ? user.createdAt.toLocaleDateString() : '-'}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </section>
    )
}
