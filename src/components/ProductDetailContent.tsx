'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Share2, Heart, Check, ExternalLink, ShieldCheck, Zap } from 'lucide-react'
import { Product } from '@/data/products'
import { Dialog } from '@headlessui/react'
import { useAuth } from '@/components/AuthProvider'

interface ProductDetailContentProps {
    product: Product
}

export default function ProductDetailContent({ product }: ProductDetailContentProps) {
    const router = useRouter()
    const { user } = useAuth()
    const [isTracking, setIsTracking] = useState(false)
    const [trackingMerchant, setTrackingMerchant] = useState<any>(null)

    // Sort offers by effective price (price - cashback)
    const sortedOffers = [...(product.offers || [])].sort((a, b) => {
        const effA = a.price - (a.price * a.cashbackRate)
        const effB = b.price - (b.price * b.cashbackRate)
        return effA - effB
    })

    const bestOffer = sortedOffers[0]

    const handleActivate = async (offer: any) => {
        setTrackingMerchant(offer)
        setIsTracking(true)

        // Fire and forget email trigger
        if (user?.email) {
            fetch('/api/wealth/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    name: user.displayName || 'Friend',
                    merchant: offer.merchant,
                    rate: `${(offer.cashbackRate * 100).toFixed(0)}%`
                })
            }).catch(e => console.error('Failed to trigger email', e))
        }

        // Simulate activation delay
        setTimeout(() => {
            setIsTracking(false)
            if (offer.link && offer.link !== '#') {
                window.open(offer.link, '_blank')
            } else {
                alert(`Redirecting to ${offer.merchant} homepage (No product link available)`)
            }
        }, 2500)
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Tracking Modal */}
            <Dialog open={isTracking} onClose={() => { }} className="relative z-50">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                            <motion.div
                                className="h-full bg-green-500"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2.5, ease: "linear" }}
                            />
                        </div>

                        <div className="flex items-center justify-center gap-4 mb-6 mt-2">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center p-3 shadow-inner relative">
                                <Image src="/logo.png" alt="Finley" fill className="object-contain p-3" />
                            </div>
                            <div className="flex gap-1">
                                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-2 h-2 rounded-full bg-green-500" />
                                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 rounded-full bg-green-500" />
                                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 rounded-full bg-green-500" />
                            </div>
                            <div className="w-16 h-16 bg-white border border-gray-100 rounded-full flex items-center justify-center p-3 shadow-lg relative">
                                <div className="text-xs font-bold">{trackingMerchant?.merchant}</div>
                            </div>
                        </div>

                        <Dialog.Title className="text-xl font-bold text-gray-900 mb-2">Activating Cashback...</Dialog.Title>
                        <Dialog.Description className="text-gray-500 text-sm">
                            Sit tight! We are securing your {(trackingMerchant?.cashbackRate * 100).toFixed(0)}% cashback at {trackingMerchant?.merchant}.
                        </Dialog.Description>
                    </Dialog.Panel>
                </div>
            </Dialog>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Headers */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/wealth" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Vault
                    </Link>
                    <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-all">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div className="relative aspect-square bg-white rounded-3xl p-8 flex items-center justify-center border border-gray-100 shadow-sm">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-8 mix-blend-multiply hover:scale-105 transition-transform duration-500"
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                            {bestOffer && (
                                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1">
                                    <Zap className="w-3 h-3 fill-current" />
                                    Best Price
                                </span>
                            )}
                            <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Verified Deal
                            </span>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-2">
                            <span className="text-indigo-600 font-bold tracking-wider text-xs uppercase bg-indigo-50 px-2 py-1 rounded-md">{product.category}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>
                        <p className="text-gray-500 mb-8 leading-relaxed max-w-lg">{product.description}</p>

                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Cashback Opportunities</span>
                                <span className="text-xs text-gray-400 font-medium">Updated 5m ago</span>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {sortedOffers.map((offer, idx) => {
                                    const isBest = idx === 0
                                    const cashbackAmount = offer.price * offer.cashbackRate
                                    const finalPrice = offer.price - cashbackAmount

                                    return (
                                        <div key={idx} className={`p-5 flex items-center justify-between hover:bg-gray-50 transition-colors ${isBest ? 'bg-indigo-50/30' : ''}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-500 relative overflow-hidden">
                                                    {/* Placeholder for merchant logo */}
                                                    {offer.merchant.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                                        {offer.merchant}
                                                        {isBest && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">BEST</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        ${offer.price} - <span className="text-green-600 font-medium">${cashbackAmount.toFixed(2)} cashback</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-lg font-bold text-gray-900">${finalPrice.toFixed(2)}</div>
                                                    <div className="text-xs text-green-600 font-medium">{(offer.cashbackRate * 100).toFixed(0)}% Rewards</div>
                                                </div>
                                                <button
                                                    onClick={() => handleActivate(offer)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${isBest
                                                        ? 'bg-gray-900 text-white hover:bg-black hover:shadow-md hover:scale-105'
                                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                        }`}
                                                >
                                                    Activate <ExternalLink className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-xl flex gap-3 text-sm text-blue-800 border border-blue-100">
                            <div className="mt-0.5">💡</div>
                            <p>
                                <strong>Pro Tip:</strong> Prices change frequently. We update these offers every 15 minutes to ensure you get the best possible cashback rate.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
