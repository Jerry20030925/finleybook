'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LockClosedIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useSubscription } from './SubscriptionProvider'
import SubscriptionPage from './SubscriptionPage'

interface FeatureGateProps {
  feature: string
  title: string
  description: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function FeatureGate({
  feature,
  title,
  description,
  children,
  fallback
}: FeatureGateProps) {
  const { canUseFeature, isProMember } = useSubscription()
  const [showUpgrade, setShowUpgrade] = useState(false)

  if (canUseFeature(feature)) {
    return <>{children}</>
  }

  const UpgradePrompt = () => (
    <motion.div
      className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-dashed border-blue-300 rounded-xl p-8 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute -top-2 -right-2"
        animate={{
          rotate: [0, -10, 10, -10, 0],
          scale: [1, 1.1, 1, 1.1, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      >
        <div className="bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold flex items-center">
          <StarIcon className="w-3 h-3 mr-1" />
          PRO
        </div>
      </motion.div>

      <motion.div
        className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4"
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <LockClosedIcon className="w-8 h-8 text-white" />
      </motion.div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>

      <div className="space-y-3">
        <motion.button
          onClick={() => setShowUpgrade(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 mr-2" />
            升级到 Pro 版
          </div>
        </motion.button>

        <motion.p
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          解锁全部高级功能，提升您的财务管理体验
        </motion.p>
      </div>
    </motion.div>
  )

  return (
    <>
      {fallback || <UpgradePrompt />}

      <AnimatePresence>
        {showUpgrade && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUpgrade(false)}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <SubscriptionPage onClose={() => setShowUpgrade(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Usage limits component
interface UsageLimitProps {
  limitType: 'transactions' | 'budgets' | 'exports'
  title: string
  current: number
  limit: number
}

export function UsageLimit({ limitType, title, current, limit }: UsageLimitProps) {
  const { getRemainingUsage, isProMember } = useSubscription()
  const remaining = getRemainingUsage(limitType)
  const percentage = limit > 0 ? (current / limit) * 100 : 0
  const isNearLimit = percentage > 80
  const isOverLimit = current >= limit && limit > 0

  if (isProMember || limit === -1) {
    return null // Don't show limits for pro users or unlimited features
  }

  return (
    <motion.div
      className={`p-4 rounded-lg border-2 ${isOverLimit
        ? 'bg-red-50 border-red-200'
        : isNearLimit
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-gray-50 border-gray-200'
        }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <span className={`text-sm font-bold ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-600'
          }`}>
          {current}/{limit}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <motion.div
          className={`h-2 rounded-full ${isOverLimit
            ? 'bg-red-500'
            : isNearLimit
              ? 'bg-yellow-500'
              : 'bg-blue-500'
            }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">
          剩余 {remaining} 次使用
        </span>
        {isNearLimit && (
          <motion.span
            className="text-blue-600 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            升级获得无限使用
          </motion.span>
        )}
      </div>
    </motion.div>
  )
}