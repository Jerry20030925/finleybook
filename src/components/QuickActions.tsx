'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  DocumentArrowUpIcon,
  CameraIcon,
  MicrophoneIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import TransactionModal from './TransactionModal'
import ReceiptUploadModal from './ReceiptUploadModal'
import VoiceInputModal from './VoiceInputModal'

const actions = [
  {
    name: '添加交易',
    description: '手动记录收入或支出',
    icon: PlusIcon,
    color: 'bg-primary-600 hover:bg-primary-700',
    action: 'add-transaction'
  },
  {
    name: '上传票据',
    description: 'OCR识别票据信息',
    icon: DocumentArrowUpIcon,
    color: 'bg-success-600 hover:bg-success-700',
    action: 'upload-receipt'
  },
  {
    name: '拍照记账',
    description: '拍照自动识别记账',
    icon: CameraIcon,
    color: 'bg-warning-600 hover:bg-warning-700',
    action: 'camera'
  },
  {
    name: '语音记账',
    description: '说话即可快速记账',
    icon: MicrophoneIcon,
    color: 'bg-purple-600 hover:bg-purple-700',
    action: 'voice-input'
  },
  {
    name: '查看账单',
    description: '查看最新交易记录',
    icon: ClipboardDocumentListIcon,
    color: 'bg-blue-600 hover:bg-blue-700',
    action: 'view-transactions'
  },
  {
    name: '预算分析',
    description: '查看预算执行情况',
    icon: CurrencyDollarIcon,
    color: 'bg-indigo-600 hover:bg-indigo-700',
    action: 'budget-analysis'
  }
]

export default function QuickActions() {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const router = useRouter()

  const handleAction = (action: string) => {
    switch (action) {
      case 'add-transaction':
        setActiveModal('transaction')
        break
      case 'upload-receipt':
        setActiveModal('receipt')
        break
      case 'voice-input':
        setActiveModal('voice')
        break
      case 'camera':
        setActiveModal('receipt') // Use receipt modal as camera would need native access
        break
      case 'view-transactions':
        router.push('/transactions')
        break
      case 'budget-analysis':
        router.push('/budget')
        break
      default:
        console.log('Action not implemented:', action)
    }
  }

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">快速操作</h2>
          <span className="text-sm text-gray-500">选择一个操作开始</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {actions.map((action, index) => (
            <motion.button
              key={action.name}
              onClick={() => handleAction(action.action)}
              className="group relative flex flex-col items-center p-3 md:p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50 transition-all duration-300 overflow-hidden"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: index * 0.08,
                duration: 0.6,
                type: "spring",
                damping: 20,
                stiffness: 300
              }}
              whileHover={{
                scale: 1.05,
                y: -4,
                rotateZ: 1,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
              whileTap={{
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
            >
              {/* Background ripple effect */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-400/10 to-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />

              <motion.div
                className={`relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl ${action.color} shadow-lg transition-all duration-300 group-hover:shadow-xl`}
                whileHover={{
                  rotateY: 15,
                  rotateX: 10,
                  scale: 1.1
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <action.icon className="h-5 w-5 md:h-6 md:w-6 text-white" aria-hidden="true" />
                </motion.div>
              </motion.div>

              <motion.div
                className="mt-2 md:mt-3 text-center relative z-10"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 + 0.3, duration: 0.4 }}
              >
                <motion.h3
                  className="text-xs md:text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                >
                  {action.name}
                </motion.h3>
                <motion.p
                  className="mt-1 text-xs text-gray-500 hidden sm:block group-hover:text-gray-600 transition-colors duration-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.08 + 0.5 }}
                >
                  {action.description}
                </motion.p>
              </motion.div>

              {/* Shine effect on hover */}
              <motion.div
                className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 group-hover:left-full transition-all duration-700"
                initial={{ x: '-100%' }}
                whileHover={{ x: '200%' }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'transaction' && (
        <TransactionModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onSuccess={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'receipt' && (
        <ReceiptUploadModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'voice' && (
        <VoiceInputModal onClose={() => setActiveModal(null)} />
      )}
    </>
  )
}