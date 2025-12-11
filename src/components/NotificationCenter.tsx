import { Fragment, useEffect, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { BellIcon, CheckCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XCircleIcon, TrashIcon, CheckIcon, GiftIcon } from '@heroicons/react/24/outline'
import { useLanguage } from './LanguageProvider'
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import clsx from 'clsx'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, where, deleteDoc } from 'firebase/firestore'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface AppNotification {
    id: string
    title: string
    body: string
    type: 'success' | 'info' | 'warning' | 'error' | 'promo'
    link?: string
    isRead: boolean
    createdAt: any
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
        default:
            return <div className="p-2 bg-blue-100 rounded-full"><InformationCircleIcon className="h-5 w-5 text-blue-600" /></div>
    }
}

export default function NotificationCenter({ className }: { className?: string }) {
    const { user } = useAuth()
    const { t, language } = useLanguage()
    const [notifications, setNotifications] = useState<AppNotification[]>([])
    const router = useRouter()

    const dateLocale = language === 'en' ? enUS : zhCN
    const unreadCount = notifications.filter(n => !n.isRead).length

    useEffect(() => {
        if (!user) return

        const q = query(
            collection(db, 'users', user.uid, 'notifications'),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as AppNotification[]
            setNotifications(notes)
        })

        return () => unsubscribe()
    }, [user])

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

    // Group notifications by date
    const groupedNotifications = notifications.reduce((groups, notification) => {
        const date = notification.createdAt?.toDate ? notification.createdAt.toDate() : new Date()
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
            <div>
                <Menu.Button className="relative rounded-full bg-white/80 backdrop-blur-sm p-2 text-gray-500 hover:text-gray-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all shadow-sm border border-gray-100">
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 ring-2 ring-white text-[10px] font-bold text-white flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 shadow-sm">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95 translate-y-2"
                enterTo="transform opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                leaveTo="transform opacity-0 scale-95 translate-y-2"
            >
                <Menu.Items className="absolute right-0 z-50 mt-3 w-96 origin-top-right rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl ring-1 ring-black/5 focus:outline-none border border-white/20">
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white/50 rounded-t-2xl">
                        <h3 className="text-base font-bold text-gray-900">{t('notifications.title')}</h3>
                        <div className="flex space-x-3">
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

                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar p-2">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-16 text-center flex flex-col items-center justify-center">
                                <div className="bg-gray-50 p-4 rounded-full mb-3">
                                    <BellIcon className="h-8 w-8 text-gray-300" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">{t('notifications.empty')}</p>
                                <p className="text-xs text-gray-500 mt-1">We'll notify you when something important happens.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {groupOrder.map(group => {
                                    const groupNotifications = groupedNotifications[group]
                                    if (!groupNotifications || groupNotifications.length === 0) return null

                                    return (
                                        <div key={group}>
                                            <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                                                {group === 'Today' ? t('common.today') : group === 'Yesterday' ? t('common.yesterday') : t('common.earlier')}
                                            </div>
                                            <div className="space-y-1 mt-1">
                                                {groupNotifications.map((notification) => (
                                                    <Menu.Item key={notification.id}>
                                                        {({ active }) => (
                                                            <motion.div
                                                                layout
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
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
                                                                        <div className="mt-2 flex justify-between items-center">
                                                                            <p className="text-xs text-gray-400 font-medium">
                                                                                {notification.createdAt?.toDate ? formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true, locale: dateLocale }) : ''}
                                                                            </p>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.preventDefault()
                                                                                    e.stopPropagation()
                                                                                    removeNotification(notification.id)
                                                                                }}
                                                                                className="text-xs text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-50 rounded"
                                                                                title={t('common.delete')}
                                                                            >
                                                                                <TrashIcon className="h-3.5 w-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </Menu.Item>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}
