'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Dashboard from '@/components/Dashboard'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useAuth } from '@/components/AuthProvider'
import { useWorkflowPreferences } from '@/hooks/useWorkflowPreferences'

export default function DashboardPage() {
  const { user } = useAuth()
  const workflowPreferences = useWorkflowPreferences(user?.uid)
  const [showSmartNextStep, setShowSmartNextStep] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = `finley:dashboard-smart-next-step:hidden:${user?.uid || 'guest'}`
    const hidden = window.localStorage.getItem(key) === '1'
    setShowSmartNextStep(!hidden)
  }, [user?.uid])

  const handleDismissSmartNextStep = () => {
    setShowSmartNextStep(false)
    if (typeof window === 'undefined') return
    const key = `finley:dashboard-smart-next-step:hidden:${user?.uid || 'guest'}`
    window.localStorage.setItem(key, '1')
  }

  return (
    <ErrorBoundary>
      <div className="relative">
        {showSmartNextStep && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`fixed z-30 bottom-[calc(env(safe-area-inset-bottom)+5rem)] md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[380px] pointer-events-none ${workflowPreferences.stickyMobileActionBar ? '' : 'hidden md:block'}`}
          >
            <div className="pointer-events-auto rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md shadow-xl p-3 supports-[backdrop-filter]:bg-white/80">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Finley Smart Next Step</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">Keep your workflow moving in one tap</p>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Record a transaction, review budget, generate a report, or open your wallet from one place.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Dismiss quick actions"
                  onClick={handleDismissSmartNextStep}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link href="/transactions" className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-white hover:border-slate-300 transition">
                  Add Tx
                </Link>
                <Link href="/budget" className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-white hover:border-slate-300 transition">
                  Budget
                </Link>
                <Link href="/reports" className="rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-2 text-center text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition">
                  Report
                </Link>
                <Link href="/wallet" className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2 text-center text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition">
                  Wallet
                </Link>
              </div>
            </div>
          </motion.div>
        )}
        <Dashboard />
      </div>
    </ErrorBoundary>
  )
}
