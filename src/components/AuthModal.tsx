'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from './AuthProvider'
import { useLanguage } from './LanguageProvider'
import toast from 'react-hot-toast'
import Image from 'next/image'

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
    <Transition.Root show={true} as={Fragment}>
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
          <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-teal-900/95 backdrop-blur-sm transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all w-full max-w-md">
                {/* Gradient header background */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 opacity-10" />

                {/* Close button */}
                <div className="absolute right-4 top-4 z-10">
                  <button
                    type="button"
                    className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="relative px-6 py-8 sm:px-10 sm:py-10">
                  {/* Logo and Title */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-6 transform hover:scale-105 transition-transform duration-300">
                      <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 p-3 shadow-xl ring-4 ring-white ring-opacity-50">
                        <Image
                          src="/logo.png"
                          alt="FinleyBook Logo"
                          width={80}
                          height={80}
                          className="w-full h-full object-contain filter brightness-110"
                          priority
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <h1 className="text-2xl font-bold text-gray-800 mb-1">FinleyBook</h1>
                      <Dialog.Title as="h2" className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                        {currentMode === 'signin' ? t('auth.welcomeBack') : t('auth.createAccount')}
                      </Dialog.Title>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {currentMode === 'signin' ? t('auth.signInDescription') : t('auth.signUpDescription')}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('auth.email')}
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all duration-200 outline-none bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500 ${
                            errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'
                          }`}
                          placeholder={t('auth.emailPlaceholder')}
                          required
                          autoComplete="email"
                        />
                        {errors.email && (
                          <p className="mt-1.5 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('auth.password')}
                        </label>
                        <input
                          type="password"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all duration-200 outline-none bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500 ${
                            errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'
                          }`}
                          placeholder={currentMode === 'signin' ? t('auth.passwordPlaceholder') : t('auth.passwordSignUpPlaceholder')}
                          required
                          minLength={6}
                          autoComplete={currentMode === 'signin' ? 'current-password' : 'new-password'}
                        />
                        {errors.password && (
                          <p className="mt-1.5 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.password}
                          </p>
                        )}
                      </div>

                      {currentMode === 'signup' && (
                        <div className="animate-fadeIn">
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t('auth.confirmPassword')}
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all duration-200 outline-none bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500 ${
                              errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'
                            }`}
                            placeholder={t('auth.confirmPasswordPlaceholder')}
                            required
                            minLength={6}
                            autoComplete="new-password"
                          />
                          {errors.confirmPassword && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center">
                              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 space-y-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('auth.processing')}
                          </span>
                        ) : (
                          currentMode === 'signin' ? t('auth.signIn') : t('auth.signUp')
                        )}
                      </button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="bg-white px-3 text-gray-500 font-medium">{currentMode === 'signin' ? 'or' : 'or'}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex justify-center items-center px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200"
                      >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {t('auth.googleSignIn')}
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentMode(currentMode === 'signin' ? 'signup' : 'signin')
                            setErrors({})
                            setEmail('')
                            setPassword('')
                            setConfirmPassword('')
                          }}
                          className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors duration-200"
                        >
                          {currentMode === 'signin' ? t('auth.noAccount') : t('auth.hasAccount')}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}