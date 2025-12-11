'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus,
  ScanLine,
  FileUp,
  ListTodo,
  Gift,
  Coffee
} from 'lucide-react'
import TransactionModal from './TransactionModal'
import ReceiptUploadModal from './ReceiptUploadModal'
import CsvImportModal from './CsvImportModal'
import { useLanguage } from './LanguageProvider'
import toast, { Toaster } from 'react-hot-toast'

interface QuickActionsProps {
  onInvite?: () => void
  onDataRefresh?: () => void
}

export default function QuickActions({ onInvite, onDataRefresh }: QuickActionsProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useLanguage()

  const actions = [
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
      action: 'camera'
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
      action: 'import-csv'
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
  ]

  const handleAction = (action: string) => {
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
                    <span className="text-xl">🌿</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Expense Recorded!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Your financial awareness grew. <span className="text-green-600 font-bold">+5g Energy</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))
        // Here you would normally actually add the transaction...
        break
      default:
        console.log('Action not implemented:', action)
    }
  }

  return (
    <>
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">{t('quickActions.title')}</h2>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {actions.map((action, index) => (
            <motion.button
              key={action.name}
              onClick={() => handleAction(action.action)}
              className="flex flex-col items-center gap-3 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={action.name}
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white shadow-md transition-all duration-300 group-hover:shadow-xl ${action.color}`}>
                <action.icon size={28} strokeWidth={2} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

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
}