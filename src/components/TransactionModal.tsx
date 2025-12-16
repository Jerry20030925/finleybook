'use client'

import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from './AuthProvider'
import { useLanguage } from './LanguageProvider'
import { useCurrency } from './CurrencyProvider'
import { addTransaction, DEFAULT_CATEGORIES } from '@/lib/dataService'
import toast from 'react-hot-toast'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { country } = useCurrency()

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash', // We'll use English as default and translate display
    emotionalTag: 'neutral' as 'happy' | 'stress' | 'impulse' | 'sad' | 'neutral'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t('validation.amountRequired')
    }

    if (!formData.category) {
      newErrors.category = t('validation.categoryRequired')
    }

    if (!formData.description.trim()) {
      newErrors.description = t('validation.descriptionRequired')
    }

    if (!formData.date) {
      newErrors.date = t('validation.dateRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.uid) {
      toast.error(t('auth.signInError'))
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      setErrors({})

      console.log('[TransactionModal] Adding transaction...', {
        userId: user.uid,
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category
      })

      const transactionId = await addTransaction({
        userId: user.uid,
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date),
        paymentMethod: formData.paymentMethod,
        emotionalTag: formData.emotionalTag
      })

      console.log('[TransactionModal] Transaction added successfully with ID:', transactionId)

      setShowSuccess(true)
      toast.success(t('transactions.addSuccess'))

      // Reset form and call success callback immediately
      setTimeout(() => {
        console.log('[TransactionModal] Calling onSuccess callback to refresh list')
        setFormData({
          type: 'expense',
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'Cash',
          emotionalTag: 'neutral'
        })
        setShowSuccess(false)
        onSuccess()
      }, 1500) // Reduced delay since we're handling refresh delays in the parent

    } catch (error: any) {
      console.error('Error adding transaction:', error)

      // Show specific error message
      const errorMessage = error.message || t('transaction.error')
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData(prev => ({
      ...prev,
      type,
      category: ''
    }))
  }

  const categories = formData.type === 'income' ? DEFAULT_CATEGORIES.income : DEFAULT_CATEGORIES.expense

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-t-2xl sm:rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all w-full sm:my-8 sm:w-full sm:max-w-lg sm:p-6 h-[85vh] sm:h-auto overflow-y-scroll sm:overflow-visible">
                <div className="absolute right-4 top-4 block z-10">
                  <button
                    type="button"
                    className="rounded-full bg-gray-100 p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                        {t('transaction.add')}
                      </Dialog.Title>
                    </motion.div>

                    <AnimatePresence mode="wait">
                      {showSuccess ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex flex-col items-center justify-center py-12"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                          >
                            <CheckCircleIcon className="w-16 h-16 text-green-600 mb-4" />
                          </motion.div>
                          <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl font-medium text-green-600"
                          >
                            {t('transaction.success')}
                          </motion.h3>
                        </motion.div>
                      ) : (
                        <motion.form
                          key="form"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onSubmit={handleSubmit}
                          className="mt-6 space-y-4"
                        >
                          <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">
                              {t('transaction.type')}
                            </label>
                            <div className="flex space-x-4">
                              <motion.button
                                type="button"
                                onClick={() => handleTypeChange('expense')}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${formData.type === 'expense'
                                  ? 'bg-red-100 text-red-700 border-2 border-red-200 shadow-md'
                                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                                  }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {t('transaction.expense')}
                              </motion.button>
                              <motion.button
                                type="button"
                                onClick={() => handleTypeChange('income')}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${formData.type === 'income'
                                  ? 'bg-green-100 text-green-700 border-2 border-green-200 shadow-md'
                                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                                  }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {t('transaction.income')}
                              </motion.button>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                              {t('transaction.amount')}
                            </label>
                            <div className="mt-1 relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">{country.symbol}</span>
                              <motion.input
                                type="number"
                                id="amount"
                                step="0.01"
                                min="0"
                                required
                                value={formData.amount}
                                onChange={(e) => {
                                  setFormData(prev => ({ ...prev, amount: e.target.value }))
                                  if (errors.amount) {
                                    setErrors(prev => ({ ...prev, amount: '' }))
                                  }
                                }}
                                className={`pl-8 block w-full rounded-lg border shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 ${errors.amount
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-gray-300'
                                  }`}
                                placeholder="0.00"
                                whileFocus={{ scale: 1.02 }}
                              />
                            </div>
                            {errors.amount && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center mt-1 text-sm text-red-600"
                              >
                                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                                {errors.amount}
                              </motion.div>
                            )}
                          </div>

                          <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                              {t('transaction.category')}
                            </label>
                            <select
                              id="category"
                              required
                              value={formData.category}
                              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900"
                            >
                              <option value="">{t('transaction.selectCategory')}</option>
                              {categories.map((category) => (
                                <option key={category} value={t(category)}>
                                  {t(category)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                              {t('transaction.description')}
                            </label>
                            <input
                              type="text"
                              id="description"
                              required
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900"
                              placeholder={t('transaction.descriptionPlaceholder')}
                            />
                          </div>

                          <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                              {t('transaction.date')}
                            </label>
                            <input
                              type="date"
                              id="date"
                              value={formData.date}
                              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900"
                            />
                          </div>

                          <div>
                            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                              {t('transaction.paymentMethod')}
                            </label>
                            <select
                              id="paymentMethod"
                              value={formData.paymentMethod}
                              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900"
                            >
                              <option value={t('payment.cash')}>{t('payment.cash')}</option>
                              <option value={t('payment.bankCard')}>{t('payment.bankCard')}</option>
                              <option value={t('payment.alipay')}>{t('payment.alipay')}</option>
                              <option value={t('payment.wechat')}>{t('payment.wechat')}</option>
                              <option value={t('payment.creditCard')}>{t('payment.creditCard')}</option>
                              <option value={t('payment.other')}>{t('payment.other')}</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('transaction.emotionalContext')}
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                              {['happy', 'stress', 'impulse', 'sad', 'neutral'].map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, emotionalTag: tag as any }))}
                                  className={`p-2 rounded-lg text-2xl flex flex-col items-center gap-1 transition-all ${formData.emotionalTag === tag
                                    ? 'bg-indigo-100 border-2 border-indigo-500 scale-110'
                                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 opacity-70 hover:opacity-100'
                                    }`}
                                  title={tag}
                                >
                                  <span>
                                    {tag === 'happy' ? '🥰' :
                                      tag === 'stress' ? '😫' :
                                        tag === 'impulse' ? '💸' :
                                          tag === 'sad' ? '😢' : '😐'}
                                  </span>
                                </button>
                              ))}
                            </div>
                            <p className="text-center text-xs text-gray-500 mt-2 font-medium capitalize">
                              {formData.emotionalTag ? `Mood: ${formData.emotionalTag}` : 'How did you feel?'}
                            </p>
                          </div>

                          <motion.div
                            className="flex space-x-3 pt-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <motion.button
                              type="button"
                              onClick={onClose}
                              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {t('transaction.cancel')}
                            </motion.button>
                            <motion.button
                              type="submit"
                              disabled={isSubmitting}
                              className={`flex-1 px-4 py-3 text-sm font-medium text-white rounded-lg transition-all ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg'
                                }`}
                              whileHover={isSubmitting ? {} : { scale: 1.02 }}
                              whileTap={isSubmitting ? {} : { scale: 0.98 }}
                            >
                              {isSubmitting ? (
                                <motion.div className="flex items-center justify-center">
                                  <motion.div
                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  />
                                  {t('transaction.submitting')}
                                </motion.div>
                              ) : (
                                t('transaction.submit')
                              )}
                            </motion.button>
                          </motion.div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}