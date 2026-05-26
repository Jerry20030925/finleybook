'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Bell, TrendingUp, Users, Check, Shield } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface EmailPreferences {
    marketing: boolean
    reports: boolean
    streakReminders: boolean
    referral: boolean
}

const DEFAULT_PREFS: EmailPreferences = {
    marketing: true,
    reports: true,
    streakReminders: true,
    referral: true,
}

const CATEGORIES = [
    {
        key: 'marketing' as keyof EmailPreferences,
        icon: Mail,
        label: 'Marketing & Updates',
        description: 'Product updates, tips, and promotional offers',
    },
    {
        key: 'reports' as keyof EmailPreferences,
        icon: TrendingUp,
        label: 'Monthly Reports',
        description: 'Your monthly financial summary and spending insights',
    },
    {
        key: 'streakReminders' as keyof EmailPreferences,
        icon: Bell,
        label: 'Streak Reminders',
        description: 'Reminders to keep your daily login streak alive',
    },
    {
        key: 'referral' as keyof EmailPreferences,
        icon: Users,
        label: 'Referral Notifications',
        description: 'Updates when friends join using your referral',
    },
]

function UnsubscribeContent() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''
    const [preferences, setPreferences] = useState<EmailPreferences>(DEFAULT_PREFS)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [unsubscribeAll, setUnsubscribeAll] = useState(false)

    // Fetch existing preferences
    useEffect(() => {
        if (!email) return
        fetch(`/api/email-preferences?email=${encodeURIComponent(email)}`)
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (data?.preferences) {
                    setPreferences(data.preferences)
                    setUnsubscribeAll(Object.values(data.preferences).every((v: unknown) => v === false))
                }
            })
            .catch(() => { /* use defaults */ })
    }, [email])

    const handleToggle = (key: keyof EmailPreferences) => {
        setPreferences((prev) => {
            const updated = { ...prev, [key]: !prev[key] }
            setUnsubscribeAll(Object.values(updated).every((v) => v === false))
            return updated
        })
    }

    const handleUnsubscribeAll = () => {
        const allOff = !unsubscribeAll
        setUnsubscribeAll(allOff)
        setPreferences({
            marketing: !allOff,
            reports: !allOff,
            streakReminders: !allOff,
            referral: !allOff,
        })
    }

    const handleSave = async () => {
        if (!email) {
            toast.error('No email address provided')
            return
        }
        setSaving(true)
        try {
            const res = await fetch('/api/email-preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, preferences }),
            })
            if (!res.ok) throw new Error('Failed to save')
            setSaved(true)
            toast.success('Preferences saved!')
            setTimeout(() => setSaved(false), 3000)
        } catch {
            toast.error('Failed to save preferences. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
            <Toaster position="top-center" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                        F
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Preferences</h1>
                    <p className="text-sm text-gray-500">
                        {email ? (
                            <>Manage notifications for <strong className="text-gray-700">{email}</strong></>
                        ) : (
                            'No email address provided. Please use the link from your email.'
                        )}
                    </p>
                </div>

                {/* Preference Cards */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4">
                    {CATEGORIES.map((cat, index) => {
                        const Icon = cat.icon
                        return (
                            <div
                                key={cat.key}
                                className={`flex items-center justify-between px-5 py-4 ${index < CATEGORIES.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Icon className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{cat.label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggle(cat.key)}
                                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${preferences[cat.key] ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                >
                                    <div
                                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${preferences[cat.key] ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
                                    />
                                </button>
                            </div>
                        )
                    })}
                </div>

                {/* Unsubscribe All */}
                <button
                    onClick={handleUnsubscribeAll}
                    className="w-full text-center text-sm text-gray-400 hover:text-red-500 transition-colors py-2 mb-4"
                >
                    {unsubscribeAll ? 'Re-subscribe to all' : 'Unsubscribe from all'}
                </button>

                {/* Save Button */}
                <motion.button
                    onClick={handleSave}
                    disabled={saving || !email}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    whileTap={{ scale: 0.98 }}
                >
                    {saved ? (
                        <><Check size={18} /> Saved!</>
                    ) : saving ? (
                        'Saving...'
                    ) : (
                        <><Shield size={18} /> Save Preferences</>
                    )}
                </motion.button>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    © 2026 FinleyBook. You&apos;ll still receive essential account and security emails.
                </p>
            </motion.div>
        </div>
    )
}

export default function UnsubscribePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        }>
            <UnsubscribeContent />
        </Suspense>
    )
}
