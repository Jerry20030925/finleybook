'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Gift, CheckCircle, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

function RedeemContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user, loading } = useAuth()
    const code = searchParams.get('code')
    const [redeeming, setRedeeming] = useState(false)
    const [redeemed, setRedeemed] = useState(false)

    useEffect(() => {
        if (!code) {
            router.push('/')
        }
    }, [code, router])

    const handleRedeem = async () => {
        if (!user) {
            // Redirect to signup with code
            router.push(`/auth?mode=signup&referralCode=${code}`)
            return
        }

        setRedeeming(true)
        try {
            const token = await user.getIdToken()
            const response = await fetch('/api/referral/redeem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            })

            const data = await response.json()

            if (response.ok) {
                setRedeemed(true)
                toast.success('Gift redeemed successfully!')
                setTimeout(() => router.push('/dashboard'), 3000)
            } else {
                toast.error(data.error || 'Failed to redeem gift')
            }
        } catch (error) {
            console.error('Redemption error:', error)
            toast.error('Something went wrong')
        } finally {
            setRedeeming(false)
        }
    }

    if (!code) return null

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-md shadow-lg">
                            <Gift className="text-white w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">You've received a gift!</h1>
                        <p className="text-indigo-100 text-lg">30 Days of FinleyBook Pro</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {redeemed ? (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <CheckCircle className="text-green-600 w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gift Activated!</h2>
                            <p className="text-gray-600 mb-6">Your account has been upgraded to Pro.</p>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 flex items-center gap-3">
                                <Clock className="text-orange-500 w-5 h-5 flex-shrink-0" />
                                <p className="text-sm text-orange-700 font-medium">
                                    This gift expires in 48 hours. Claim it now!
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h3 className="font-semibold text-gray-900">What's included:</h3>
                                <ul className="space-y-3">
                                    {[
                                        'Unlimited AI Price Finder searches',
                                        'Double Cashback Rewards',
                                        'Priority Support',
                                        'Advanced Analytics'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-600">
                                            <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={handleRedeem}
                                disabled={redeeming}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {redeeming ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        {user ? 'Activate Pro Now' : 'Sign Up to Claim'}
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            {!user && (
                                <p className="text-center mt-4 text-sm text-gray-500">
                                    Already have an account? <Link href={`/auth?mode=signin&referralCode=${code}`} className="text-indigo-600 font-medium hover:underline">Log in</Link>
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function RedeemPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
            <RedeemContent />
        </Suspense>
    )
}
