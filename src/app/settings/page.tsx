'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { useCurrency, COUNTRIES } from '@/components/CurrencyProvider'
import { useRouter } from 'next/navigation'
import {
    UserCircleIcon,
    BellIcon,
    ShieldCheckIcon,
    CreditCardIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    LockClosedIcon as Lock,
    QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import { AlertTriangle, Zap } from 'lucide-react'
import { updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { getUserTransactions } from '@/lib/dataService'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'


const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const MAX_WIDTH = 800
                const MAX_HEIGHT = 800
                let width = img.width
                let height = img.height

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width
                        width = MAX_WIDTH
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height
                        height = MAX_HEIGHT
                    }
                }

                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                ctx?.drawImage(img, 0, 0, width, height)

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob)
                    } else {
                        reject(new Error('Canvas to Blob failed'))
                    }
                }, 'image/jpeg', 0.7) // Compress to JPEG with 0.7 quality
            }
            img.onerror = (error) => reject(error)
        }
        reader.onerror = (error) => reject(error)
    })
}

export default function SettingsPage() {
    const { user, loading } = useAuth()
    const { language, setLanguage, t } = useLanguage()
    const { country, setCountry } = useCurrency()
    const router = useRouter()
    const [displayName, setDisplayName] = useState('')
    const [photoURL, setPhotoURL] = useState('')
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('general')
    const [exporting, setExporting] = useState(false)
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
    const [recoveryPhone, setRecoveryPhone] = useState('')

    // Notification preferences state (mocked for now, ideally persisted in Firestore)
    const [notifications, setNotifications] = useState({
        weeklyReport: true,
        cashback: true,
        updates: true,
        budgetWarning: true
    })

    useEffect(() => {
        if (!loading && !user) {
            router.push('/')
        }
        if (user?.displayName) {
            setDisplayName(user.displayName)
        }
        if (user?.twoFactorEnabled !== undefined) {
            setTwoFactorEnabled(user.twoFactorEnabled)
        }
        if (user?.photoURL) {
            setPhotoURL(user.photoURL)
        }
        if (user?.phoneNumber) {
            setRecoveryPhone(user.phoneNumber)
        }
    }, [user, loading, router])

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!user || !e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0]

        // Client-side validation: Max 5MB
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB')
            return
        }

        setUploadingAvatar(true)

        try {
            const storage = getStorage()
            const storageRef = ref(storage, `avatars/${user.uid}`)

            // Compress image
            const compressedBlob = await compressImage(file)

            await uploadBytes(storageRef, compressedBlob)
            const downloadURL = await getDownloadURL(storageRef)

            await updateProfile(user, { photoURL: downloadURL })
            await setDoc(doc(db, 'users', user.uid), {
                photoURL: downloadURL,
                updatedAt: new Date()
            }, { merge: true })

            setPhotoURL(downloadURL)
            toast.success('Avatar updated successfully')
        } catch (error) {
            console.error('Error uploading avatar:', error)
            toast.error('Failed to upload avatar')
        } finally {
            setUploadingAvatar(false)
        }
    }

    const handleToggle2FA = async () => {
        if (!user) return
        const newState = !twoFactorEnabled
        setTwoFactorEnabled(newState) // Optimistic update

        try {
            await setDoc(doc(db, 'users', user.uid), {
                twoFactorEnabled: newState,
                updatedAt: new Date()
            }, { merge: true })

            toast.success(newState ? 'Two-Factor Authentication enabled' : 'Two-Factor Authentication disabled')
        } catch (error) {
            console.error('Error updating 2FA:', error)
            setTwoFactorEnabled(!newState) // Revert
            toast.error('Failed to update security settings')
        }
    }

    const handleSaveRecoveryPhone = async () => {
        if (!user) return
        try {
            await setDoc(doc(db, 'users', user.uid), {
                phoneNumber: recoveryPhone,
                updatedAt: new Date()
            }, { merge: true })
            toast.success('Recovery phone saved')
        } catch (error) {
            console.error('Error saving phone:', error)
            toast.error('Failed to save recovery phone')
        }
    }

    const handleRestartOnboarding = () => {
        localStorage.removeItem('guide_dismissed')
        toast.success('Onboarding guide reset! Check your Dashboard.')
        router.push('/dashboard')
    }

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

            toast.success(t('settings.success'))
        } catch (error) {
            console.error('Error saving settings:', error)
            toast.error(t('settings.error'))
        } finally {
            setSaving(false)
        }
    }

    const handleExportData = async () => {
        if (!user) return
        setExporting(true)
        try {
            const transactions = await getUserTransactions(user.uid, 1000)

            // Convert to CSV
            const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Payment Method']
            const csvContent = [
                headers.join(','),
                ...transactions.map(t => [
                    new Date(t.date).toISOString().split('T')[0],
                    `"${t.description}"`,
                    t.amount,
                    t.type,
                    t.category,
                    t.paymentMethod || ''
                ].join(','))
            ].join('\n')

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `finleybook_export_${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success('Data exported successfully')
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export data')
        } finally {
            setExporting(false)
        }
    }

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
    }

    const tabs = [
        { id: 'general', name: t('settings.tabs.general'), icon: UserCircleIcon },
        { id: 'notifications', name: t('settings.tabs.notifications'), icon: BellIcon },
        { id: 'security', name: t('settings.tabs.security'), icon: ShieldCheckIcon },
        { id: 'subscription', name: t('settings.tabs.subscription'), icon: CreditCardIcon },
        { id: 'help', name: 'Help Center', icon: QuestionMarkCircleIcon },
    ]

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header Background */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white pt-10 pb-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                        {t('settings.title')}
                    </h2>
                    <p className="text-slate-300">Manage your preferences, security, and account settings.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <nav className="lg:w-64 flex-shrink-0 space-y-2">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${isActive
                                        ? 'bg-white text-primary-600 shadow-medium'
                                        : 'text-slate-400 hover:bg-white/10 hover:text-white lg:hover:bg-white lg:hover:text-slate-700'
                                        } group flex w-full items-center px-4 py-3 text-sm font-medium transition-all rounded-xl relative overflow-hidden`}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-l-xl" />
                                    )}
                                    <tab.icon
                                        className={`${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-current'
                                            } mr-3 h-5 w-5 flex-shrink-0 transition-colors`}
                                        aria-hidden="true"
                                    />
                                    {tab.name}
                                </button>
                            )
                        })}
                    </nav>

                    {/* Content Area */}
                    <div className="flex-1 bg-white shadow-soft rounded-2xl p-6 sm:p-8 min-h-[600px] border border-slate-100/50 relative overflow-hidden">
                        {/* Tab Content Animations */}
                        <div className="relative z-10">
                            {activeTab === 'general' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="border-b border-slate-100 pb-6">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6">{t('settings.profile')}</h3>

                                        {/* Avatar Upload */}
                                        <div className="flex flex-col sm:flex-row items-center gap-8">
                                            <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                                <div className={`h-28 w-28 rounded-full overflow-hidden ring-4 ring-white shadow-lg transition-all group-hover:ring-primary-50 ${uploadingAvatar ? 'opacity-50' : ''}`}>
                                                    {photoURL ? (
                                                        <img src={photoURL} alt="Profile" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center text-primary-600 font-bold text-4xl">
                                                            {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white text-xs font-medium">Change</span>
                                                </div>
                                                {uploadingAvatar && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 w-full text-center sm:text-left">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                                    {t('settings.displayName')}
                                                </label>
                                                <div className="flex gap-4">
                                                    <input
                                                        type="text"
                                                        value={displayName}
                                                        onChange={(e) => setDisplayName(e.target.value)}
                                                        className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2.5 bg-slate-50 focus:bg-white transition-colors"
                                                    />
                                                </div>
                                                <div className="mt-4 hidden sm:block">
                                                    <label className={`
                                                        inline-flex items-center px-4 py-2 
                                                        bg-white border border-slate-200 rounded-lg shadow-sm
                                                        text-sm font-medium text-slate-700 
                                                        hover:bg-slate-50 cursor-pointer transition-all
                                                        ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}
                                                    `}>
                                                        <span>Upload New Photo</span>
                                                        <input
                                                            id="avatar-upload"
                                                            type="file"
                                                            className="sr-only"
                                                            accept="image/png,image/jpeg,image/gif"
                                                            onChange={handleAvatarUpload}
                                                            disabled={uploadingAvatar}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                            <label className="block text-sm font-bold text-slate-900 mb-4">
                                                Regional Settings
                                            </label>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 block">Language</label>
                                                    <select
                                                        value={language}
                                                        onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
                                                        className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                                    >
                                                        <option value="en">English (US)</option>
                                                        <option value="zh">中文 (Simplified)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 block">Currency</label>
                                                    <select
                                                        value={country.code}
                                                        onChange={(e) => setCountry(e.target.value as any)}
                                                        className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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

                                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center">
                                            <div className="mb-4 text-4xl">👋</div>
                                            <h4 className="font-medium text-slate-900">Account Status</h4>
                                            <p className="text-sm text-slate-500 mt-1 mb-4">You are currently on the <strong className="text-primary-600">{user?.subscription?.plan === 'pro' ? 'Pro' : 'Free'}</strong> plan.</p>
                                            {user?.subscription?.plan !== 'pro' && (
                                                <Link href="/subscribe" className="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline">
                                                    Upgrade to Pro &rarr;
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 py-3 px-8 text-sm font-bold text-white shadow-lg hover:bg-black hover:transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Saving...
                                                </>
                                            ) : t('settings.save')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <h3 className="text-xl font-bold text-slate-900">Notification Preferences</h3>

                                    <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                                        {['weeklyReport', 'cashback', 'updates'].map((key) => (
                                            <div key={key} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                                                <div>
                                                    <div className="font-medium text-slate-900">{t(`settings.notifications.${key}`)}</div>
                                                    <div className="text-sm text-slate-500">Receive updates via email</div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notifications[key as keyof typeof notifications]}
                                                        onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <BellIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                                            </div>
                                            <div className="ml-3 w-0 flex-1 pt-0.5">
                                                <p className="text-sm font-medium text-blue-900">
                                                    Push Notifications
                                                </p>
                                                <p className="mt-1 text-sm text-blue-700">
                                                    Enable push notifications to get real-time alerts about your spending and cashback rewards.
                                                </p>
                                            </div>
                                            <div className="ml-4 flex-shrink-0 flex">
                                                <button className="bg-white text-blue-600 text-sm font-medium px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 shadow-sm">
                                                    Enable
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <h3 className="text-xl font-bold text-slate-900">Security & Privacy</h3>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                                            <div>
                                                <h4 className="font-bold text-slate-900">Two-Factor Authentication</h4>
                                                <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                                            </div>
                                            <button
                                                onClick={handleToggle2FA}
                                                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${twoFactorEnabled ? 'bg-green-500' : 'bg-slate-200'}`}
                                            >
                                                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>

                                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                            <h4 className="font-bold text-slate-900 mb-4">Data Management</h4>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <button
                                                    onClick={handleExportData}
                                                    disabled={exporting}
                                                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50"
                                                >
                                                    <ArrowDownTrayIcon className="mr-2 h-5 w-5 text-slate-400" />
                                                    {exporting ? 'Exporting CSV...' : 'Export Data (CSV)'}
                                                </button>
                                                <button className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50">
                                                    Request Data Archive
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                                            <h4 className="text-red-800 font-bold flex items-center gap-2">
                                                <AlertTriangle size={20} />
                                                Danger Zone
                                            </h4>
                                            <p className="text-sm text-red-600 mt-2 mb-4">
                                                Once you delete your account, there is no going back. Please be certain.
                                            </p>
                                            <button className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-colors">
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'subscription' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <h3 className="text-xl font-bold text-slate-900">Subscription & Billing</h3>

                                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 relative overflow-hidden shadow-xl">
                                        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div>
                                                <div className="text-slate-300 font-medium mb-1">Current Plan</div>
                                                <h4 className="text-3xl font-bold flex items-center gap-3">
                                                    {user?.subscription?.plan === 'pro' ? 'Pro Member' : 'Free Plan'}
                                                    {user?.subscription?.plan === 'pro' && <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded font-bold">ACTIVE</span>}
                                                </h4>
                                                <p className="text-slate-400 mt-2 max-w-md">
                                                    {user?.subscription?.plan === 'pro'
                                                        ? 'You have access to all premium features including unlimited AI insights and exclusive cashback rates.'
                                                        : 'Upgrade to unlock the full potential of your wealth journey.'}
                                                </p>
                                            </div>
                                            {user?.subscription?.plan !== 'pro' && (
                                                <Link
                                                    href="/subscribe"
                                                    className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg"
                                                >
                                                    Upgrade to Pro
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {/* Features Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-slate-200 flex items-center gap-3 opacity-75">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <Zap size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">AI Budgeting</div>
                                                <div className="text-xs text-slate-500">Smart categorization</div>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl border border-primary-100 bg-primary-50/30 flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                                <ShieldCheckIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">Pro Protection</div>
                                                <div className="text-xs text-slate-500">Enhanced security active</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'help' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <h3 className="text-xl font-bold text-slate-900">Help & Support</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 cursor-pointer hover:shadow-md transition-all">
                                            <h4 className="font-bold text-indigo-900 mb-2">Knowledge Base</h4>
                                            <p className="text-sm text-indigo-700 mb-4">Browse tutorials and guides.</p>
                                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">View Articles &rarr;</span>
                                        </div>
                                        <a href="mailto:support@finleybook.com" className="bg-white p-6 rounded-2xl border border-slate-200 cursor-pointer hover:shadow-md transition-all">
                                            <h4 className="font-bold text-slate-900 mb-2">Contact Support</h4>
                                            <p className="text-sm text-slate-500 mb-4">We usually reply within 24 hours.</p>
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Email Us &rarr;</span>
                                        </a>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                        <h4 className="font-bold text-slate-900 mb-4">Troubleshooting</h4>
                                        <button
                                            onClick={handleRestartOnboarding}
                                            className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
                                        >
                                            Reset Onboarding Tour
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
