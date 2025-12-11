'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { StarIcon, ArrowUpIcon } from '@heroicons/react/24/outline'
import { useSubscription } from './SubscriptionProvider'
import { useLanguage } from './LanguageProvider'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe'
import SubscriptionPage from './SubscriptionPage'

export default function SubscriptionStatus() {
  const { subscription, isProMember } = useSubscription()
  const { t } = useLanguage()
  const [showUpgrade, setShowUpgrade] = useState(false)

  if (!subscription) return null

  const currentPlan = SUBSCRIPTION_PLANS[subscription.planKey]

  if (isProMember) {
    return (
      <motion.div
        className="card bg-gradient-to-br from-blue-500 to-purple-600 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <StarIcon className="w-6 h-6 text-yellow-300" />
              <h3 className="text-lg font-semibold">{t('subscription.status.pro')}</h3>
            </div>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                >
                  <StarIcon className="w-4 h-4 text-yellow-300 fill-current" />
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-blue-100 mb-4">
            {currentPlan.name} - {t('subscription.status.pro.desc')}
          </p>

          {subscription.currentPeriodEnd && (
            <div className="text-sm text-blue-100 mb-4">
              {t('subscription.status.renew', { date: subscription.currentPeriodEnd.toLocaleDateString('en-AU') })}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white border-opacity-20">
            <div className="flex items-center text-sm text-blue-100">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              {t('subscription.features.pro.unlimited')}
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to cancel your subscription?')) {
                  // In a real app, call API to cancel
                  alert('Subscription cancellation request sent.');
                }
              }}
              className="text-xs text-blue-100 hover:text-white underline opacity-80 hover:opacity-100 transition-opacity"
            >
              {t('subscription.status.cancel')}
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        className="card border border-gray-200 bg-white relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute top-0 right-0 w-20 h-20 bg-blue-200 bg-opacity-30 rounded-full -translate-y-10 translate-x-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('subscription.status.free')}</h3>
            <motion.div
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {t('subscription.status.current')}
            </motion.div>
          </div>

          <p className="text-gray-600 mb-4">
            {t('subscription.status.free.desc')}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
              {t('subscription.features.free.limit')}
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
              {t('subscription.features.free.categories')}
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
              {t('subscription.features.free.export')}
            </div>
          </div>

          <motion.button
            onClick={() => setShowUpgrade(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowUpIcon className="w-5 h-5 mr-2" />
            {t('subscription.status.upgrade')}
          </motion.button>

          <motion.p
            className="text-xs text-gray-500 mt-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t('subscription.unlock')}
          </motion.p>
        </div>
      </motion.div>

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
            <SubscriptionPage
              onClose={() => setShowUpgrade(false)}
            />
          </motion.div>
        </motion.div>
      )}
    </>
  )
}