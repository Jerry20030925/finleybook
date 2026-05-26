'use client'

import { useState, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  ScanLine,
  FileUp,
  ListTodo,
  Gift,
  Coffee,
  Lock
} from 'lucide-react'
import TouchableScale from './TouchableScale'
import TransactionModal from './TransactionModal'
import ReceiptUploadModal from './ReceiptUploadModal'
import CsvImportModal from './CsvImportModal'
import { useLanguage } from './LanguageProvider'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { addTransaction } from '@/lib/dataService'
import { useSubscription } from './SubscriptionProvider'
import { motion } from 'framer-motion'
import { useExperience } from '@/components/ExperienceProvider'

interface QuickActionsProps {
  onInvite?: () => void
  onDataRefresh?: () => void
}

const QuickActions = memo(function QuickActions({ onInvite, onDataRefresh }: QuickActionsProps) {
  const { user } = useAuth()
  const { isProMember, getRemainingUsage } = useSubscription()
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useLanguage()
  const { reduceMotion, allowRichMotion } = useExperience()
  const transactionRemaining = getRemainingUsage('transactions')

  type ActionItem = {
    name: string
    icon: typeof Plus
    color: string
    action: 'add-transaction' | 'camera' | 'quick-coffee' | 'import-csv' | 'view-transactions' | 'invite-friend'
    requiresPro?: boolean
  }

  const actions = useMemo<ActionItem[]>(() => [
    {
      name: t('quickActions.addTransaction'),
      icon: Plus,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: 'add-transaction'
    },
    {
      name: t('quickActions.scanReceipt'),
      icon: ScanLine,
      color: 'bg-violet-600 hover:bg-violet-700',
      action: 'camera',
      requiresPro: true
    },
    {
      name: 'Add Coffee', // Gamification shortcut
      icon: Coffee,
      color: 'bg-amber-600 hover:bg-amber-700',
      action: 'quick-coffee'
    },
    {
      name: t('quickActions.importCsv') || 'Import CSV',
      icon: FileUp,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      action: 'import-csv',
      requiresPro: true
    },
    {
      name: t('quickActions.viewTransactions'),
      icon: ListTodo,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: 'view-transactions'
    },
    {
      name: t('quickActions.inviteFriend'),
      icon: Gift,
      color: 'bg-pink-600 hover:bg-pink-700',
      action: 'invite-friend'
    }
  ], [t])

  const showProRequiredToast = () => {
    toast.custom((toastRef) => (
      <div className="max-w-sm w-full bg-white border border-indigo-100 shadow-xl rounded-xl p-4">
        <p className="text-sm font-semibold text-slate-900">This action is available in Pro</p>
        <p className="text-xs text-slate-600 mt-1">Unlock receipt scan and CSV import for faster bookkeeping.</p>
        <button
          type="button"
          onClick={() => {
            toast.dismiss(toastRef.id)
            router.push('/subscribe')
          }}
          className="mt-3 w-full rounded-lg bg-slate-900 text-white text-sm font-semibold py-2 hover:bg-black transition-colors"
        >
          Upgrade to Pro
        </button>
      </div>
    ))
  }

  const handleAction = async (action: ActionItem['action'], requiresPro = false) => {
    // Tactile Feedback
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
      await Haptics.impact({ style: ImpactStyle.Light })
    } catch (e) { }

    if (requiresPro && !isProMember) {
      showProRequiredToast()
      return
    }

    switch (action) {
      case 'add-transaction':
        setActiveModal('transaction')
        break
      case 'camera':
        setActiveModal('receipt')
        break
      case 'import-csv':
        setActiveModal('csv')
        break
      case 'view-transactions':
        router.push('/transactions')
        break
      case 'invite-friend':
        if (onInvite) onInvite()
        break
      case 'quick-coffee':
        // Haptic for success
        try {
          const { Haptics, NotificationType } = await import('@capacitor/haptics')
          await Haptics.notification({ type: NotificationType.Success })
        } catch (e) { }

        // Simulation for gamification feedback
        toast.custom((t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xl">☕️</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Coffee Added! (-$4.50)
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Your financial tracking is effortless. <span className="text-green-600 font-bold">+5g Energy</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))

        // Actually Add Transaction
        if (user) {
          try {
            await addTransaction({
              userId: user.uid,
              amount: 4.50,
              category: 'category.food',
              description: 'Quick Coffee ☕️',
              type: 'expense',
              date: new Date(),
              merchantName: 'Quick Action'
            })
            if (onDataRefresh) onDataRefresh()
          } catch (err) {
            console.error("Failed to add quick coffee", err)
            toast.error("Failed to save coffee expense")
          }
        }
        break
      default:
        console.log('Action not implemented:', action)
    }
  }

  return (
    <>
      <motion.div
        className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.12 : 0.24, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">{t('quickActions.title')}</h2>
        </div>

        {!isProMember && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <p className="text-xs text-amber-900">
              <span className="font-semibold">Free plan:</span>{' '}
              {transactionRemaining > 0 ? `${transactionRemaining} transactions left this month.` : 'Monthly transaction limit reached.'}
              {' '}Upgrade to unlock unlimited usage and smart import tools.
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {actions.map((action, index) => {
            const isLocked = !!(action.requiresPro && !isProMember)
            return (
              <motion.div
                key={action.name}
                initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: reduceMotion ? 0.1 : 0.3, delay: reduceMotion ? 0 : index * 0.045, ease: [0.34, 1.56, 0.64, 1] }}
                whileHover={allowRichMotion ? { y: -4 } : undefined}
              >
                <TouchableScale
                  onClick={() => handleAction(action.action, action.requiresPro)}
                  className="flex flex-col items-center gap-2 md:gap-3 group border-0 bg-transparent p-0"
                  scale={0.95}
                >
                  <motion.div
                    className={`relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white shadow-md transition-all duration-300 ${action.color}`}
                    whileHover={allowRichMotion ? {
                      boxShadow: isLocked
                        ? '0 0 18px 4px rgba(99,102,241,0.45)'
                        : '0 8px 20px -4px rgba(0,0,0,0.28)',
                      scale: isLocked ? 1.06 : 1.04,
                    } : undefined}
                    transition={{ duration: 0.25 }}
                  >
                    <action.icon size={26} strokeWidth={2} className="md:w-7 md:h-7" />
                    {isLocked && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shadow"
                        animate={allowRichMotion ? { scale: [1, 1.15, 1] } : undefined}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
                      >
                        <Lock size={11} />
                      </motion.div>
                    )}
                  </motion.div>
                  <span className="text-xs font-medium text-gray-600 text-center leading-tight max-w-[80px] line-clamp-2 md:line-clamp-1">
                    {action.name}
                  </span>
                  {isLocked && (
                    <motion.span
                      className="text-[10px] uppercase font-bold tracking-wide text-indigo-600"
                      animate={allowRichMotion ? { opacity: [0.7, 1, 0.7] } : undefined}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      Pro
                    </motion.span>
                  )}
                </TouchableScale>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Modals */}
      {activeModal === 'transaction' && (
        <TransactionModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            setActiveModal(null)
            if (onDataRefresh) onDataRefresh()
          }}
        />
      )}

      {activeModal === 'receipt' && (
        <ReceiptUploadModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'csv' && (
        <CsvImportModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            setActiveModal(null)
            if (onDataRefresh) onDataRefresh()
          }}
        />
      )}
    </>
  )
})

export default QuickActions
