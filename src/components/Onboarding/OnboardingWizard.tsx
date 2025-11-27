'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import IdentityStep from './IdentityStep'
import PainStep from './PainStep'
import DreamStep from './DreamStep'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../LanguageProvider'
import toast from 'react-hot-toast'
import { Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react'

export default function OnboardingWizard() {
    const [step, setStep] = useState(0)
    const [data, setData] = useState({
        identity: '',
        wastedAmount: 50
    })
    const [isSigningUp, setIsSigningUp] = useState(false)
    const { user, signInWithGoogle, signUp, signIn, error: providerError } = useAuth()
    const { t } = useLanguage()
    const router = useRouter()

    // Email Auth State
    const [showEmailForm, setShowEmailForm] = useState(false)
    const [isLoginMode, setIsLoginMode] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [authError, setAuthError] = useState<string | null>(null)

    // Sync provider error to local state
    if (providerError && !authError) {
        setAuthError(providerError)
    }

    const nextStep = () => setStep(s => s + 1)

    const handleIdentitySelect = (identity: string) => {
        setData(d => ({ ...d, identity }))
        nextStep()
    }

    const handlePainNext = (amount: number) => {
        setData(d => ({ ...d, wastedAmount: amount }))
        nextStep()
    }

    const handleDreamNext = () => {
        nextStep() // Go to signup step
    }

    const handleGoogleSignup = async () => {
        setIsSigningUp(true)
        try {
            await signInWithGoogle()
            // In a real app, we would save `data` to the user's profile here
            // For MVP, we just let the AuthProvider handle the redirect/state update
        } catch (error) {
            console.error('Signup failed', error)
            toast.error(t('auth.googleSignInError'))
            setIsSigningUp(false)
        }
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) return

        setIsSigningUp(true)
        setAuthError(null)

        try {
            if (isLoginMode) {
                await signIn(email, password)
            } else {
                await signUp(email, password)
            }
        } catch (error: any) {
            console.error("Auth failed", error)
            setAuthError(error.message)
            setIsSigningUp(false)
        }
    }

    if (step === 3) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center"
                >
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('onboarding.final.title')}</h2>
                    <p className="text-gray-600 mb-8">{t('onboarding.final.desc')}</p>

                    {authError && (
                        <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 text-left">
                            <AlertCircle size={16} />
                            {authError}
                        </div>
                    )}

                    {!showEmailForm ? (
                        <div className="space-y-4">
                            <button
                                onClick={handleGoogleSignup}
                                disabled={isSigningUp || !!authError}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSigningUp ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        {t('onboarding.processing')}
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-white p-1 rounded-full">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 4.66c1.6 0 3.05.55 4.18 1.6l3.14-3.14C17.45 1.27 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                        </div>
                                        {t('onboarding.cta.google')}
                                    </>
                                )}
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">{t('auth.or')}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowEmailForm(true)}
                                className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Mail className="w-5 h-5" />
                                {t('auth.continueEmail')}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSigningUp}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isSigningUp ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    isLoginMode ? t('auth.login') : t('auth.signup')
                                )}
                            </button>

                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsLoginMode(!isLoginMode)}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    {isLoginMode ? t('auth.noAccount') : t('auth.haveAccount')}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowEmailForm(false)}
                                className="w-full text-gray-400 text-sm hover:text-gray-600 mt-2"
                            >
                                ← Back
                            </button>
                        </form>
                    )}

                    <p className="text-xs text-gray-400 mt-6">
                        By clicking, you agree to our Terms
                    </p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-8">
                    {[0, 1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === step ? 'bg-indigo-600' : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <IdentityStep onSelect={handleIdentitySelect} />
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <PainStep onNext={handlePainNext} />
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <DreamStep annualLoss={data.wastedAmount * 12} onNext={handleDreamNext} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
