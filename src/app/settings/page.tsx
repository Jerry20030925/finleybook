'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    QuestionMarkCircleIcon,
    ArrowTopRightOnSquareIcon,
    SparklesIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { AlertTriangle, Zap } from 'lucide-react'
import { updateProfile } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { getUserTransactions } from '@/lib/dataService'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { setStoredReduceMotionPreference } from '@/lib/experience'

type NotificationPreferences = {
    weeklyReport: boolean
    insights: boolean
    updates: boolean
    budgetWarning: boolean
}

const defaultNotificationPreferences: NotificationPreferences = {
    weeklyReport: true,
    insights: true,
    updates: true,
    budgetWarning: true
}

type SettingsSnapshot = {
    displayName: string
    recoveryPhone: string
    language: 'en' | 'zh'
    countryCode: string
    notifications: NotificationPreferences
    experiencePreferences: ExperiencePreferences
    workflowPreferences: WorkflowPreferences
    pushNotificationsEnabled: boolean
}

type ExperiencePreferences = {
    assistantAutopilot: boolean
    beginnerMode: boolean
    reduceMotion: boolean
    weeklyDigestDay: 'monday' | 'friday' | 'sunday'
    aiTone: 'coach' | 'concise' | 'analyst'
}

type WorkflowPreferences = {
    automationPreset: 'safe' | 'balanced' | 'power'
    digestDeliveryMode: 'priority' | 'batched' | 'realtime'
    defaultReportExport: 'pdf' | 'csv' | 'both'
    reportFocusMode: 'balanced' | 'cashflow' | 'savings' | 'anomalies'
    quietHoursEnabled: boolean
    quietHoursStart: string
    quietHoursEnd: string
    workdayOnlyNotifications: boolean
    notificationBypassTypes: Array<'success' | 'info' | 'warning' | 'error' | 'promo' | 'ai-alert'>
    autoOpenWalletCoach: boolean
    stickyMobileActionBar: boolean
    showShortcutHints: boolean
    aiActionApproval: 'suggest_only' | 'confirm_write' | 'auto_safe'
}

const defaultExperiencePreferences: ExperiencePreferences = {
    assistantAutopilot: true,
    beginnerMode: true,
    reduceMotion: false,
    weeklyDigestDay: 'friday',
    aiTone: 'coach',
}

const defaultWorkflowPreferences: WorkflowPreferences = {
    automationPreset: 'balanced',
    digestDeliveryMode: 'priority',
    defaultReportExport: 'pdf',
    reportFocusMode: 'balanced',
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    workdayOnlyNotifications: false,
    notificationBypassTypes: ['warning', 'error', 'ai-alert'],
    autoOpenWalletCoach: true,
    stickyMobileActionBar: true,
    showShortcutHints: true,
    aiActionApproval: 'confirm_write',
}

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
    const [notifications, setNotifications] = useState<NotificationPreferences>(defaultNotificationPreferences)
    const [experiencePreferences, setExperiencePreferences] = useState<ExperiencePreferences>(defaultExperiencePreferences)
    const [workflowPreferences, setWorkflowPreferences] = useState<WorkflowPreferences>(defaultWorkflowPreferences)
    const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false)
    const [savingNotifications, setSavingNotifications] = useState(false)
    const [savingExperience, setSavingExperience] = useState(false)
    const [savingWorkflow, setSavingWorkflow] = useState(false)
    const [settingsSnapshot, setSettingsSnapshot] = useState<SettingsSnapshot | null>(null)

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

    useEffect(() => {
        let cancelled = false

        const loadPersistedSettings = async () => {
            if (!user?.uid || !db) return

            try {
                const userRef = doc(db, 'users', user.uid)
                const snap = await getDoc(userRef)
                if (!snap.exists() || cancelled) return

                const data = snap.data()
                const notificationPreferences = {
                    ...defaultNotificationPreferences,
                    ...(data.notificationPreferences || {})
                } as NotificationPreferences
                const nextExperiencePreferences = {
                    ...defaultExperiencePreferences,
                    ...(data.experiencePreferences || {})
                } as ExperiencePreferences
                const nextWorkflowPreferences = {
                    ...defaultWorkflowPreferences,
                    ...(data.workflowPreferences || {})
                } as WorkflowPreferences

                const nextDisplayName = typeof data.displayName === 'string' && data.displayName.trim().length > 0
                    ? data.displayName
                    : (user.displayName || '')
                const nextRecoveryPhone = typeof data.phoneNumber === 'string'
                    ? data.phoneNumber
                    : (user.phoneNumber || '')
                const nextLanguage = data.language === 'zh' ? 'zh' : language
                const nextCountryCode = typeof data.countryCode === 'string' && data.countryCode
                    ? data.countryCode
                    : country.code
                const nextPushEnabled = Boolean(data.pushNotificationsEnabled)
                const nextTwoFactorEnabled = typeof data.twoFactorEnabled === 'boolean'
                    ? data.twoFactorEnabled
                    : Boolean(user?.twoFactorEnabled)

                setDisplayName(nextDisplayName)
                setRecoveryPhone(nextRecoveryPhone)
                setNotifications(notificationPreferences)
                setExperiencePreferences(nextExperiencePreferences)
                setWorkflowPreferences(nextWorkflowPreferences)
                setStoredReduceMotionPreference(nextExperiencePreferences.reduceMotion)
                setPushNotificationsEnabled(nextPushEnabled)
                setTwoFactorEnabled(nextTwoFactorEnabled)
                setLanguage(nextLanguage)
                setCountry(nextCountryCode as any)

                setSettingsSnapshot({
                    displayName: nextDisplayName,
                    recoveryPhone: nextRecoveryPhone,
                    language: nextLanguage,
                    countryCode: nextCountryCode,
                    notifications: notificationPreferences,
                    experiencePreferences: nextExperiencePreferences,
                    workflowPreferences: nextWorkflowPreferences,
                    pushNotificationsEnabled: nextPushEnabled
                })
            } catch (error) {
                console.error('Failed to load persisted settings:', error)
            }
        }

        void loadPersistedSettings()
        return () => {
            cancelled = true
        }
    }, [user?.uid])

    useEffect(() => {
        if (!user || settingsSnapshot) return
        setSettingsSnapshot({
            displayName: user.displayName || '',
            recoveryPhone: user.phoneNumber || '',
            language,
            countryCode: country.code,
            notifications,
            experiencePreferences,
            workflowPreferences,
            pushNotificationsEnabled
        })
    }, [user, settingsSnapshot, language, country.code, notifications, experiencePreferences, workflowPreferences, pushNotificationsEnabled])

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
                phoneNumber: recoveryPhone,
                language,
                countryCode: country.code,
                updatedAt: new Date()
            }, { merge: true })

            setSettingsSnapshot((prev) => prev ? {
                ...prev,
                displayName,
                recoveryPhone,
                language,
                countryCode: country.code
            } : prev)
            toast.success(t('settings.success'))
        } catch (error) {
            console.error('Error saving settings:', error)
            toast.error(t('settings.error'))
        } finally {
            setSaving(false)
        }
    }

    const handleNotificationToggle = (key: keyof NotificationPreferences) => {
        setNotifications((prev) => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const handleSaveNotifications = async () => {
        if (!user) return
        setSavingNotifications(true)
        try {
            await setDoc(doc(db, 'users', user.uid), {
                notificationPreferences: notifications,
                pushNotificationsEnabled,
                updatedAt: new Date()
            }, { merge: true })

            setSettingsSnapshot((prev) => prev ? {
                ...prev,
                notifications,
                pushNotificationsEnabled
            } : prev)
            toast.success('Notification preferences saved')
        } catch (error) {
            console.error('Failed to save notification settings:', error)
            toast.error('Could not save notification settings')
        } finally {
            setSavingNotifications(false)
        }
    }

    const handleExperienceToggle = (key: keyof Pick<ExperiencePreferences, 'assistantAutopilot' | 'beginnerMode' | 'reduceMotion'>) => {
        setExperiencePreferences((prev) => {
            const next = {
                ...prev,
                [key]: !prev[key]
            }

            if (key === 'reduceMotion') {
                setStoredReduceMotionPreference(next.reduceMotion)
            }

            return next
        })
    }

    const handleSaveExperience = async () => {
        if (!user) return
        setSavingExperience(true)
        try {
            setStoredReduceMotionPreference(experiencePreferences.reduceMotion)
            await setDoc(doc(db, 'users', user.uid), {
                experiencePreferences,
                updatedAt: new Date()
            }, { merge: true })

            setSettingsSnapshot((prev) => prev ? {
                ...prev,
                experiencePreferences
            } : prev)
            toast.success('Experience preferences saved')
        } catch (error) {
            console.error('Failed to save experience settings:', error)
            toast.error('Could not save experience settings')
        } finally {
            setSavingExperience(false)
        }
    }

    const applyWorkflowPreset = (preset: WorkflowPreferences['automationPreset']) => {
        if (preset === 'safe') {
            setWorkflowPreferences({
                automationPreset: 'safe',
                digestDeliveryMode: 'priority',
                defaultReportExport: 'pdf',
                reportFocusMode: 'balanced',
                quietHoursEnabled: true,
                quietHoursStart: '21:30',
                quietHoursEnd: '07:30',
                workdayOnlyNotifications: true,
                notificationBypassTypes: ['warning', 'error', 'ai-alert'],
                autoOpenWalletCoach: true,
                stickyMobileActionBar: true,
                showShortcutHints: true,
                aiActionApproval: 'confirm_write',
            })
            return
        }

        if (preset === 'power') {
            setWorkflowPreferences({
                automationPreset: 'power',
                digestDeliveryMode: 'realtime',
                defaultReportExport: 'both',
                reportFocusMode: 'anomalies',
                quietHoursEnabled: false,
                quietHoursStart: '23:00',
                quietHoursEnd: '06:00',
                workdayOnlyNotifications: false,
                notificationBypassTypes: ['info', 'warning', 'error', 'ai-alert'],
                autoOpenWalletCoach: true,
                stickyMobileActionBar: true,
                showShortcutHints: false,
                aiActionApproval: 'auto_safe',
            })
            return
        }

        setWorkflowPreferences({
            automationPreset: 'balanced',
            digestDeliveryMode: 'batched',
            defaultReportExport: 'pdf',
            reportFocusMode: 'balanced',
            quietHoursEnabled: true,
            quietHoursStart: '22:00',
            quietHoursEnd: '07:00',
            workdayOnlyNotifications: false,
            notificationBypassTypes: ['warning', 'error', 'ai-alert'],
            autoOpenWalletCoach: true,
            stickyMobileActionBar: true,
            showShortcutHints: true,
            aiActionApproval: 'confirm_write',
        })
    }

    const handleWorkflowToggle = (key: keyof Pick<WorkflowPreferences, 'autoOpenWalletCoach' | 'stickyMobileActionBar' | 'showShortcutHints' | 'quietHoursEnabled' | 'workdayOnlyNotifications'>) => {
        setWorkflowPreferences((prev) => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const toggleWorkflowBypassType = (type: WorkflowPreferences['notificationBypassTypes'][number]) => {
        setWorkflowPreferences((prev) => ({
            ...prev,
            notificationBypassTypes: prev.notificationBypassTypes.includes(type)
                ? prev.notificationBypassTypes.filter((item) => item !== type)
                : [...prev.notificationBypassTypes, type]
        }))
    }

    const handleSaveWorkflowPreferences = async () => {
        if (!user) return
        setSavingWorkflow(true)
        try {
            await setDoc(doc(db, 'users', user.uid), {
                workflowPreferences,
                updatedAt: new Date()
            }, { merge: true })

            if (typeof window !== 'undefined') {
                localStorage.setItem(`finley_workflow_preferences_${user.uid}`, JSON.stringify(workflowPreferences))
                window.dispatchEvent(new CustomEvent('finley:workflow-preferences-updated', { detail: workflowPreferences }))
            }

            setSettingsSnapshot((prev) => prev ? {
                ...prev,
                workflowPreferences
            } : prev)

            toast.success('Automation preferences saved')
        } catch (error) {
            console.error('Failed to save workflow preferences:', error)
            toast.error('Could not save automation preferences')
        } finally {
            setSavingWorkflow(false)
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
        { id: 'experience', name: 'Experience', icon: SparklesIcon },
        { id: 'automation', name: 'Automation', icon: Cog6ToothIcon },
        { id: 'notifications', name: t('settings.tabs.notifications'), icon: BellIcon },
        { id: 'security', name: t('settings.tabs.security'), icon: ShieldCheckIcon },
        { id: 'subscription', name: t('settings.tabs.subscription'), icon: CreditCardIcon },
        { id: 'help', name: 'Help Center', icon: QuestionMarkCircleIcon },
    ]

    const hasGeneralChanges = settingsSnapshot
        ? settingsSnapshot.displayName !== displayName
            || settingsSnapshot.recoveryPhone !== recoveryPhone
            || settingsSnapshot.language !== language
            || settingsSnapshot.countryCode !== country.code
        : false

    const hasNotificationChanges = settingsSnapshot
        ? settingsSnapshot.pushNotificationsEnabled !== pushNotificationsEnabled
            || JSON.stringify(settingsSnapshot.notifications) !== JSON.stringify(notifications)
        : false
    const hasExperienceChanges = settingsSnapshot
        ? JSON.stringify(settingsSnapshot.experiencePreferences) !== JSON.stringify(experiencePreferences)
        : false
    const hasWorkflowChanges = settingsSnapshot
        ? JSON.stringify(settingsSnapshot.workflowPreferences) !== JSON.stringify(workflowPreferences)
        : false

    const profileChecklist = [
        { label: 'Display name', done: displayName.trim().length > 0 },
        { label: 'Profile photo', done: Boolean(photoURL) },
        { label: 'Recovery phone', done: recoveryPhone.trim().length > 0 },
        { label: '2FA enabled', done: twoFactorEnabled }
    ]
    const profileCompletion = Math.round((profileChecklist.filter((item) => item.done).length / profileChecklist.length) * 100)
    const unsavedChangeCount = [hasGeneralChanges, hasNotificationChanges, hasExperienceChanges, hasWorkflowChanges].filter(Boolean).length

    const settingsAssistantSummary = (() => {
        if (unsavedChangeCount > 0) {
            return {
                tone: 'warning' as const,
                title: `You have ${unsavedChangeCount} unsaved settings section${unsavedChangeCount > 1 ? 's' : ''}`,
                detail: 'Save changes before leaving this page so AI guidance, notifications, and preferences stay in sync.',
            }
        }
        if (profileCompletion < 100) {
            return {
                tone: 'info' as const,
                title: 'Complete your profile and recovery settings',
                detail: 'Finishing profile photo, phone, and 2FA improves security and helps Finley AI personalize recommendations.',
            }
        }
        return {
            tone: 'success' as const,
            title: 'Settings are in a healthy state',
            detail: 'Your profile, notifications, and experience preferences are configured and ready.',
        }
    })()

    const settingsQuickActions = [
        {
            id: 'action-general',
            label: 'Profile',
            description: profileCompletion < 100 ? `Complete profile (${profileCompletion}%)` : 'Review profile details',
            tab: 'general',
            icon: UserCircleIcon,
            highlighted: profileCompletion < 100 || hasGeneralChanges,
        },
        {
            id: 'action-notifications',
            label: 'Notifications',
            description: hasNotificationChanges ? 'Save notification updates' : 'Review alerts and weekly reports',
            tab: 'notifications',
            icon: BellIcon,
            highlighted: hasNotificationChanges,
        },
        {
            id: 'action-security',
            label: 'Security',
            description: twoFactorEnabled ? '2FA enabled' : 'Enable 2FA and recovery options',
            tab: 'security',
            icon: ShieldCheckIcon,
            highlighted: !twoFactorEnabled,
        },
        {
            id: 'action-experience',
            label: 'AI Experience',
            description: hasExperienceChanges ? 'Save AI/UX preferences' : 'Tune AI tone and guidance mode',
            tab: 'experience',
            icon: SparklesIcon,
            highlighted: hasExperienceChanges,
        },
        {
            id: 'action-automation',
            label: 'Automation',
            description: hasWorkflowChanges ? 'Save workflow defaults' : 'Tune reminders, exports, and action rules',
            tab: 'automation',
            icon: Cog6ToothIcon,
            highlighted: hasWorkflowChanges,
        },
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
                    <nav className="w-full flex flex-row overflow-x-auto gap-2 pb-2 lg:pb-0 lg:flex-col lg:w-64 lg:gap-2 flex-shrink-0 scrollbar-hide">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${isActive
                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                        : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-100'
                                        } group flex items-center px-4 py-3 text-sm font-bold transition-all duration-200 rounded-xl relative overflow-hidden flex-shrink-0 whitespace-nowrap lg:w-full`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="settingsActiveTab"
                                            className="absolute inset-0 bg-slate-900 rounded-xl"
                                            style={{ zIndex: 0 }}
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <tab.icon
                                        className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                                            } mr-3 h-5 w-5 flex-shrink-0 transition-colors relative z-10`}
                                        aria-hidden="true"
                                    />
                                    <span className="relative z-10">{tab.name}</span>
                                    {isActive && (
                                        <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse hidden lg:block z-10" />
                                    )}
                                </button>
                            )
                        })}
                    </nav>

                    {/* Content Area */}
                    <div className="flex-1 bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 sm:p-10 min-h-[600px] border border-slate-100 relative overflow-hidden">
                        <div className="relative z-10 mb-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">Finley Settings Assistant</p>
                                    <h3 className="mt-1 text-lg font-bold text-slate-900">{settingsAssistantSummary.title}</h3>
                                    <p className="mt-1 text-sm text-slate-600 max-w-2xl">{settingsAssistantSummary.detail}</p>
                                </div>
                                <div className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                    settingsAssistantSummary.tone === 'warning'
                                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                                        : settingsAssistantSummary.tone === 'success'
                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                            : 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                }`}>
                                    <SparklesIcon className="h-4 w-4 mr-1.5" />
                                    {settingsAssistantSummary.tone === 'warning' ? 'Action needed' : settingsAssistantSummary.tone === 'success' ? 'Healthy' : 'Suggested'}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                                {settingsQuickActions.map((action) => (
                                    <button
                                        key={action.id}
                                        onClick={() => setActiveTab(action.tab)}
                                        className={`rounded-xl border p-3 text-left transition ${
                                            action.highlighted
                                                ? 'border-indigo-200 bg-indigo-50/70 hover:bg-indigo-50'
                                                : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                    >
                                        <action.icon className={`h-5 w-5 mb-2 ${action.highlighted ? 'text-indigo-600' : 'text-slate-500'}`} />
                                        <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">{action.description}</p>
                                    </button>
                                ))}
                            </div>

                            {unsavedChangeCount > 0 && (
                                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <p className="text-sm text-amber-800">
                                        Unsaved changes detected in {hasGeneralChanges && 'Profile '} {hasNotificationChanges && 'Notifications '} {hasExperienceChanges && 'AI Experience '} {hasWorkflowChanges && 'Automation'}.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {hasGeneralChanges && (
                                            <button onClick={() => setActiveTab('general')} className="rounded-md border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50">
                                                Open Profile
                                            </button>
                                        )}
                                        {hasNotificationChanges && (
                                            <button onClick={() => setActiveTab('notifications')} className="rounded-md border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50">
                                                Open Notifications
                                            </button>
                                        )}
                                        {hasExperienceChanges && (
                                            <button onClick={() => setActiveTab('experience')} className="rounded-md border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50">
                                                Open AI Experience
                                            </button>
                                        )}
                                        {hasWorkflowChanges && (
                                            <button onClick={() => setActiveTab('automation')} className="rounded-md border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50">
                                                Open Automation
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tab Content Animations */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                className="relative z-10"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            >
                            {activeTab === 'general' && (
                                <div className="space-y-8">
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
                                                        className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2.5 bg-slate-50 focus:bg-white transition-colors text-slate-900 font-medium placeholder-slate-400"
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

                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Phone Number
                                            </label>
                                            <div className="flex rounded-lg shadow-sm">
                                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-gray-500 sm:text-sm">
                                                    {country.phoneCode || '+xx'}
                                                </span>
                                                <input
                                                    type="tel"
                                                    value={recoveryPhone}
                                                    onChange={(e) => setRecoveryPhone(e.target.value)}
                                                    className="flex-1 block w-full min-w-0 rounded-none rounded-r-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2.5 bg-slate-50 focus:bg-white transition-colors text-slate-900 font-medium placeholder-slate-400"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500">Used for account recovery and identity verification.</p>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div>
                                                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold">Account Completion</p>
                                                <h4 className="mt-1 text-lg font-bold text-slate-900">{profileCompletion}% ready</h4>
                                            </div>
                                            <p className="text-sm text-slate-600 max-w-md">
                                                Complete core profile and security fields for smoother onboarding, safer recovery, and better AI guidance quality.
                                            </p>
                                        </div>
                                        <div className="mt-4 h-2 rounded-full bg-slate-200 overflow-hidden">
                                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
                                        </div>
                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {profileChecklist.map((item) => (
                                                <div key={item.label} className={`rounded-lg px-3 py-2 text-sm border ${item.done ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                                                    {item.done ? '✓' : '○'} {item.label}
                                                </div>
                                            ))}
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
                                                        className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-slate-900 font-medium"
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
                                                        className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-slate-900 font-medium"
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

                                    <div className="flex items-center justify-between pt-4 gap-3">
                                        <p className="text-xs text-slate-500">
                                            {hasGeneralChanges ? 'You have unsaved profile or regional changes.' : 'All profile and regional settings are saved.'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            disabled={saving || !hasGeneralChanges}
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
                                        {[
                                            { key: 'weeklyReport', title: 'Weekly Report Summary', description: 'A concise weekly financial briefing in your inbox.' },
                                            { key: 'insights', title: 'AI Insight Alerts', description: 'Priority alerts when Finley detects meaningful trends.' },
                                            { key: 'budgetWarning', title: 'Budget Warning', description: 'Warnings when spending velocity exceeds your cap.' },
                                            { key: 'updates', title: 'Product Updates', description: 'Major product updates and newly released capabilities.' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                                                <div>
                                                    <div className="font-medium text-slate-900">{item.title}</div>
                                                    <div className="text-sm text-slate-500">{item.description}</div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notifications[item.key as keyof typeof notifications]}
                                                        onChange={() => handleNotificationToggle(item.key as keyof NotificationPreferences)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-shrink-0">
                                                <BellIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                                            </div>
                                            <div className="w-0 flex-1 pt-0.5">
                                                <p className="text-sm font-medium text-blue-900">
                                                    Smart Push Notifications
                                                </p>
                                                <p className="mt-1 text-sm text-blue-700">
                                                    Receive real-time alerts for unusual spending and AI risk signals.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setPushNotificationsEnabled((prev) => !prev)}
                                                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${pushNotificationsEnabled ? 'bg-primary-600' : 'bg-slate-300'}`}
                                            >
                                                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${pushNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs text-slate-500">
                                            {hasNotificationChanges ? 'You have unsaved notification changes.' : 'Notification settings are up to date.'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleSaveNotifications}
                                            disabled={savingNotifications || !hasNotificationChanges}
                                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 py-2.5 px-6 text-sm font-bold text-white shadow-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {savingNotifications ? 'Saving...' : 'Save Notification Settings'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'experience' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <h3 className="text-xl font-bold text-slate-900">Experience Preferences</h3>
                                    <p className="text-sm text-slate-500 -mt-4">
                                        Make FinleyBook easier for beginners, faster for power users, and more consistent with your workflow.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                                            <p className="text-sm font-semibold text-slate-900">Assistant Autopilot Suggestions</p>
                                            <p className="mt-1 text-sm text-slate-500">Show context-aware steps after major actions like adding transactions or finishing a report.</p>
                                            <button
                                                onClick={() => handleExperienceToggle('assistantAutopilot')}
                                                className={`mt-4 relative inline-flex h-7 w-12 rounded-full transition-colors ${experiencePreferences.assistantAutopilot ? 'bg-primary-600' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-6 w-6 rounded-full bg-white shadow transform transition ${experiencePreferences.assistantAutopilot ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                            </button>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                                            <p className="text-sm font-semibold text-slate-900">Beginner Guidance Mode</p>
                                            <p className="mt-1 text-sm text-slate-500">Display clearer hints on key pages so new users can learn where to click and what to do next.</p>
                                            <button
                                                onClick={() => handleExperienceToggle('beginnerMode')}
                                                className={`mt-4 relative inline-flex h-7 w-12 rounded-full transition-colors ${experiencePreferences.beginnerMode ? 'bg-primary-600' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-6 w-6 rounded-full bg-white shadow transform transition ${experiencePreferences.beginnerMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                            </button>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                                            <p className="text-sm font-semibold text-slate-900">Reduced Motion</p>
                                            <p className="mt-1 text-sm text-slate-500">Reduce animation intensity for smoother interaction on lower-end devices.</p>
                                            <button
                                                onClick={() => handleExperienceToggle('reduceMotion')}
                                                className={`mt-4 relative inline-flex h-7 w-12 rounded-full transition-colors ${experiencePreferences.reduceMotion ? 'bg-primary-600' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-6 w-6 rounded-full bg-white shadow transform transition ${experiencePreferences.reduceMotion ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                            </button>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                                            <p className="text-sm font-semibold text-slate-900">AI Reply Style</p>
                                            <p className="mt-1 text-sm text-slate-500">Choose how Finley AI responds to your bookkeeping and planning questions.</p>
                                            <select
                                                value={experiencePreferences.aiTone}
                                                onChange={(e) => setExperiencePreferences((prev) => ({ ...prev, aiTone: e.target.value as ExperiencePreferences['aiTone'] }))}
                                                className="mt-4 block w-full rounded-lg border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                            >
                                                <option value="coach">Coach (step-by-step)</option>
                                                <option value="concise">Concise (short and direct)</option>
                                                <option value="analyst">Analyst (data-first)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Weekly Digest Delivery</label>
                                        <p className="text-sm text-slate-500 mb-4">Choose when your weekly briefing arrives with spending trend and next actions.</p>
                                        <select
                                            value={experiencePreferences.weeklyDigestDay}
                                            onChange={(e) => setExperiencePreferences((prev) => ({ ...prev, weeklyDigestDay: e.target.value as ExperiencePreferences['weeklyDigestDay'] }))}
                                            className="block max-w-xs w-full rounded-lg border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                        >
                                            <option value="monday">Monday morning</option>
                                            <option value="friday">Friday evening</option>
                                            <option value="sunday">Sunday afternoon</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs text-slate-500">
                                            {hasExperienceChanges ? 'You have unsaved experience preferences.' : 'Experience preferences are up to date.'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleSaveExperience}
                                            disabled={savingExperience || !hasExperienceChanges}
                                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 py-2.5 px-6 text-sm font-bold text-white shadow-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {savingExperience ? 'Saving...' : 'Save Experience Preferences'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'automation' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Automation Preferences Center</h3>
                                        <p className="mt-2 text-sm text-slate-500">
                                            Centralize Finley defaults for reminders, report outputs, wallet action prompts, and AI execution safety rules.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                                            <div>
                                                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold">Automation Presets</p>
                                                <h4 className="mt-1 text-lg font-bold text-slate-900">Choose a workflow style</h4>
                                                <p className="mt-1 text-sm text-slate-500">Apply a preset, then fine-tune each default below.</p>
                                            </div>
                                            <div className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                                workflowPreferences.automationPreset === 'power'
                                                    ? 'border-purple-200 bg-purple-50 text-purple-700'
                                                    : workflowPreferences.automationPreset === 'safe'
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        : 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                            }`}>
                                                <Cog6ToothIcon className="h-4 w-4 mr-1.5" />
                                                {workflowPreferences.automationPreset === 'safe' ? 'Safe / Guided' : workflowPreferences.automationPreset === 'power' ? 'Power User' : 'Balanced'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {[
                                                {
                                                    id: 'safe' as const,
                                                    title: 'Safe / Guided',
                                                    desc: 'Best for newer users. Priority alerts, PDF default, and confirmation before AI write actions.',
                                                    tone: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100/60',
                                                },
                                                {
                                                    id: 'balanced' as const,
                                                    title: 'Balanced',
                                                    desc: 'Good default for most users with batched digests and confirm-before-write behavior.',
                                                    tone: 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100/60',
                                                },
                                                {
                                                    id: 'power' as const,
                                                    title: 'Power User',
                                                    desc: 'Real-time updates, dual export defaults, anomaly focus, and auto-safe AI actions.',
                                                    tone: 'border-purple-200 bg-purple-50 hover:bg-purple-100/60',
                                                },
                                            ].map((preset) => (
                                                <button
                                                    key={preset.id}
                                                    type="button"
                                                    onClick={() => applyWorkflowPreset(preset.id)}
                                                    className={`rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${workflowPreferences.automationPreset === preset.id ? preset.tone : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                                                >
                                                    <p className="text-sm font-semibold text-slate-900">{preset.title}</p>
                                                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{preset.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                                            <h4 className="text-sm font-semibold text-slate-900">Smart Delivery Defaults</h4>
                                            <p className="mt-1 text-sm text-slate-500">Choose how Finley sends reminders and prepares your recurring review outputs.</p>
                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Digest Delivery Mode</label>
                                                    <select
                                                        value={workflowPreferences.digestDeliveryMode}
                                                        onChange={(e) => setWorkflowPreferences((prev) => ({ ...prev, digestDeliveryMode: e.target.value as WorkflowPreferences['digestDeliveryMode'] }))}
                                                        className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                                    >
                                                        <option value="priority">Priority only (important alerts)</option>
                                                        <option value="batched">Batched summary (recommended)</option>
                                                        <option value="realtime">Real-time notifications</option>
                                                    </select>
                                                </div>
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">Quiet hours</p>
                                                            <p className="mt-1 text-xs text-slate-500">Defer non-whitelisted notifications during your focus/sleep window.</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleWorkflowToggle('quietHoursEnabled')}
                                                            className={`relative inline-flex h-7 w-12 flex-shrink-0 rounded-full transition-all duration-200 ${workflowPreferences.quietHoursEnabled ? 'bg-primary-600 shadow-sm shadow-primary-200/70' : 'bg-slate-300'}`}
                                                        >
                                                            <span className={`inline-block h-6 w-6 rounded-full bg-white shadow transform transition duration-200 ${workflowPreferences.quietHoursEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                                        </button>
                                                    </div>
                                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Start</label>
                                                            <input
                                                                type="time"
                                                                value={workflowPreferences.quietHoursStart}
                                                                onChange={(e) => setWorkflowPreferences((prev) => ({ ...prev, quietHoursStart: e.target.value }))}
                                                                disabled={!workflowPreferences.quietHoursEnabled}
                                                                className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">End</label>
                                                            <input
                                                                type="time"
                                                                value={workflowPreferences.quietHoursEnd}
                                                                onChange={(e) => setWorkflowPreferences((prev) => ({ ...prev, quietHoursEnd: e.target.value }))}
                                                                disabled={!workflowPreferences.quietHoursEnabled}
                                                                className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">Workday-only low-priority notifications</p>
                                                            <p className="mt-1 text-xs text-slate-500">On weekends, defer non-whitelisted notifications and surface important items only.</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleWorkflowToggle('workdayOnlyNotifications')}
                                                            className={`relative inline-flex h-7 w-12 flex-shrink-0 rounded-full transition-all duration-200 ${workflowPreferences.workdayOnlyNotifications ? 'bg-primary-600 shadow-sm shadow-primary-200/70' : 'bg-slate-300'}`}
                                                        >
                                                            <span className={`inline-block h-6 w-6 rounded-full bg-white shadow transform transition duration-200 ${workflowPreferences.workdayOnlyNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                                        </button>
                                                    </div>
                                                    <div className="mt-3">
                                                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">Priority bypass whitelist</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {[
                                                                { key: 'error', label: 'Errors' },
                                                                { key: 'warning', label: 'Warnings' },
                                                                { key: 'ai-alert', label: 'AI alerts' },
                                                                { key: 'info', label: 'Info' },
                                                                { key: 'success', label: 'Success' },
                                                                { key: 'promo', label: 'Promos' },
                                                            ].map((item) => {
                                                                const active = workflowPreferences.notificationBypassTypes.includes(item.key as WorkflowPreferences['notificationBypassTypes'][number])
                                                                return (
                                                                    <button
                                                                        key={item.key}
                                                                        type="button"
                                                                        onClick={() => toggleWorkflowBypassType(item.key as WorkflowPreferences['notificationBypassTypes'][number])}
                                                                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                                                                            active
                                                                                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                                                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                                        }`}
                                                                    >
                                                                        {item.label}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                        <p className="mt-2 text-xs text-slate-500">
                                                            Whitelisted notification types can bypass quiet hours and weekend deferral rules.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Default Report Export</label>
                                                    <select
                                                        value={workflowPreferences.defaultReportExport}
                                                        onChange={(e) => setWorkflowPreferences((prev) => ({ ...prev, defaultReportExport: e.target.value as WorkflowPreferences['defaultReportExport'] }))}
                                                        className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                                    >
                                                        <option value="pdf">PDF (executive review)</option>
                                                        <option value="csv">CSV (analysis workflow)</option>
                                                        <option value="both">PDF + CSV (full package)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Report Focus Priority</label>
                                                    <select
                                                        value={workflowPreferences.reportFocusMode}
                                                        onChange={(e) => setWorkflowPreferences((prev) => ({ ...prev, reportFocusMode: e.target.value as WorkflowPreferences['reportFocusMode'] }))}
                                                        className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                                    >
                                                        <option value="balanced">Balanced overview</option>
                                                        <option value="cashflow">Cashflow discipline</option>
                                                        <option value="savings">Savings acceleration</option>
                                                        <option value="anomalies">Anomalies & risk signals</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                                            <h4 className="text-sm font-semibold text-slate-900">AI Execution Guardrails</h4>
                                            <p className="mt-1 text-sm text-slate-500">Define how proactive Finley can be when suggesting or applying safe changes.</p>
                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">AI Action Approval Mode</label>
                                                    <select
                                                        value={workflowPreferences.aiActionApproval}
                                                        onChange={(e) => setWorkflowPreferences((prev) => ({ ...prev, aiActionApproval: e.target.value as WorkflowPreferences['aiActionApproval'] }))}
                                                        className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                                    >
                                                        <option value="suggest_only">Suggest only (no write actions)</option>
                                                        <option value="confirm_write">Confirm before write (recommended)</option>
                                                        <option value="auto_safe">Auto-apply safe actions</option>
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {[
                                                        { key: 'autoOpenWalletCoach' as const, title: 'Auto-open Wallet Action Coach', desc: 'Show payout/readiness prompts on Dashboard and Reports when relevant.' },
                                                        { key: 'stickyMobileActionBar' as const, title: 'Keep mobile action bars pinned', desc: 'Prefer fixed action bars on mobile pages for faster one-thumb actions.' },
                                                        { key: 'showShortcutHints' as const, title: 'Show keyboard shortcut hints', desc: 'Display shortcut hints in advanced pages for faster navigation and actions.' },
                                                    ].map((toggle) => (
                                                        <div key={toggle.key} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:shadow-sm hover:border-slate-300">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900">{toggle.title}</p>
                                                                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{toggle.desc}</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleWorkflowToggle(toggle.key)}
                                                                className={`relative inline-flex h-7 w-12 flex-shrink-0 rounded-full transition-all duration-200 ${workflowPreferences[toggle.key] ? 'bg-primary-600 shadow-sm shadow-primary-200/70' : 'bg-slate-300'}`}
                                                            >
                                                                <span className={`inline-block h-6 w-6 rounded-full bg-white shadow transform transition duration-200 ${workflowPreferences[toggle.key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold mb-2">Automation Impact Preview</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                <p className="text-xs text-slate-500">Reminder style</p>
                                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                                    {workflowPreferences.digestDeliveryMode === 'priority' ? 'Priority only' : workflowPreferences.digestDeliveryMode === 'batched' ? 'Batched summary' : 'Real-time alerts'}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                <p className="text-xs text-slate-500">Export default</p>
                                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                                    {workflowPreferences.defaultReportExport === 'both' ? 'PDF + CSV package' : workflowPreferences.defaultReportExport.toUpperCase()}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                <p className="text-xs text-slate-500">AI write safety</p>
                                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                                    {workflowPreferences.aiActionApproval === 'suggest_only'
                                                        ? 'Suggest only'
                                                        : workflowPreferences.aiActionApproval === 'confirm_write'
                                                            ? 'Confirm before write'
                                                            : 'Auto-safe actions'}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                <p className="text-xs text-slate-500">Notification shielding</p>
                                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                                    {workflowPreferences.quietHoursEnabled ? `${workflowPreferences.quietHoursStart} - ${workflowPreferences.quietHoursEnd}` : 'Quiet hours off'}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {workflowPreferences.workdayOnlyNotifications ? 'Weekend low-priority deferral on' : 'Weekend rule off'} • {workflowPreferences.notificationBypassTypes.length} bypass type{workflowPreferences.notificationBypassTypes.length === 1 ? '' : 's'}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-xs text-slate-500">
                                            These defaults are saved to your account and can be used by Finley assistants, report workflows, mobile action bars, and future automation features.
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs text-slate-500">
                                            {hasWorkflowChanges ? 'You have unsaved automation preference changes.' : 'Automation preferences are up to date.'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleSaveWorkflowPreferences}
                                            disabled={savingWorkflow || !hasWorkflowChanges}
                                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 py-2.5 px-6 text-sm font-bold text-white shadow-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {savingWorkflow ? 'Saving...' : 'Save Automation Preferences'}
                                        </button>
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

                                    <div className="relative group overflow-hidden rounded-2xl">
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-transform duration-500 group-hover:scale-105"></div>
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                        <div className="relative z-10 p-8 sm:p-10 text-white">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 uppercase tracking-wider">
                                                            Current Plan
                                                        </div>
                                                        {user?.subscription?.plan === 'pro' && (
                                                            <div className="px-3 py-1 bg-amber-400 text-black rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                                <Zap size={12} fill="black" /> Active
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h4 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
                                                        {user?.subscription?.plan === 'pro' ? 'Pro Member' : 'Free Plan'}
                                                    </h4>
                                                    <p className="text-indigo-100 max-w-lg text-lg leading-relaxed font-medium">
                                                        {user?.subscription?.plan === 'pro'
                                                            ? 'You are enjoying unlimited AI insights, premium reports, and priority support.'
                                                            : 'Upgrade to unlock unlimited AI scans, advanced reports, and premium planning tools.'}
                                                    </p>
                                                </div>
                                                {user?.subscription?.plan !== 'pro' && (
                                                    <Link
                                                        href="/subscribe"
                                                        className="group/btn relative inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                                                    >
                                                        Upgrade to Pro
                                                        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                                    </Link>
                                                )}
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
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
