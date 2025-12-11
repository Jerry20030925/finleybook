'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import IdentityStep from './IdentityStep'
import PainStep from './PainStep'
import DreamStep from './DreamStep'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../LanguageProvider'
import toast from 'react-hot-toast'
import Logo from '../Logo'

import { Mail, Phone, AlertCircle, Loader2 } from 'lucide-react'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { getGoals, addGoal } from '@/lib/dataService'

interface OnboardingWizardProps {
    initialStep?: number
}

export default function OnboardingWizard({ initialStep = 0 }: OnboardingWizardProps) {
    const [step, setStep] = useState(initialStep)
    const [data, setData] = useState({
        identity: '',
        wastedAmount: 50,
        dreamName: '',
        dreamAmount: 0,
        dreamIcon: '',
        dreamDeadline: ''
    })

    // Auth State
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSigningUp, setIsSigningUp] = useState(false)
    const [authError, setAuthError] = useState<string | null>(null)
    const [showEmailForm, setShowEmailForm] = useState(false)
    const [showPhoneForm, setShowPhoneForm] = useState(false)
    const [showResetForm, setShowResetForm] = useState(false)
    const [isLoginMode, setIsLoginMode] = useState(false)
    const [showVerification, setShowVerification] = useState(false)
    const [verificationCode, setVerificationCode] = useState('')
    const [timer, setTimer] = useState(0)

    // Phone Auth State
    const [phoneNumber, setPhoneNumber] = useState('')
    const [phoneCode, setPhoneCode] = useState('')
    const [confirmationResult, setConfirmationResult] = useState<any>(null)
    const [recaptchaVerifier, setRecaptchaVerifier] = useState<any>(null)
    const [currency, setCurrency] = useState('USD')

    const { signIn, signUp, signInWithGoogle, signInWithPhone, sendPasswordReset, auth } = useAuth()
    const { t } = useLanguage()
    const router = useRouter()

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000)
        }
        return () => clearInterval(interval)
    }, [timer])

    const nextStep = () => setStep(s => s + 1)

    const handleIdentitySelect = (id: string) => {
        setData(d => ({ ...d, identity: id }))
        nextStep()
    }

    const handlePainNext = (amount: number) => {
        setData(d => ({ ...d, wastedAmount: amount }))
        nextStep()
    }

    const handleDreamNext = (dreamData: { title: string, amount: number, icon: string }) => {
        setData(d => ({
            ...d,
            dreamName: dreamData.title,
            dreamAmount: dreamData.amount,
            dreamIcon: dreamData.icon
        }))
        nextStep()
    }

    const handleGoogleSignup = async () => {
        setIsSigningUp(true)
        try {
            const userCred = await signInWithGoogle()
            if (userCred?.user) {
                await saveUserGoal(userCred.user.uid)
            }
        } catch (error) {
            console.error('Signup failed', error)
            toast.error(t('auth.googleSignInError'))
            setIsSigningUp(false)
        }
    }

    const saveUserGoal = async (uid: string) => {
        if (!data.dreamName || !data.dreamAmount) return;
        try {
            await addGoal({
                userId: uid,
                title: data.dreamName,
                targetAmount: data.dreamAmount,
                currentAmount: 0,
                deadline: data.dreamDeadline || '', // Pass the deadline
                category: 'purchase', // Default category
                icon: data.dreamIcon || '🎯',
                isCompleted: false,
                description: 'My Big Dream'
            })
        } catch (e) {
            console.error('Failed to save onboarding goal', e)
        }
    }

    // ...

    const handleSendCode = async () => {
        if (!email) {
            toast.error(t('validation.emailRequired'))
            return
        }
        setIsSigningUp(true)
        setAuthError(null)
        try {
            const res = await fetch('/api/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            if (!res.ok) {
                const json = await res.json()
                throw new Error(json.error || 'Failed to send code')
            }
            setShowVerification(true)
            setTimer(60)
            toast.success('Verification code sent!')
        } catch (error: any) {
            console.error('Send code failed', error)
            setAuthError(error.message)
        } finally {
            setIsSigningUp(false)
        }
    }

    const handleVerifyCode = async () => {
        setIsSigningUp(true)
        setAuthError(null)
        try {
            const res = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode })
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)

            // Code verified, proceed with signup
            const userCred = await signUp(email, password)
            if (userCred?.user) {
                await saveUserGoal(userCred.user.uid)
            }
            router.push('/dashboard')
        } catch (error: any) {
            console.error('Verification failed', error)
            setAuthError(error.message)
            setIsSigningUp(false)
        }
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) return

        if (isLoginMode) {
            // Login flow (no verification needed)
            setIsSigningUp(true)
            setAuthError(null)
            try {
                await signIn(email, password)
                router.push('/dashboard')
            } catch (error: any) {
                console.error("Auth failed", error)
                setAuthError(error.message)
                setIsSigningUp(false)
            }
        } else {
            // Signup flow (require verification)
            await handleSendCode()
        }
    }

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            toast.error(t('validation.emailRequired'))
            return
        }

        setIsSigningUp(true)
        try {
            await sendPasswordReset(email)
            toast.success('Password reset email sent! Check your inbox.')
            setShowResetForm(false)
            setIsLoginMode(true)
        } catch (error: any) {
            console.error('Reset failed', error)
            setAuthError(error.message)
        } finally {
            setIsSigningUp(false)
        }
    }

    const setupRecaptcha = async () => {
        if (!auth) return
        try {
            const { RecaptchaVerifier } = await import('firebase/auth')
            const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved
                }
            })
            setRecaptchaVerifier(verifier)
            return verifier
        } catch (error) {
            console.error('Recaptcha setup error:', error)
        }
    }



    const handlePhoneChange = (value: string | undefined) => {
        setPhoneNumber(value || '')
        if (value) {
            // Simple heuristic to detect currency based on calling code
            // This is a basic mapping, can be expanded
            if (value.startsWith('+61')) setCurrency('AUD')
            else if (value.startsWith('+86')) setCurrency('CNY')
            else if (value.startsWith('+44')) setCurrency('GBP')
            else if (value.startsWith('+1')) setCurrency('USD')
            else if (value.startsWith('+81')) setCurrency('JPY')
            else if (value.startsWith('+33') || value.startsWith('+49')) setCurrency('EUR')
            // Default to USD if not matched or if it's +1
        }
    }

    const handlePhoneSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
            toast.error('Please enter a valid phone number')
            return
        }

        setIsSigningUp(true)
        setAuthError(null)
        try {
            const verifier = recaptchaVerifier || await setupRecaptcha()
            const confirmation = await signInWithPhone(phoneNumber, verifier)
            setConfirmationResult(confirmation)
            toast.success('Verification code sent!')
        } catch (error: any) {
            console.error('Phone auth error:', error)
            setAuthError(error.message || 'Failed to send code')
            if (recaptchaVerifier) {
                recaptchaVerifier.clear()
                setRecaptchaVerifier(null)
            }
        } finally {
            setIsSigningUp(false)
        }
    }

    const handleVerifyPhoneCode = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!phoneCode) return

        setIsSigningUp(true)
        setAuthError(null)
        try {
            const result = await confirmationResult.confirm(phoneCode)
            if (result?.user) {
                await saveUserGoal(result.user.uid)
            }
            toast.success(t('auth.signInSuccess'))
            router.push('/dashboard')
        } catch (error: any) {
            console.error('Code verification error:', error)
            setAuthError('Invalid verification code')
        } finally {
            setIsSigningUp(false)
        }
    }

    // ... other handlers

    if (step === 3) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center"
                >
                    <div className="flex justify-center mb-6">
                        <Logo size="xl" className="justify-center" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {showResetForm ? 'Reset Password' : 'Last Step'}
                    </h2>
                    <p className="text-gray-600 mb-8">
                        {showResetForm
                            ? 'Enter your email to receive a reset link.'
                            : 'One second to open your "Flight Fund".'}
                    </p>

                    {authError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex flex-col gap-2 text-left">
                            <div className="flex items-center gap-2 font-medium">
                                <AlertCircle size={16} />
                                <span>Authentication Error</span>
                            </div>
                            <p className="text-xs opacity-90 break-all">{authError}</p>
                            <button
                                onClick={() => setAuthError(null)}
                                className="text-xs font-bold underline self-start hover:text-red-800"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {showResetForm ? (
                        <form onSubmit={handlePasswordReset} className="space-y-4 text-left">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">{t('auth.email')}</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSigningUp}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-200 mt-6"
                            >
                                {isSigningUp ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setShowResetForm(false)}
                                    className="text-gray-400 text-sm hover:text-gray-600 font-medium flex items-center justify-center gap-1 mx-auto"
                                >
                                    ← Back to Login
                                </button>
                            </div>
                        </form>
                    ) : showPhoneForm ? (
                        <div className="space-y-6 text-left">
                            <div className="flex items-center mb-4">
                                <button
                                    onClick={() => {
                                        setShowPhoneForm(false)
                                        setConfirmationResult(null)
                                        setPhoneNumber('')
                                        setPhoneCode('')
                                        setAuthError(null)
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                                >
                                    ← Back to options
                                </button>
                            </div>

                            {!confirmationResult ? (
                                <form onSubmit={handlePhoneSignIn} className="space-y-6">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <div className="phone-input-container">
                                            <PhoneInput
                                                international
                                                defaultCountry="US"
                                                value={phoneNumber}
                                                onChange={handlePhoneChange}
                                                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-500 transition-all outline-none text-gray-900 placeholder-gray-400 bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div id="recaptcha-container"></div>

                                    <button
                                        type="submit"
                                        disabled={isSigningUp}
                                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-200"
                                    >
                                        {isSigningUp ? 'Sending Code...' : 'Send Verification Code'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyPhoneCode} className="space-y-6">
                                    <div>
                                        <label htmlFor="phoneCode" className="block text-sm font-bold text-gray-700 mb-2">
                                            Verification Code
                                        </label>
                                        <input
                                            type="text"
                                            id="phoneCode"
                                            value={phoneCode}
                                            onChange={(e) => setPhoneCode(e.target.value)}
                                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-gray-900 placeholder-gray-400 text-center text-2xl tracking-widest"
                                            placeholder="123456"
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSigningUp}
                                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-200"
                                    >
                                        {isSigningUp ? 'Verifying...' : 'Verify & Sign In'}
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : !showEmailForm ? (
                        <div className="space-y-4">
                            {/* ... Google and Email buttons ... */}
                            <button
                                onClick={handleGoogleSignup}
                                disabled={isSigningUp || !!authError}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
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
                                        {t('auth.googleSignIn')}
                                    </>
                                )}
                            </button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500 font-medium">{t('auth.or')}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowEmailForm(true)}
                                className="w-full bg-white border-2 border-gray-100 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-2"
                            >
                                <Mail className="w-5 h-5" />
                                {t('auth.continueEmail')}
                            </button>

                            <button
                                onClick={() => setShowPhoneForm(true)}
                                className="w-full bg-white border-2 border-gray-100 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-2"
                            >
                                <Phone className="w-5 h-5" />
                                Continue with Phone
                            </button>
                        </div>
                    ) : (
                        showVerification ? (
                            <div className="space-y-4 text-left" >
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
                                    <p className="text-sm text-gray-600">
                                        We sent a code to <span className="font-bold">{email}</span>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Verification Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-gray-900 placeholder-gray-400 text-center text-2xl tracking-widest font-mono"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleVerifyCode}
                                    disabled={isSigningUp || verificationCode.length !== 6}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-200"
                                >
                                    {isSigningUp ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        'Verify & Create Account'
                                    )}
                                </button>

                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={handleSendCode}
                                        disabled={timer > 0}
                                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm disabled:text-gray-400"
                                    >
                                        {timer > 0 ? `Resend code in ${timer}s` : 'Resend Code'}
                                    </button>
                                </div>

                                <div className="text-center mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowVerification(false)}
                                        className="text-gray-400 text-sm hover:text-gray-600 font-medium"
                                    >
                                        ← Change Email
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">{t('auth.email')}</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1.5 ml-1">
                                        <label className="block text-sm font-bold text-gray-700">{t('auth.password')}</label>
                                        {isLoginMode && (
                                            <button
                                                type="button"
                                                onClick={() => setShowResetForm(true)}
                                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                            >
                                                {t('auth.forgotPassword')}
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSigningUp}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-200 mt-6"
                                >
                                    {isSigningUp ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        isLoginMode ? t('auth.signIn') : t('auth.signUp')
                                    )}
                                </button>

                                <div className="text-center mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsLoginMode(!isLoginMode)}
                                        className="text-indigo-600 hover:text-indigo-800 font-bold text-sm"
                                    >
                                        {isLoginMode ? t('auth.createAccount') : t('auth.haveAccount')}
                                    </button>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmailForm(false)}
                                        className="text-gray-400 text-sm hover:text-gray-600 font-medium flex items-center justify-center gap-1 mx-auto"
                                    >
                                        ← {t('common.back')}
                                    </button>
                                </div>
                            </form>
                        )
                    )}

                    <p className="text-xs text-gray-400 mt-8">
                        {t('onboarding.final.terms')}
                    </p>
                </motion.div >
            </div >
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                            Step {step + 1} of 3
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                            {step === 0 ? 'Foundation' : step === 1 ? 'Discovery' : 'Visualization'}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((step + 1) / 3) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="h-full bg-indigo-600 rounded-full"
                        />
                    </div>
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
                            <PainStep onNext={handlePainNext} currency={currency} />
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <DreamStep onNext={handleDreamNext} currency={currency} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

