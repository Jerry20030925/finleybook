'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Landing from '@/components/Landing'
import PageLoader from '@/components/PageLoader'

export default function Home() {
  const { user, loading, error } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Show error if auth failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">认证服务暂时不可用</h1>
          <p className="text-gray-600 mb-2">请稍后再试或联系技术支持</p>
          {error && (
            <p className="text-sm text-red-500 mb-6 bg-red-50 p-2 rounded">
              错误详情: {error}
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            刷新页面
          </button>
        </div>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return <PageLoader />
  }

  // If user is logged in, redirect to dashboard (handled by useEffect)
  if (user) {
    return <PageLoader />
  }

  // Show landing page for non-authenticated users
  return <Landing />
}