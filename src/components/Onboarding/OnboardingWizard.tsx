'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import IdentityStep from './IdentityStep'
import PainStep from './PainStep'
import DreamStep from './DreamStep'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'

export default function OnboardingWizard() {
    const [step, setStep] = useState(0)
    const [data, setData] = useState({
        identity: '',
        wastedAmount: 50
    })
    const { signInWithGoogle } = useAuth()
    const router = useRouter()

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

    const handleSignup = async () => {
        try {
            await signInWithGoogle()
            // In a real app, we would save `data` to the user's profile here
            // For MVP, we just let the AuthProvider handle the redirect/state update
        } catch (error) {
            console.error('Signup failed', error)
        }
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

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center bg-white p-8 rounded-3xl shadow-xl"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                最后一步
                            </h2>
                            <p className="text-gray-600 mb-8">
                                只需一秒，开启你的“机票基金”账户。
                            </p>

                            <button
                                onClick={handleSignup}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                使用 Google 开启
                            </button>
                            <p className="text-xs text-gray-400 mt-4">
                                点击即代表同意我们的服务条款
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
