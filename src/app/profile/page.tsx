'use client'

import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { UserCircleIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
    const { user, loading } = useAuth()
    const { language } = useLanguage()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/')
        }
    }, [user, loading, router])

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
                            {language === 'en' ? 'My Profile' : '我的个人资料'}
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

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex items-center gap-4">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="h-16 w-16 rounded-full" />
                        ) : (
                            <UserCircleIcon className="h-16 w-16 text-gray-300" />
                        )}
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {user.displayName || (language === 'en' ? 'User' : '用户')}
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                        <dl className="sm:divide-y sm:divide-gray-200">
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    {language === 'en' ? 'Email' : '电子邮箱'}
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {user.email}
                                </dd>
                            </div>
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    {language === 'en' ? 'User ID' : '用户ID'}
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {user.uid}
                                </dd>
                            </div>
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    {language === 'en' ? 'Account Created' : '账户创建时间'}
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '-'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                        <Link
                            href="/settings"
                            className="text-sm font-medium text-primary-600 hover:text-primary-500"
                        >
                            {language === 'en' ? 'Edit Profile & Settings' : '编辑资料与设置'} <span aria-hidden="true">&rarr;</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
