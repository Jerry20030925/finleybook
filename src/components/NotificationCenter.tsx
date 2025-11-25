'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { BellIcon, CheckCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XCircleIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useNotification, Notification, NotificationType } from './NotificationProvider'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import clsx from 'clsx'

const getIcon = (type: NotificationType) => {
    switch (type) {
        case 'success':
            return <CheckCircleIcon className="h-6 w-6 text-green-500" />
        case 'warning':
            return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
        case 'error':
            return <XCircleIcon className="h-6 w-6 text-red-500" />
        default:
            return <InformationCircleIcon className="h-6 w-6 text-blue-500" />
    }
}

export default function NotificationCenter() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotification()

    return (
        <Menu as="div" className="relative ml-3">
            <div>
                <Menu.Button className="relative rounded-full bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 ring-2 ring-white text-[10px] font-bold text-white flex items-center justify-center transform translate-x-1/4 -translate-y-1/4">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-20 mt-2 w-80 origin-top-right rounded-xl bg-white py-1 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:w-96">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                        <h3 className="text-sm font-semibold text-gray-900">通知中心</h3>
                        <div className="flex space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center"
                                    title="全部标记为已读"
                                >
                                    <CheckIcon className="h-3 w-3 mr-1" />
                                    全部已读
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-xs text-gray-500 hover:text-red-600 font-medium flex items-center ml-2"
                                    title="清空所有通知"
                                >
                                    <TrashIcon className="h-3 w-3 mr-1" />
                                    清空
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-12 text-center">
                                <BellIcon className="mx-auto h-12 w-12 text-gray-300" />
                                <p className="mt-2 text-sm text-gray-500">暂无新通知</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <Menu.Item key={notification.id}>
                                        {({ active }) => (
                                            <div
                                                className={clsx(
                                                    active ? 'bg-gray-50' : '',
                                                    !notification.read ? 'bg-blue-50/30' : '',
                                                    'px-4 py-4 transition-colors duration-150 relative group'
                                                )}
                                            >
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 pt-0.5">
                                                        {getIcon(notification.type)}
                                                    </div>
                                                    <div className="ml-3 w-0 flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <p className={clsx(
                                                                "text-sm font-medium",
                                                                notification.read ? "text-gray-900" : "text-gray-900 font-semibold"
                                                            )}>
                                                                {notification.title}
                                                            </p>
                                                            {!notification.read && (
                                                                <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{notification.message}</p>
                                                        <div className="mt-2 flex justify-between items-center">
                                                            <p className="text-xs text-gray-400">
                                                                {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: zhCN })}
                                                            </p>
                                                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {!notification.read && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.preventDefault()
                                                                            e.stopPropagation()
                                                                            markAsRead(notification.id)
                                                                        }}
                                                                        className="text-xs text-primary-600 hover:text-primary-700"
                                                                    >
                                                                        已读
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault()
                                                                        e.stopPropagation()
                                                                        removeNotification(notification.id)
                                                                    }}
                                                                    className="text-xs text-gray-400 hover:text-red-600"
                                                                >
                                                                    删除
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Menu.Item>
                                ))}
                            </div>
                        )}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}
