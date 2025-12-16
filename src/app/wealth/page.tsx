'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { Wallet, TrendingUp, Zap, Lock, ArrowRight, ExternalLink, AlertTriangle, Search, ShoppingBag, Plane, Smartphone, Coffee, Tag, ShieldCheck, Clock, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Merchant, Bounty, Glitch } from '@/types/rebate'
import { useDebounce } from 'use-debounce'

import { PRODUCTS, Product, BOOSTS, BOUNTIES, GLITCHES } from '@/data/products'

import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, getDocs, orderBy, limit } from 'firebase/firestore'
import MerchantCard from '@/components/MerchantCard'
import AmazonCashbackInput from '@/components/AmazonCashbackInput'
import GoalsWidget from '@/components/GoalsWidget'


import { useRouter } from 'next/navigation'

export default function WealthPage() {
    const { user, loading: authLoading } = useAuth()
    const { t } = useLanguage()
    const router = useRouter()
    const isPro = user?.subscription?.plan === 'pro'
    const [activeTab, setActiveTab] = useState<'cashback' | 'bounties' | 'glitch' | 'wishlist'>('cashback')
    const [merchants, setMerchants] = useState<Merchant[]>([])
    const [loadingMerchants, setLoadingMerchants] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearchQuery] = useDebounce(searchQuery, 300)
    const [activeMerchant, setActiveMerchant] = useState<Merchant | null>(null)
    const [isTracking, setIsTracking] = useState(false)
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    // Load recent searches from local storage
    useEffect(() => {
        const stored = localStorage.getItem('recentSearches')
        if (stored) {
            setRecentSearches(JSON.parse(stored))
        }
    }, [])

    // Add to recent searches
    useEffect(() => {
        if (debouncedSearchQuery && !recentSearches.includes(debouncedSearchQuery)) {
            const newSearches = [debouncedSearchQuery, ...recentSearches].slice(0, 5)
            setRecentSearches(newSearches)
            localStorage.setItem('recentSearches', JSON.stringify(newSearches))
        }
    }, [debouncedSearchQuery])

    const clearRecentSearches = () => {
        setRecentSearches([])
        localStorage.removeItem('recentSearches')
    }

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/')
        }
    }, [authLoading, user, router])

    // Fetch Real Data
    useEffect(() => {
        if (!user) return

        // Simplified: Fetch Merchants
        const fetchMerchants = async () => {
            try {
                const q = query(collection(db, 'merchants'), orderBy('is_featured', 'desc'))
                const snapshot = await getDocs(q)
                const merchantList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Merchant))
                setMerchants(merchantList)
            } catch (error) {
                console.error('Error fetching merchants:', error)
            } finally {
                setLoadingMerchants(false)
            }
        }

        fetchMerchants()

    }, [user])

    const handleShopClick = (merchant: Merchant) => {
        setActiveMerchant(merchant)
        setIsTracking(true)

        // Direct redirect to the tracking endpoint
        // This will log the click in the backend and redirect to the real merchant site
        if (user?.uid) {
            window.open(`/api/shop/${merchant.id}?uid=${user.uid}`, '_blank')
        }

        // Reset state after a brief moment
        setTimeout(() => {
            setIsTracking(false)
            setActiveMerchant(null)
        }, 1000)
    }

    const handleProductClick = (product: Product) => {
        // Redirect to the new detailed product page
        router.push(`/wealth/product/${product.id}`)
    }

    // Improved "Search Engine" Logic
    const terms = debouncedSearchQuery.toLowerCase().split(' ').filter(t => t.length > 0)

    // Helper for multi-term matching
    const matchesAllTerms = (text: string) => {
        if (terms.length === 0) return true
        const lowerText = text.toLowerCase()
        return terms.every(term => lowerText.includes(term))
    }

    const filteredMerchants = merchants.filter(m =>
        matchesAllTerms(m.name) ||
        matchesAllTerms(m.category) ||
        (m.tags && m.tags.some(tag => matchesAllTerms(tag)))
    )

    const filteredProducts = PRODUCTS.filter(p =>
        matchesAllTerms(p.name) ||
        matchesAllTerms(p.merchant) ||
        matchesAllTerms(p.category) ||
        matchesAllTerms(p.description || '')
    )

    // Categorized Results Check
    const hasMerchants = filteredMerchants.length > 0;
    const hasProducts = filteredProducts.length > 0;
    const hasBounties = (activeTab === 'bounties' ? BOUNTIES : BOUNTIES.filter(b => matchesAllTerms(b.title) || matchesAllTerms(b.description))).length > 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Search Center */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-800 text-white p-6 pb-20 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Wallet className="text-green-200" />
                            {t('wealth.title')}
                        </h1>
                        <Link href="/wallet" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transition-all flex items-center gap-2">
                            {t('wealth.myWallet')} &rarr;
                        </Link>

                        {/* Transparency Tooltip */}
                        <div className="group relative ml-2">
                            <div className="bg-white/10 p-2 rounded-full cursor-help hover:bg-white/20 transition-colors">
                                <ShieldCheck size={16} className="text-green-200" />
                            </div>
                            <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs p-3 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                <p className="font-bold mb-1">{t('wealth.tooltip.howItWorks.title')}</p>
                                <p>{t('wealth.tooltip.howItWorks.desc')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Global Search Bar */}
                    <div className="relative max-w-2xl mx-auto mb-8">
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="text-gray-400" size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder={t('wealth.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-4 focus:ring-green-400/30 text-base font-medium"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center gap-2 hidden sm:flex">
                                {t('wealth.search')}
                            </button>
                        </div>

                        {/* Recent Searches Dropdown */}
                        <AnimatePresence>
                            {showSuggestions && recentSearches.length > 0 && !searchQuery && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 text-gray-900"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-500 uppercase">{t('wealth.search.recent')}</span>
                                        <button onClick={clearRecentSearches} className="text-xs text-gray-400 hover:text-red-500">{t('wealth.search.clear')}</button>
                                    </div>
                                    <div className="space-y-1">
                                        {recentSearches.map((term, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setSearchQuery(term)
                                                    setShowSuggestions(false)
                                                }}
                                                className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-lg text-left text-sm"
                                            >
                                                <Clock size={14} className="text-gray-400" />
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Quick Access Grid - Optimized for Mobile */}
                    <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-md mx-auto text-center">
                        {[
                            { icon: Smartphone, label: t('wealth.category.tech'), query: 'Tech' },
                            { icon: ShoppingBag, label: t('wealth.category.fashion'), query: 'Fashion' },
                            { icon: Plane, label: t('wealth.category.travel'), query: 'Travel' },
                            { icon: Coffee, label: t('wealth.category.food'), query: 'Food' },
                        ].map((item, i) => (
                            <button key={i} onClick={() => setSearchQuery(item.query)} className="flex flex-col items-center gap-2 sm:gap-3 group">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300">
                                    <item.icon size={20} className="sm:w-6 sm:h-6 text-white drop-shadow-md" />
                                </div>
                                <span className="text-[10px] sm:text-xs font-bold text-white/90 tracking-wide uppercase">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20 space-y-6 sm:space-y-8">

                {/* Today's Boost Banner */}
                <div className="overflow-x-auto pb-4 -mx-4 px-4 flex gap-4 scrollbar-hide snap-x">
                    {BOOSTS.map((boost) => (
                        <motion.div
                            key={boost.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`${boost.color} min-w-[280px] sm:min-w-[320px] p-5 rounded-2xl shadow-lg flex items-center justify-between relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform snap-center`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition-colors" />
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-white/20 p-1 rounded-md backdrop-blur-sm">
                                        <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${boost.textColor} opacity-90`}>{t('wealth.boost.title')}</span>
                                </div>
                                <h3 className={`text-2xl font-bold mb-1 ${boost.textColor}`}>{boost.merchant}</h3>
                                <div className={`flex items-center gap-2 text-xs ${boost.textColor} opacity-80 bg-black/20 px-2 py-1 rounded-lg w-fit`}>
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    Ends in {boost.endsIn}h {Math.floor(Math.random() * 59)}m
                                </div>
                            </div>
                            <div className="relative z-10 text-right">
                                <div className="text-4xl font-black text-yellow-400 drop-shadow-md">{(boost.rate * 100).toFixed(0)}%</div>
                                <div className={`text-[10px] font-bold uppercase tracking-widest ${boost.textColor} opacity-80`}>{t('wealth.boost.cashback')}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Amazon Cashback Input */}
                <AmazonCashbackInput />

                {/* Tabs - Scrollable on mobile */}
                <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
                    <div className="bg-white rounded-xl shadow-sm p-1.5 flex gap-1 border border-gray-100 min-w-max sm:min-w-0">
                        {[
                            { id: 'cashback', label: t('wealth.tab.allStores'), icon: ShoppingBag },
                            { id: 'bounties', label: t('wealth.tab.bounties'), icon: Wallet },
                            { id: 'glitch', label: t('wealth.tab.glitch'), icon: Zap },
                            { id: 'wishlist', label: t('wealth.tab.wishlist'), icon: ShoppingBag },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-0 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div>
                    {activeTab === 'cashback' && (
                        <div className="space-y-6">

                            {/* Products Section */}
                            {filteredProducts.length > 0 && (
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="bg-indigo-100 p-1.5 rounded-lg">
                                            <Tag size={16} className="text-indigo-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">{t('wealth.section.featured')}</h3>
                                    </div>
                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0 },
                                            show: {
                                                opacity: 1,
                                                transition: { staggerChildren: 0.1 }
                                            }
                                        }}
                                        initial="hidden"
                                        animate="show"
                                        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
                                    >
                                        {filteredProducts.map(product => (
                                            <motion.div
                                                key={product.id}
                                                variants={{
                                                    hidden: { opacity: 0, y: 20 },
                                                    show: { opacity: 1, y: 0 }
                                                }}
                                                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                                                whileTap={{ scale: 0.98 }}
                                                className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm transition-all cursor-pointer group relative overflow-hidden"
                                                onClick={() => handleProductClick(product)}
                                            >
                                                {/* Hot Badge */}
                                                {['iphone-16-pro-max', 'samsung-s24-ultra'].includes(product.id) && (
                                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10 flex items-center gap-1">
                                                        <TrendingUp size={10} /> HOT
                                                    </div>
                                                )}

                                                <div className="aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden p-2 flex items-center justify-center relative">
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        fill
                                                        sizes="(max-width: 768px) 50vw, 25vw"
                                                        className="object-contain mix-blend-multiply group-hover:scale-110 transition-transform p-2"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1 mb-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{product.merchant}</span>
                                                    <div className="bg-blue-50 text-blue-500 rounded-full p-[2px]">
                                                        <ShieldCheck size={8} />
                                                    </div>
                                                </div>
                                                <h4 className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 min-h-[40px] group-hover:text-indigo-600 transition-colors">
                                                    {product.name}
                                                </h4>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="font-bold text-gray-900 text-lg">${product.price}</span>
                                                        <span className="text-xs font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md border border-green-200">
                                                            {(product.cashbackRate * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            )}

                            {/* Promoted Brands Header */}
                            {filteredMerchants.length > 0 && (
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-orange-100 p-1.5 rounded-lg">
                                        <Zap size={16} className="text-orange-600" />
                                    </div>
                                    <h3 className="font-bold text-gray-900">
                                        {debouncedSearchQuery ? t('wealth.section.matching') : t('wealth.section.trending')}
                                    </h3>
                                </div>
                            )}

                            {/* Merchant Grid - Optimized for Mobile */}
                            {loadingMerchants ? (
                                <div className="text-center text-gray-500 py-12">
                                    <p>{t('wealth.loading')}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {filteredMerchants.length > 0 ? filteredMerchants.map(merchant => (
                                        <MerchantCard
                                            key={merchant.id}
                                            merchant={merchant}
                                            isPro={isPro}
                                            onShopClick={handleShopClick}
                                        />
                                    )) : (
                                        filteredProducts.length === 0 && (
                                            <div className="col-span-full">
                                                <div className="text-center py-8 text-gray-500 mb-8">
                                                    <p className="text-lg font-medium">{t('wealth.noResults', { query: debouncedSearchQuery })}</p>
                                                    <p className="text-sm">{t('wealth.noResults.tip')}</p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'bounties' && (
                        <div className="space-y-4">
                            {/* ... Bounties Content ... same as before but wrapped in correct divs if needed */}
                            {BOUNTIES.map((bounty) => (
                                <motion.div
                                    key={bounty.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between group hover:border-green-200 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 shrink-0">
                                            {bounty.title[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{bounty.title}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-1 sm:line-clamp-2">{bounty.description}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${bounty.difficulty === 'EASY' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {bounty.difficulty}
                                                </span>
                                                {bounty.is_pro_exclusive && (
                                                    <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-medium flex items-center gap-1">
                                                        <Lock size={8} /> PRO
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-xl font-bold text-green-600">+${(bounty.reward_amount / 100).toFixed(0)}</div>
                                        <button
                                            onClick={() => {
                                                if (bounty.is_pro_exclusive && !isPro) {
                                                    router.push('/subscribe')
                                                    return
                                                }
                                                window.open(bounty.link, '_blank')
                                            }}
                                            className={`mt-1 text-sm font-medium flex items-center justify-end gap-1 transition-colors ${bounty.is_pro_exclusive && !isPro
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-gray-900 group-hover:text-green-600'
                                                }`}
                                        >
                                            {bounty.is_pro_exclusive && !isPro ? (
                                                <span className="flex items-center gap-1"><Lock size={12} /> Unlock</span>
                                            ) : (
                                                <><span className="mr-1 hidden sm:inline">{t('wealth.claim')}</span> <ArrowRight size={14} /></>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'glitch' && (
                        <div className="space-y-4">
                            {/* ... Glitch Content ... */}
                            {GLITCHES.map((glitch) => (
                                <div key={glitch.id} className="relative">
                                    {!isPro && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-gray-200">
                                            <Lock className="text-gray-400 mb-2" size={24} />
                                            <h3 className="font-bold text-gray-900">{t('wealth.glitch.proExclusive')}</h3>
                                            <p className="text-sm text-gray-500 mb-3">{t('wealth.glitch.upgradeDesc')}</p>
                                            <Link href="/subscribe" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold">
                                                {t('wealth.glitch.unlock')}
                                            </Link>
                                        </div>
                                    )}

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-gray-500 uppercase">{glitch.retailer}</span>
                                                <span className="text-xs text-red-500 font-bold animate-pulse">• {t('wealth.glitch.live')}</span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg">{glitch.title}</h3>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className="text-2xl font-black text-red-600">${glitch.glitch_price}</span>
                                                <span className="text-sm text-gray-400 line-through">${glitch.original_price}</span>
                                            </div>
                                        </div>
                                        <a
                                            href={glitch.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shrink-0"
                                        >
                                            {t('wealth.buy')} <ExternalLink size={14} />
                                        </a>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'wishlist' && (
                        <div className="space-y-4">
                            <GoalsWidget isPro={isPro} />
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
