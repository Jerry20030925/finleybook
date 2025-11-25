'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { useCurrency, COUNTRIES } from '@/components/CurrencyProvider'
import { useRouter } from 'next/navigation'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function SettingsPage() {
    const { user, loading } = useAuth()
    const { language, setLanguage, t } = useLanguage()
    const { country, setCountry } = useCurrency()
    const router = useRouter()
    const [displayName, setDisplayName] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/')
        }
        if (user?.displayName) {
            setDisplayName(user.displayName)
        }
    }, [user, loading, router])

    const handleSave = async () => {
        if (!user) return
        setSaving(true)
        try {
            await updateProfile(user, {
                displayName: displayName
            })

            // Update Firestore as well
            await setDoc(doc(db, 'users', user.uid), {
                displayName: displayName,
                updatedAt: new Date()
            }, { merge: true })

            toast.success(language === 'en' ? 'Settings saved successfully' : '设置已保存')
        } catch (error) {
            console.error('Error saving settings:', error)
            toast.error(language === 'en' ? 'Failed to save settings' : '保存设置失败')
        } finally {
            setSaving(false)
        }
    }

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            {language === 'en' ? 'Settings' : '设置'}
                        </h2>
                    </div>
                    <div className="mt-4 flex md:ml-4 md:mt-0">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            {language === 'en' ? 'Back to Dashboard' : '返回仪表盘'}
                        </Link>
                    </div>
                </div>

                <div className="bg-white shadow sm:rounded-lg space-y-6 p-6">
                    {/* Profile Section */}
                    <div>
                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                            {language === 'en' ? 'Profile' : '个人资料'}
                        </h3>
                        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                                <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                                    {language === 'en' ? 'Display Name' : '显示名称'}
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                            {language === 'en' ? 'Preferences' : '偏好设置'}
                        </h3>
                        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            {/* Language Selector */}
                            <div className="sm:col-span-3">
                                <label htmlFor="language" className="block text-sm font-medium leading-6 text-gray-900">
                                    {language === 'en' ? 'Language' : '语言'}
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="language"
                                        name="language"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value="en">English</option>
                                        <option value="zh">中文</option>
                                    </select>
                                </div>
                            </div>

                            {/* Country/Currency Selector */}
                            <div className="sm:col-span-3">
                                <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                                    {language === 'en' ? 'Country & Currency' : '国家与货币'}
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="country"
                                        name="country"
                                        value={country.code}
                                        onChange={(e) => setCountry(e.target.value as any)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                    >
                                        {COUNTRIES.map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {c.flag} {t(`countries.${c.code}`)} ({c.currency})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
                        >
                            {saving
                                ? (language === 'en' ? 'Saving...' : '保存中...')
                                : (language === 'en' ? 'Save Changes' : '保存更改')
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
