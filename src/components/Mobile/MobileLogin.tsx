'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../AuthProvider'
import Logo from '../Logo'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { RecaptchaVerifier } from 'firebase/auth'

import { COUNTRIES } from '../CurrencyProvider'

export default function MobileLogin() {
    const { signIn, signUp, signInWithGoogle, signInWithApple, signInWithPhone, auth, loading } = useAuth()
    const [isLogin, setIsLogin] = useState(true)
    const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email')

    // Email State
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    // Phone State
    const [countryCode, setCountryCode] = useState('+61') // Default AU
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [confirmationResult, setConfirmationResult] = useState<any>(null)

    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        // Setup invisible reCAPTCHA only when needed (e.g., when switching to phone)
        if (auth && authMethod === 'phone' && !window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
                    'size': 'invisible',
                    'callback': () => { }
                });
            } catch (e) {
                console.error("Recaptcha init error:", e)
            }
        }
    }, [auth, authMethod])

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)
        try {
            if (isLogin) {
                await signIn(email, password)
            } else {
                await signUp(email, password)
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed')
            setIsSubmitting(false)
        }
    }

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        // Combine country code and phone number
        let formattedPhone = phoneNumber

        // Remove leading 0 if present (common pattern)
        if (formattedPhone.startsWith('0')) {
            formattedPhone = formattedPhone.substring(1)
        }

        // Combine
        const fullPhoneNumber = countryCode + formattedPhone


        try {
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhone(fullPhoneNumber, appVerifier)
            setConfirmationResult(confirmation)
            setIsSubmitting(false)
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Failed to send SMS code')
            setIsSubmitting(false)
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear()
                window.recaptchaVerifier = undefined // Force re-init
            }
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)
        try {
            await confirmationResult.confirm(otp)
            // Success handled by AuthProvider listener
        } catch (err: any) {
            setError(err.message || 'Invalid code')
            setIsSubmitting(false)
        }
    }

    const handleSocial = async (provider: 'google' | 'apple') => {
        setError(null)
        try {
            if (provider === 'google') await signInWithGoogle()
            if (provider === 'apple') await signInWithApple()
        } catch (err: any) {
            setError(err.message || `Sign in with ${provider} failed`)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-white px-6">
            <div className="flex-1 flex flex-col justify-center items-center pb-8">
                <motion.div
                    layout
                    className="mb-8 text-center"
                >
                    <div className="flex justify-center mb-4">
                        <Logo size="lg" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {confirmationResult
                            ? 'Verify Phone'
                            : (isLogin ? 'Welcome Back' : 'Create Account')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        {confirmationResult
                            ? `Enter the code sent to ${phoneNumber}`
                            : 'Access your wealth journey.'}
                    </p>
                </motion.div>

                {/* Toggle Auth Method Tabs */}
                {!confirmationResult && (
                    <div className="flex w-full max-w-sm mb-6 bg-gray-100 rounded-xl p-1">
                        <button
                            onClick={() => setAuthMethod('email')}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${authMethod === 'email' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Email
                        </button>
                        <button
                            onClick={() => setAuthMethod('phone')}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${authMethod === 'phone' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Phone
                        </button>
                    </div>
                )}

                <div className="w-full max-w-sm">
                    {authMethod === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label className="sr-only">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    className="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:bg-white focus:ring-primary-500 transition-colors"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <label className="sr-only">Password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:bg-white focus:ring-primary-500 transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || loading}
                                className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-md transition-all"
                            >
                                {isSubmitting ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                            </button>
                        </form>
                    )}

                    {authMethod === 'phone' && !confirmationResult && (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div>
                                <label className="sr-only">Phone Number</label>
                                <div className="relative flex">
                                    {/* Country Selector */}
                                    <div className="relative">
                                        <select
                                            className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-xl focus:ring-primary-500 focus:border-primary-500 block w-24 p-2.5 h-[50px] border-r-0"
                                            onChange={(e) => {
                                                const code = e.target.value
                                                // If current number starts with old code, replace it? 
                                                // Simpler: Just rely on the user inputting the number, we prepend code on submit OR we show code in box.
                                                // Better UX: Show code as prefix box.
                                                setCountryCode(code)
                                            }}
                                            value={countryCode}
                                        >
                                            {COUNTRIES.filter(c => c.phoneCode).map(c => (
                                                <option key={c.code} value={c.phoneCode}>
                                                    {c.flag} {c.phoneCode}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="Mobile Number"
                                        className="block w-full rounded-r-xl border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:bg-white focus:ring-primary-500 transition-colors h-[50px]"
                                        required
                                    />
                                </div>
                            </div>
                            <div id="sign-in-button"></div>
                            <button
                                type="submit"
                                id="sign-in-button-submit"
                                disabled={isSubmitting || loading}
                                className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-md transition-all"
                            >
                                {isSubmitting ? 'Sending Code...' : 'Send Verification Code'}
                            </button>
                        </form>
                    )}

                    {authMethod === 'phone' && confirmationResult && (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <label className="sr-only">SMS Code</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-center text-xl tracking-widest text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:bg-white focus:ring-primary-500 transition-colors"
                                    required
                                    maxLength={6}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || loading}
                                className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-md transition-all"
                            >
                                {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setConfirmationResult(null); setOtp(''); }}
                                className="w-full text-sm text-gray-500 hover:text-gray-700"
                            >
                                Change Phone Number
                            </button>
                        </form>
                    )}
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 text-red-500 text-sm text-center bg-red-50 px-4 py-2 rounded-lg"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Social Dividers - Only show on Email/Phone entry, not OTP step */}
                {!confirmationResult && (
                    <div className="mt-8 w-full max-w-sm">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleSocial('google')}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                            <button
                                onClick={() => handleSocial('apple')}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                                </svg>
                                Apple
                            </button>
                        </div>
                    </div>
                )}

                <div className="py-6 text-center">
                    <p className="text-sm text-gray-600">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-semibold text-primary-600 hover:text-primary-500"
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>

            </div>
        </div>
    )
}

declare global {
    interface Window {
        recaptchaVerifier: any;
    }
}
