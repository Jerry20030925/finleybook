import { Fragment, useEffect, useMemo, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { BellIcon, CheckCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XCircleIcon, TrashIcon, CheckIcon, GiftIcon, SparklesIcon, ArrowTopRightOnSquareIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useLanguage } from './LanguageProvider'
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import clsx from 'clsx'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, deleteDoc, limit } from 'firebase/firestore'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useExperience } from '@/components/ExperienceProvider'
import { useWorkflowPreferences } from '@/hooks/useWorkflowPreferences'
import { MOTION_DURATION, MOTION_EASE, MOTION_SPRING } from '@/lib/motionTokens'

interface AppNotification {
    id: string
    title: string
    body: string
    type: 'success' | 'info' | 'warning' | 'error' | 'promo' | 'ai-alert'
    link?: string
    isRead: boolean
    createdAt: any
}

const VALID_NOTIFICATION_TYPES: AppNotification['type'][] = ['success', 'info', 'warning', 'error', 'promo', 'ai-alert']

const normalizeNotification = (id: string, raw: Record<string, unknown>): AppNotification => {
    const rawType = typeof raw.type === 'string' ? raw.type : 'info'
    const type = VALID_NOTIFICATION_TYPES.includes(rawType as AppNotification['type'])
        ? (rawType as AppNotification['type'])
        : 'info'

    const title = typeof raw.title === 'string' && raw.title.trim().length > 0
        ? raw.title
        : 'Notification'
    const body = typeof raw.body === 'string'
        ? raw.body
        : ''

    return {
        id,
        title,
        body,
        type,
        link: typeof raw.link === 'string' ? raw.link : undefined,
        isRead: Boolean(raw.isRead),
        createdAt: raw.createdAt ?? null,
    }
}

const parseTimeToMinutes = (value: string) => {
    const [hours, minutes] = String(value || '').split(':').map(Number)
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
    return Math.max(0, Math.min(23, hours)) * 60 + Math.max(0, Math.min(59, minutes))
}

const isCurrentTimeWithinQuietHours = (start: string, end: string, now = new Date()) => {
    const startMinutes = parseTimeToMinutes(start)
    const endMinutes = parseTimeToMinutes(end)
    if (startMinutes === null || endMinutes === null) return false

    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    if (startMinutes === endMinutes) return false
    if (startMinutes < endMinutes) {
        return nowMinutes >= startMinutes && nowMinutes < endMinutes
    }
    return nowMinutes >= startMinutes || nowMinutes < endMinutes
}

const getIcon = (type: AppNotification['type']) => {
    switch (type) {
        case 'success':
            return <div className="p-2 bg-green-100 rounded-full"><CheckCircleIcon className="h-5 w-5 text-green-600" /></div>
        case 'warning':
            return <div className="p-2 bg-yellow-100 rounded-full"><ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" /></div>
        case 'error':
            return <div className="p-2 bg-red-100 rounded-full"><XCircleIcon className="h-5 w-5 text-red-600" /></div>
        case 'promo':
            return <div className="p-2 bg-purple-100 rounded-full"><GiftIcon className="h-5 w-5 text-purple-600" /></div>
        case 'ai-alert':
            return <div className="p-2 bg-indigo-100 rounded-full"><SparklesIcon className="h-5 w-5 text-indigo-600" /></div>
        default:
            return <div className="p-2 bg-blue-100 rounded-full"><InformationCircleIcon className="h-5 w-5 text-blue-600" /></div>
    }
}

export default function NotificationCenter({ className, mobileSheet = false }: { className?: string, mobileSheet?: boolean }) {
    const { user } = useAuth()
    const { t, language } = useLanguage()
    const [notifications, setNotifications] = useState<AppNotification[]>([])
    const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'action'>('all')
    const [hasManualFilterChoice, setHasManualFilterChoice] = useState(false)
    const [showDeferredNotifications, setShowDeferredNotifications] = useState(false)
    const router = useRouter()
    const { allowRichMotion, reduceMotion } = useExperience()
    const workflowPreferences = useWorkflowPreferences(user?.uid)

    const dateLocale = language === 'en' ? enUS : zhCN
    const unreadCount = notifications.filter(n => !n.isRead).length
    const actionRequiredCount = notifications.filter((n) => !n.isRead && (n.type === 'warning' || n.type === 'error' || n.type === 'ai-alert')).length
    const readCount = notifications.length - unreadCount
    const digestMode = workflowPreferences.digestDeliveryMode
    const prefersReducedMotion = reduceMotion
    const allowPanelLayoutMotion = allowRichMotion && !mobileSheet
    const useBackdropBlur = allowRichMotion
    const dayOfWeek = new Date().getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const quietHoursActive = workflowPreferences.quietHoursEnabled
        && isCurrentTimeWithinQuietHours(workflowPreferences.quietHoursStart, workflowPreferences.quietHoursEnd)
    const weekendDeferralActive = workflowPreferences.workdayOnlyNotifications && isWeekend
    const deferralActive = quietHoursActive || weekendDeferralActive
    const bypassTypes = Array.isArray(workflowPreferences.notificationBypassTypes)
        ? workflowPreferences.notificationBypassTypes
        : []

    useEffect(() => {
        if (!user) return

        const q = query(
            collection(db, 'users', user.uid, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(120)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notes = snapshot.docs.map((doc) => normalizeNotification(doc.id, doc.data() as Record<string, unknown>))
            setNotifications(notes)
        })

        return () => unsubscribe()
    }, [user])

    useEffect(() => {
        if (hasManualFilterChoice) return

        if (digestMode === 'priority') {
            if (actionRequiredCount > 0) {
                setFilterMode('action')
                return
            }
            if (unreadCount > 0) {
                setFilterMode('unread')
                return
            }
            setFilterMode('all')
            return
        }

        if (digestMode === 'batched') {
            setFilterMode(unreadCount > 0 ? 'unread' : 'all')
            return
        }

        setFilterMode('all')
    }, [actionRequiredCount, digestMode, hasManualFilterChoice, unreadCount])

    useEffect(() => {
        if (!deferralActive) {
            setShowDeferredNotifications(false)
        }
    }, [deferralActive])

    const markAsRead = async (id: string) => {
        if (!user) return
        const ref = doc(db, 'users', user.uid, 'notifications', id)
        await updateDoc(ref, { isRead: true })
    }

    const markAllAsRead = async () => {
        if (!user) return
        const batch = writeBatch(db)
        notifications.forEach(n => {
            if (!n.isRead) {
                const ref = doc(db, 'users', user.uid, 'notifications', n.id)
                batch.update(ref, { isRead: true })
            }
        })
        await batch.commit()
    }

    const clearAll = async () => {
        if (!user) return
        const batch = writeBatch(db)
        notifications.forEach(n => {
            const ref = doc(db, 'users', user.uid, 'notifications', n.id)
            batch.delete(ref)
        })
        await batch.commit()
    }

    const clearRead = async () => {
        if (!user) return
        const readNotifications = notifications.filter((n) => n.isRead)
        if (readNotifications.length === 0) return
        const batch = writeBatch(db)
        readNotifications.forEach((n) => {
            const ref = doc(db, 'users', user.uid, 'notifications', n.id)
            batch.delete(ref)
        })
        await batch.commit()
    }

    const removeNotification = async (id: string) => {
        if (!user) return
        const ref = doc(db, 'users', user.uid, 'notifications', id)
        await deleteDoc(ref)
    }

    const handleNotificationClick = async (notification: AppNotification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id)
        }
        if (notification.link) {
            const link = notification.link.startsWith('/') ? notification.link : `/${notification.link}`
            router.push(link)
        }
    }

    const filteredNotifications = useMemo(() => {
        let base = notifications
        if (filterMode === 'unread') {
            base = notifications.filter((notification) => !notification.isRead)
        } else if (filterMode === 'action') {
            base = notifications.filter((notification) => !notification.isRead && (notification.type === 'warning' || notification.type === 'error' || notification.type === 'ai-alert'))
        }
        return base
    }, [filterMode, notifications])

    const deferredNotifications = useMemo(() => {
        if (!deferralActive) return []
        return filteredNotifications.filter((notification) => !bypassTypes.includes(notification.type))
    }, [bypassTypes, deferralActive, filteredNotifications])

    const visibleNotifications = useMemo(() => {
        let base = filteredNotifications

        if (deferralActive && !showDeferredNotifications) {
            base = filteredNotifications.filter((notification) => bypassTypes.includes(notification.type))
        }

        const priorityWeight = (notification: AppNotification) => {
            const unreadBonus = notification.isRead ? 0 : 10
            const typeWeight =
                notification.type === 'error' ? 6 :
                    notification.type === 'warning' ? 5 :
                        notification.type === 'ai-alert' ? 4 :
                            notification.type === 'info' ? 2 :
                                notification.type === 'success' ? 1 : 0
            return unreadBonus + typeWeight
        }

        if (digestMode === 'priority') {
            return [...base].sort((a, b) => priorityWeight(b) - priorityWeight(a))
        }

        if (digestMode === 'batched') {
            const sorted = [...base].sort((a, b) => {
                if (a.isRead !== b.isRead) return a.isRead ? 1 : -1
                const aImportant = a.type === 'warning' || a.type === 'error' || a.type === 'ai-alert'
                const bImportant = b.type === 'warning' || b.type === 'error' || b.type === 'ai-alert'
                if (aImportant !== bImportant) return aImportant ? -1 : 1
                return 0
            })
            return filterMode === 'all' ? sorted.slice(0, 60) : sorted
        }

        return base
    }, [bypassTypes, deferralActive, digestMode, filteredNotifications, showDeferredNotifications])

    const digestModeSummary = useMemo(() => {
        if (digestMode === 'priority') {
            return {
                label: language === 'zh' ? '优先模式' : 'Priority mode',
                detail: language === 'zh' ? '默认优先显示需要处理和未读通知。' : 'Defaults to action-required and unread notifications first.',
                tone: 'amber' as const,
            }
        }
        if (digestMode === 'batched') {
            return {
                label: language === 'zh' ? '批量摘要' : 'Batched digest',
                detail: language === 'zh' ? '默认聚焦未读通知，全部视图会压缩显示最近通知。' : 'Defaults to unread-first and compresses the All view to recent notifications.',
                tone: 'indigo' as const,
            }
        }
        return {
            label: language === 'zh' ? '实时提醒' : 'Real-time alerts',
            detail: language === 'zh' ? '按时间顺序显示全部通知。' : 'Shows notifications in full chronological flow.',
            tone: 'emerald' as const,
        }
    }, [digestMode, language])

    const smartSummary = useMemo(() => {
        if (notifications.length === 0) {
            return {
                tone: 'neutral' as const,
                title: language === 'zh' ? '通知中心已清空' : 'Notification center is clear',
                body: language === 'zh' ? '当前没有新的提醒。你可以继续记账、设置预算或生成报告。' : 'No new notifications. Continue bookkeeping, set a budget, or generate a report.',
                cta: { label: language === 'zh' ? '打开交易页' : 'Open Transactions', href: '/transactions' }
            }
        }

        if (actionRequiredCount > 0) {
            return {
                tone: 'warning' as const,
                title: language === 'zh' ? `有 ${actionRequiredCount} 条需要处理的提醒` : `${actionRequiredCount} notifications need attention`,
                body: language === 'zh' ? '优先处理 AI 提醒、风险或异常通知，避免错过关键调整时机。' : 'Review AI alerts, warnings, and exceptions first to avoid missing key adjustments.',
                cta: { label: language === 'zh' ? '查看行动提醒' : 'View action items', href: null }
            }
        }

        if (unreadCount > 0) {
            return {
                tone: 'info' as const,
                title: language === 'zh' ? `你有 ${unreadCount} 条未读通知` : `You have ${unreadCount} unread notifications`,
                body: language === 'zh' ? '建议先快速查看未读，再清理已读通知，保持通知中心整洁。' : 'Review unread items first, then clear read notifications to keep the inbox clean.',
                cta: { label: language === 'zh' ? '只看未读' : 'Filter unread', href: null }
            }
        }

        return {
            tone: 'success' as const,
            title: language === 'zh' ? '通知已全部处理' : 'Notifications are up to date',
            body: language === 'zh' ? '所有通知已读。你可以删除已读通知保持整洁。' : 'All notifications are read. You can clear read items to keep things tidy.',
            cta: { label: language === 'zh' ? '清理已读' : 'Clear read', href: null }
        }
    }, [actionRequiredCount, language, notifications.length, unreadCount])

    // Group notifications by date
    const groupedNotifications = visibleNotifications.reduce((groups, notification) => {
        const date = notification.createdAt && typeof notification.createdAt?.toDate === 'function'
            ? notification.createdAt.toDate()
            : new Date()
        let key = 'Earlier'
        if (isToday(date)) key = 'Today'
        else if (isYesterday(date)) key = 'Yesterday'

        if (!groups[key]) groups[key] = []
        groups[key].push(notification)
        return groups
    }, {} as Record<string, AppNotification[]>)

    const groupOrder = ['Today', 'Yesterday', 'Earlier']

    return (
        <Menu as="div" className={`relative ${className || 'ml-3'}`}>
            {({ open, close }: { open: boolean, close: () => void }) => (
            <>
            <div>
                <Menu.Button className={clsx(
                    'relative rounded-full bg-white/80 backdrop-blur-sm text-gray-500 hover:text-gray-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all shadow-sm border border-gray-100',
                    mobileSheet ? 'p-2.5' : 'p-2'
                )}>
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                    {unreadCount > 0 && (
                        <motion.span
                            key={unreadCount}
                            initial={allowRichMotion ? { scale: 0.7, opacity: 0.7 } : false}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={MOTION_SPRING.badge}
                            className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 ring-2 ring-white text-[10px] font-bold text-white flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 shadow-sm"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </Menu.Button>
            </div>
            {mobileSheet && open && (
                <button
                    type="button"
                    aria-label={language === 'zh' ? '关闭通知面板' : 'Close notifications'}
                    onClick={close}
                    className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px]"
                />
            )}
            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95 translate-y-2"
                enterTo="transform opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                leaveTo="transform opacity-0 scale-95 translate-y-2"
            >
                <Menu.Items className={clsx(
                    'z-50 rounded-2xl bg-white/90 shadow-2xl ring-1 ring-black/5 focus:outline-none border border-white/20',
                    useBackdropBlur ? 'backdrop-blur-md' : '',
                    mobileSheet
                        ? 'fixed inset-x-2 top-[calc(env(safe-area-inset-top)+0.5rem)] bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] w-auto mt-0 origin-top'
                        : 'absolute right-0 mt-3 w-[min(24rem,calc(100vw-1rem))] origin-top-right'
                )}>
                    <div className={clsx('px-5 py-4 border-b border-gray-100 bg-white/50 rounded-t-2xl', useBackdropBlur ? 'backdrop-blur-sm' : '')}>
                        <div className="flex justify-between items-center gap-3">
                            <h3 className="text-base font-bold text-gray-900">{t('notifications.title')}</h3>
                            <div className="flex items-center space-x-2">
                                {mobileSheet && (
                                    <button
                                        type="button"
                                        onClick={close}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition"
                                        aria-label={language === 'zh' ? '关闭通知' : 'Close notifications'}
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                )}
                                {readCount > 0 && (
                                    <button
                                        onClick={clearRead}
                                        className="text-xs text-gray-400 hover:text-red-600 font-medium flex items-center transition-colors px-2 py-1 rounded-md hover:bg-red-50"
                                        title={language === 'zh' ? '清理已读通知' : 'Clear read notifications'}
                                    >
                                        <TrashIcon className="h-3.5 w-3.5 mr-1" />
                                        <span>{language === 'zh' ? '清理已读' : 'Clear read'}</span>
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="text-xs text-gray-400 hover:text-red-600 font-medium flex items-center transition-colors px-2 py-1 rounded-md hover:bg-red-50"
                                        title={t('notifications.clear')}
                                    >
                                        <TrashIcon className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <motion.div
                            layout={allowPanelLayoutMotion}
                            transition={prefersReducedMotion ? undefined : MOTION_SPRING.layout}
                            className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={`${smartSummary.tone}-${smartSummary.title}`}
                                        initial={prefersReducedMotion ? false : { opacity: 0, y: 4, filter: 'blur(4px)' }}
                                        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4, filter: 'blur(4px)' }}
                                        transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.out }}
                                        className="min-w-0"
                                    >
                                        <p className={clsx(
                                            'text-sm font-semibold',
                                            smartSummary.tone === 'warning' ? 'text-amber-700' :
                                                smartSummary.tone === 'success' ? 'text-emerald-700' : 'text-slate-900'
                                        )}>
                                            {smartSummary.title}
                                        </p>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-600">{smartSummary.body}</p>
                                    </motion.div>
                                </AnimatePresence>
                                <motion.div layout={allowPanelLayoutMotion} className="flex shrink-0 gap-1">
                                    <span className="rounded-full bg-white border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600">
                                        {language === 'zh' ? `未读 ${unreadCount}` : `${unreadCount} unread`}
                                    </span>
                                    {actionRequiredCount > 0 && (
                                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-1 text-[11px] font-semibold text-amber-700">
                                            {language === 'zh' ? `处理 ${actionRequiredCount}` : `${actionRequiredCount} action`}
                                        </span>
                                    )}
                                </motion.div>
                            </div>
                            <motion.div layout={allowPanelLayoutMotion} className="mt-3 flex flex-wrap gap-2">
                                {[
                                    { key: 'all', label: language === 'zh' ? '全部' : 'All' },
                                    { key: 'unread', label: language === 'zh' ? '未读' : 'Unread' },
                                    { key: 'action', label: language === 'zh' ? '行动优先' : 'Action' }
                                ].map((item) => (
                                    <motion.button
                                        key={item.key}
                                        onClick={() => {
                                            setHasManualFilterChoice(true)
                                            setFilterMode(item.key as 'all' | 'unread' | 'action')
                                        }}
                                        whileHover={allowPanelLayoutMotion ? { y: -1 } : undefined}
                                        whileTap={allowPanelLayoutMotion ? { scale: 0.98 } : undefined}
                                        className={clsx(
                                            'relative overflow-hidden px-2.5 py-1 rounded-full text-xs font-semibold transition-colors border',
                                            filterMode === item.key
                                                ? 'text-white border-indigo-600'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        )}
                                    >
                                        {allowPanelLayoutMotion && filterMode === item.key && (
                                            <motion.span
                                                layoutId="notification-filter-pill"
                                                className="absolute inset-0 rounded-full bg-indigo-600"
                                                transition={MOTION_SPRING.pill}
                                            />
                                        )}
                                        <span className="relative z-10">{item.label}</span>
                                    </motion.button>
                                ))}
                                <motion.span
                                    layout={allowPanelLayoutMotion}
                                    key={`${digestModeSummary.label}-${digestModeSummary.tone}`}
                                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: MOTION_DURATION.fast }}
                                    className={clsx(
                                    'px-2.5 py-1 rounded-full text-xs font-semibold border',
                                    digestModeSummary.tone === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                        digestModeSummary.tone === 'indigo' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                                )}>
                                    {digestModeSummary.label}
                                </motion.span>
                                {deferralActive && deferredNotifications.length > 0 && (
                                    <motion.button
                                        type="button"
                                        onClick={() => setShowDeferredNotifications((prev) => !prev)}
                                        whileHover={allowPanelLayoutMotion ? { y: -1 } : undefined}
                                        whileTap={allowPanelLayoutMotion ? { scale: 0.98 } : undefined}
                                        className={clsx(
                                            'px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors',
                                            showDeferredNotifications
                                                ? 'bg-slate-900 text-white border-slate-900'
                                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                        )}
                                    >
                                        {showDeferredNotifications
                                            ? (language === 'zh' ? '隐藏延后项' : 'Hide deferred')
                                            : (language === 'zh' ? `显示延后项 ${deferredNotifications.length}` : `Show deferred ${deferredNotifications.length}`)}
                                    </motion.button>
                                )}
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center transition-colors px-2 py-1 rounded-md hover:bg-primary-50"
                                        title={t('notifications.markAllRead')}
                                    >
                                        <CheckIcon className="h-3.5 w-3.5 mr-1" />
                                        {t('notifications.markAllRead')}
                                    </button>
                                )}
                            </motion.div>
                            <p className="mt-2 text-[11px] text-slate-500">{digestModeSummary.detail}</p>
                            <AnimatePresence initial={false}>
                                {deferralActive && deferredNotifications.length > 0 && (
                                    <motion.div
                                        key={`deferred-banner-${deferredNotifications.length}-${showDeferredNotifications ? 'open' : 'closed'}`}
                                        initial={prefersReducedMotion ? false : { opacity: 0, height: 0, y: -4 }}
                                        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: 'auto', y: 0 }}
                                        exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0, y: -4 }}
                                        transition={{ duration: MOTION_DURATION.normal, ease: MOTION_EASE.out }}
                                        className="mt-2 overflow-hidden"
                                    >
                                        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                            <p className="text-[11px] font-medium text-slate-700">
                                                {quietHoursActive
                                                    ? (language === 'zh'
                                                        ? `静默时段生效（${workflowPreferences.quietHoursStart} - ${workflowPreferences.quietHoursEnd}），${deferredNotifications.length} 条非白名单通知已延后显示。`
                                                        : `Quiet hours active (${workflowPreferences.quietHoursStart} - ${workflowPreferences.quietHoursEnd}). ${deferredNotifications.length} non-whitelisted notifications are deferred.`)
                                                    : (language === 'zh'
                                                        ? `周末低优先级延后规则生效，${deferredNotifications.length} 条非白名单通知已延后显示。`
                                                        : `Weekend low-priority deferral is active. ${deferredNotifications.length} non-whitelisted notifications are deferred.`)}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    <div className={clsx(
                        'overflow-y-auto custom-scrollbar p-2 overscroll-contain',
                        mobileSheet ? 'h-[calc(100%-9.25rem)] pb-[calc(env(safe-area-inset-bottom)+0.25rem)]' : 'max-h-[calc(100vh-200px)]'
                    )}>
                        {visibleNotifications.length === 0 ? (
                            <div className="px-4 py-16 text-center flex flex-col items-center justify-center">
                                <div className="bg-gray-50 p-4 rounded-full mb-3">
                                    <BellIcon className="h-8 w-8 text-gray-300" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                    {deferralActive && deferredNotifications.length > 0 && !showDeferredNotifications
                                        ? (language === 'zh' ? '当前通知已按规则延后显示' : 'Notifications are deferred by your rules')
                                        : filterMode === 'unread'
                                        ? (language === 'zh' ? '没有未读通知' : 'No unread notifications')
                                        : filterMode === 'action'
                                            ? (language === 'zh' ? '没有需要处理的提醒' : 'No action-required notifications')
                                            : t('notifications.empty')}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {deferralActive && deferredNotifications.length > 0 && !showDeferredNotifications
                                        ? (language === 'zh'
                                            ? '你可以点击“显示延后项”查看静默时段或周末规则暂时折叠的通知。'
                                            : 'Tap "Show deferred" to review notifications hidden by quiet-hours or weekend rules.')
                                        : filterMode === 'unread'
                                        ? (language === 'zh' ? '切换到“全部”查看历史通知。' : 'Switch to All to review history.')
                                        : filterMode === 'action'
                                            ? (language === 'zh' ? '当前没有高优先级提醒，状态良好。' : 'No high-priority alerts right now.')
                                            : "We'll notify you when something important happens."}
                                </p>
                                {digestMode === 'batched' && filterMode === 'all' && notifications.length > 60 && (
                                    <p className="text-[11px] text-indigo-600 mt-2">
                                        {language === 'zh' ? '批量摘要模式下，“全部”仅显示最近 60 条通知。' : 'Batched digest mode shows the latest 60 notifications in All view.'}
                                    </p>
                                )}
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    <button
                                        onClick={() => router.push('/transactions')}
                                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        {language === 'zh' ? '去记账' : 'Open Transactions'}
                                    </button>
                                    <button
                                        onClick={() => router.push('/reports')}
                                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        {language === 'zh' ? '看报告' : 'Open Reports'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                layout={allowPanelLayoutMotion}
                                className="space-y-4"
                            >
                                <AnimatePresence initial={false}>
                                {groupOrder.map(group => {
                                    const groupNotifications = groupedNotifications[group]
                                    if (!groupNotifications || groupNotifications.length === 0) return null

                                    return (
                                        <motion.div
                                            key={group}
                                            layout={allowPanelLayoutMotion}
                                            initial={allowPanelLayoutMotion ? { opacity: 0, y: 6 } : false}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={allowPanelLayoutMotion ? { opacity: 0, y: -6 } : undefined}
                                            transition={{ duration: MOTION_DURATION.fast }}
                                        >
                                            <div className={clsx('px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky top-0 bg-white/95 z-10', useBackdropBlur ? 'backdrop-blur-sm' : '')}>
                                                {group === 'Today' ? t('common.today') : group === 'Yesterday' ? t('common.yesterday') : (t('common.earlier') || 'Earlier')}
                                            </div>
                                            <div className="space-y-1 mt-1">
                                                <AnimatePresence initial={false}>
                                                {groupNotifications.map((notification, index) => (
                                                    <Menu.Item key={notification.id}>
                                                        {({ active }) => (
                                                            <motion.div
                                                                layout={allowPanelLayoutMotion}
                                                                initial={allowPanelLayoutMotion ? { opacity: 0, y: 8 } : false}
                                                                animate={allowPanelLayoutMotion ? { opacity: 1, y: 0 } : { opacity: 1 }}
                                                                exit={allowPanelLayoutMotion ? { opacity: 0, y: -8, scale: 0.98 } : undefined}
                                                                transition={{ duration: MOTION_DURATION.fast, delay: allowPanelLayoutMotion ? index * 0.015 : 0 }}
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className={clsx(
                                                                    active ? 'bg-gray-50' : 'bg-transparent',
                                                                    !notification.isRead ? 'bg-blue-50/40' : '',
                                                                    'px-3 py-3 rounded-xl transition-all duration-200 relative group cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-sm mx-1'
                                                                )}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="flex-shrink-0 mt-1">
                                                                        {getIcon(notification.type)}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex justify-between items-start">
                                                                            <p className={clsx(
                                                                                "text-sm",
                                                                                notification.isRead ? "font-medium text-gray-900" : "font-bold text-gray-900"
                                                                            )}>
                                                                                {notification.title.includes('.') ? t(notification.title) : notification.title}
                                                                            </p>
                                                                            {!notification.isRead && (
                                                                                <span className="inline-block h-2 w-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0 shadow-sm shadow-primary-200" />
                                                                            )}
                                                                        </div>
                                                                        <p className="mt-0.5 text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                                                            {notification.body.includes('.') ? t(notification.body) : notification.body}
                                                                        </p>
                                                                        <div className="mt-2 flex justify-between items-center gap-2">
                                                                            <p className="text-xs text-gray-400 font-medium">
                                                                                {notification.createdAt && typeof notification.createdAt?.toDate === 'function'
                                                                                    ? formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true, locale: dateLocale })
                                                                                    : ''}
                                                                            </p>
                                                                            <div className="flex items-center gap-1">
                                                                                {notification.link && (
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.preventDefault()
                                                                                            e.stopPropagation()
                                                                                            handleNotificationClick(notification)
                                                                                        }}
                                                                                    className="text-xs px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1 min-h-8"
                                                                                        title="View"
                                                                                    >
                                                                                        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                                                                                        <span>View</span>
                                                                                    </button>
                                                                                )}
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault()
                                                                                        e.stopPropagation()
                                                                                        removeNotification(notification.id)
                                                                                    }}
                                                                                    className="text-xs text-gray-400 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 rounded min-h-8 min-w-8"
                                                                                    title={t('common.delete')}
                                                                                >
                                                                                    <TrashIcon className="h-3.5 w-3.5" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </Menu.Item>
                                                ))}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                </Menu.Items>
            </Transition>
            </>
            )}
        </Menu>
    )
}
