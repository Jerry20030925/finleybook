'use client'

import { useState } from 'react'
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
        // Handle camera action
        break
      case 'view-transactions':
        // Navigate to transactions page
        break
      case 'budget-analysis':
        // Navigate to budget page
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {actions.map((action) => (
            <button
              key={action.name}
              onClick={() => handleAction(action.action)}
              className="group relative flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-150"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${action.color} transition-colors`}>
                <action.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                  {action.name}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'transaction' && (
        <TransactionModal onClose={() => setActiveModal(null)} />
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