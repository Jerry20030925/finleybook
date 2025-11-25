'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, EyeIcon, EyeSlashIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useAuth } from './AuthProvider'
import { useLanguage } from './LanguageProvider'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

interface AuthModalProps {
  mode: 'signin' | 'signup'
  onClose: () => void
}

export default function AuthModal({ mode, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentMode, setCurrentMode] = useState(mode)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { signIn, signUp, signInWithGoogle } = useAuth()
  const { t } = useLanguage()

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!email) {
      newErrors.email = t('validation.emailRequired')
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('validation.emailInvalid')
    }

    if (!password) {
      newErrors.password = t('validation.passwordRequired')
    } else if (password.length < 6) {
      newErrors.password = t('validation.passwordTooShort')
    }

    if (currentMode === 'signup') {
      if (!confirmPassword) {
        newErrors.confirmPassword = t('validation.confirmPasswordRequired')
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = t('validation.passwordMismatch')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      if (currentMode === 'signin') {
        await signIn(email, password)
        toast.success(t('auth.signInSuccess'))
      } else {
        await signUp(email, password)
        toast.success(t('auth.signUpSuccess'))
      }
      onClose()
    } catch (error: any) {
      console.error('Auth error:', error)
      const errorMessage = error.message || (currentMode === 'signin' ? t('auth.signInError') : t('auth.signUpError'))
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      toast.success(t('auth.googleSignInSuccess'))
      onClose()
    } catch (error: any) {
      console.error('Google auth error:', error)
      toast.error(t('auth.googleSignInError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Transition appear show={true} as={Fragment}>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-8 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-8 scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden bg-white shadow-2xl transition-all w-full max-w-lg rounded-3xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-cyan-50" />
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl">
                  <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-violet-200 to-cyan-200 rounded-full blur-3xl opacity-40" />
                  <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-40" />
                </div>

                {/* Main Content */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative z-10 px-8 py-12 sm:px-12"
                >
                  {/* Close button */}
                  <button
                    type="button"
                    className="absolute right-6 top-6 rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-all duration-200 backdrop-blur-sm"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>

                  {/* Header */}
                  <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-10"
                  >
                    {/* Logo */}
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="inline-flex items-center justify-center mb-6"
                    >
                      <div className="relative">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-4 shadow-2xl">
                          <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                            <span className="text-2xl font-bold bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent">F</span>
                          </div>
                        </div>
                        <SparklesIcon className="absolute -top-1 -right-1 w-6 h-6 text-yellow-400 animate-pulse" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        FinleyBook
                      </h1>
                      <Dialog.Title as="h2" className="text-xl font-semibold text-gray-800 mb-3">
                        {currentMode === 'signin' ? t('auth.welcomeBack') : t('auth.createAccount')}
                      </Dialog.Title>
                      <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                        {currentMode === 'signin' ? t('auth.signInDescription') : t('auth.signUpDescription')}
                      </p>
                    </motion.div>
                  </motion.div>

                  {/* Google Sign In Button */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                  >
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full group relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl px-6 py-4 text-gray-700 font-medium hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-50 via-yellow-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl" />
                      <div className="relative flex items-center justify-center">
                        <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>{t('auth.continueWithGoogle')}</span>
                      </div>
                    </button>
                  </motion.div>

                  {/* Divider */}
                  <motion.div 
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="relative flex items-center justify-center mb-8"
                  >
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative bg-white px-4 text-sm text-gray-500">
                      {t('auth.orContinueWith')}
                    </div>
                  </motion.div>

                  {/* Form */}
                  <motion.form
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    onSubmit={handleSubmit} 
                    className="space-y-6"
                  >
                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('auth.email')}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-violet-500 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                            errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-violet-500'
                          }`}
                          placeholder={t('auth.emailPlaceholder')}
                          required
                          autoComplete="email"
                        />
                        {errors.email && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-sm text-red-600 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.email}
                          </motion.p>
                        )}
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('auth.password')}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full px-4 py-3.5 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-violet-500 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                            errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-violet-500'
                          }`}
                          placeholder={currentMode === 'signin' ? t('auth.passwordPlaceholder') : t('auth.passwordSignUpPlaceholder')}
                          required
                          autoComplete={currentMode === 'signin' ? 'current-password' : 'new-password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                        {errors.password && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-sm text-red-600 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.password}
                          </motion.p>
                        )}
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    {currentMode === 'signup' && (
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          {t('auth.confirmPassword')}
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full px-4 py-3.5 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-violet-500 transition-all duration-200 outline-none bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                              errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-violet-500'
                            }`}
                            placeholder={t('auth.confirmPasswordPlaceholder')}
                            required
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                          {errors.confirmPassword && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-600 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {errors.confirmPassword}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-200 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {currentMode === 'signin' ? t('auth.signingIn') : t('auth.signingUp')}
                        </div>
                      ) : (
                        currentMode === 'signin' ? t('auth.signIn') : t('auth.signUp')
                      )}
                    </motion.button>

                    {/* Mode Switch */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-center pt-4"
                    >
                      <p className="text-sm text-gray-600">
                        {currentMode === 'signin' ? t('auth.noAccount') : t('auth.haveAccount')}
                        {' '}
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentMode(currentMode === 'signin' ? 'signup' : 'signin')
                            setErrors({})
                          }}
                          className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
                        >
                          {currentMode === 'signin' ? t('auth.signUp') : t('auth.signIn')}
                        </button>
                      </p>
                    </motion.div>
                  </motion.form>
                </motion.div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}