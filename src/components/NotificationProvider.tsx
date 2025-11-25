'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
    id: string
    title: string
    message: string
    type: NotificationType
    read: boolean
    timestamp: Date
}

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    addNotification: (title: string, message: string, type?: NotificationType) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    removeNotification: (id: string) => void
    clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])

    // Load notifications from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('finley_notifications')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                // Convert string timestamps back to Date objects
                const hydrated = parsed.map((n: any) => ({
                    ...n,
                    timestamp: new Date(n.timestamp)
                }))
                setNotifications(hydrated)
            } catch (e) {
                console.error('Failed to parse notifications', e)
            }
        } else {
            // Add a welcome notification if no history exists
            addNotification(
                '欢迎使用 FinleyBook',
                '系统已准备就绪，我们将为您提供智能的财务管理服务。',
                'info'
            )
        }
    }, [])

    // Save to local storage whenever notifications change
    useEffect(() => {
        if (notifications.length > 0) {
            localStorage.setItem('finley_notifications', JSON.stringify(notifications))
        }
    }, [notifications])

    const addNotification = useCallback((title: string, message: string, type: NotificationType = 'info') => {
        const newNotification: Notification = {
            id: uuidv4(),
            title,
            message,
            type,
            read: false,
            timestamp: new Date()
        }
        setNotifications(prev => [newNotification, ...prev])
    }, [])

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
    }, [])

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }, [])

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }, [])

    const clearAll = useCallback(() => {
        setNotifications([])
        localStorage.removeItem('finley_notifications')
    }, [])

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            removeNotification,
            clearAll
        }}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotification() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider')
    }
    return context
}
