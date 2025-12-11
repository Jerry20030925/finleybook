'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldAlert, LayoutDashboard, FileText, Settings, LogOut } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        if (!loading) {
            // Basic client-side check. Real security is in Firestore rules & API routes.
            // Ideally check for custom claim: user.getIdTokenResult().claims.admin
            // For MVP/Demo: Check specific email or just allow authenticated users to see (API will block writes)

            // Allow specific admin emails (Replace with real logic)
            const allowedEmails = ['admin@finleybook.com', 'jerry@finleybook.com', 'demo@finleybook.com']

            if (user && (allowedEmails.includes(user.email || '') || user.email?.endsWith('@finleybook.com'))) {
                setIsAuthorized(true)
            } else {
                // Redirect to home if not authorized
                // router.push('/')
                // For development ease, we might be lenient or show "Access Denied" page
                setIsAuthorized(true) // TEMPORARY for development to allow seeing the page
            }
        }
    }, [user, loading, router])

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Admin...</div>

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <ShieldAlert size={48} className="text-red-500" />
                <h1 className="text-2xl font-bold">Admin Access Required</h1>
                <p className="text-gray-500">Please log in with an administrative account.</p>
                <Link href="/" className="text-indigo-600 font-bold hover:underline">Return Home</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShieldAlert className="text-emerald-400" />
                        Finley Admin
                    </h2>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg text-emerald-400 font-medium">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link href="/admin/reports" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors">
                        <FileText size={20} />
                        Reports (Coming Soon)
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors">
                        <Settings size={20} />
                        User Management
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.email}</p>
                            <p className="text-xs text-slate-500">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
