'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useScroll, useSpring } from 'framer-motion'
import {
    ArrowRight,
    Bot,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Fingerprint,
    LineChart,
    Radar,
    ShieldCheck,
    Sparkles,
    Star,
    Target
} from 'lucide-react'
import { useLanguage } from './LanguageProvider'
import LanguageSwitcher from './LanguageSwitcher'
import CountrySelector, { useCountry } from './CountrySelector'
import Footer from './Footer'
import Logo from './Logo'
import { useExperience } from '@/components/ExperienceProvider'

interface LandingPageProps {
    onStart: () => void
    onLogin: () => void
}

type FeatureItem = {
    title: string
    description: string
    icon: React.ReactNode
    accent: string
}

type StepItem = {
    title: string
    description: string
}

type TestimonialItem = {
    name: string
    role: string
    quote: string
    rating: number
}

type FaqItem = {
    question: string
    answer: string
}

const featureItems: FeatureItem[] = [
    {
        title: 'AI Financial Copilot',
        description: 'Ask practical questions and get decision-ready guidance based on your current spending and cash flow.',
        icon: <Bot className="h-5 w-5 text-cyan-300" />,
        accent: 'from-cyan-400 to-sky-500'
    },
    {
        title: 'Decision-Grade Reports',
        description: 'Generate professional monthly reviews with priorities, trends, and action plans you can execute immediately.',
        icon: <LineChart className="h-5 w-5 text-cyan-300" />,
        accent: 'from-sky-400 to-blue-500'
    },
    {
        title: 'Secure Wealth Operations',
        description: 'Run your budgeting, goals, and bookkeeping in one secure workflow with bank-level security practices.',
        icon: <ShieldCheck className="h-5 w-5 text-cyan-300" />,
        accent: 'from-blue-400 to-indigo-500'
    }
]

const stepItems: StepItem[] = [
    {
        title: 'Record once',
        description: 'Add or import transactions quickly. FinleyBook structures your money data automatically.'
    },
    {
        title: 'Review weekly',
        description: 'Use AI guidance to spot overspending risks, cash-flow pressure, and opportunities.'
    },
    {
        title: 'Execute confidently',
        description: 'Set budgets, adjust goals, and run your monthly report with one consistent workflow.'
    }
]

const testimonialItems: TestimonialItem[] = [
    {
        name: 'Alicia Tran',
        role: 'Founder & Operator',
        quote: 'FinleyBook turned our monthly finance review from guesswork into a clear operating rhythm.',
        rating: 5
    },
    {
        name: 'Daniel Wu',
        role: 'Product Manager',
        quote: 'The AI assistant is practical. It tells me what to do next, not just what happened.',
        rating: 5
    },
    {
        name: 'Mia Patel',
        role: 'Consultant',
        quote: 'The reporting layout looks professional enough to share with stakeholders immediately.',
        rating: 5
    }
]

const faqItems: FaqItem[] = [
    {
        question: 'Is FinleyBook suitable for beginners?',
        answer: 'Yes. The workflow is built for non-finance users. You can ask the AI assistant what to do at every step.'
    },
    {
        question: 'Do I need to connect a bank account?',
        answer: 'No. You can start with manual records and still access budgeting, goals, and report generation.'
    },
    {
        question: 'Can I export professional reports?',
        answer: 'Yes. You can generate and export PDF/CSV reports with clean, presentation-ready formatting.'
    },
    {
        question: 'How is my data protected?',
        answer: 'FinleyBook follows bank-level security practices with encrypted transport and controlled access patterns.'
    }
]

const tickerItems = [
    'AI-Coached Bookkeeping',
    'Decision-Grade Monthly Reports',
    'Adaptive Budget Guardrails',
    'Goal Automation',
    'Professional Export Workflow'
]

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    // duration reduced 0.55→0.38 for snappier entrance; ease unchanged
    visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as any } }
}

export default function LandingPage({ onStart, onLogin }: LandingPageProps) {
    const { t } = useLanguage()
    const { selectedCountry, updateCountry } = useCountry()
    const [activeFaq, setActiveFaq] = useState<number | null>(0)
    const { reduceMotion, allowRichMotion, isMobile } = useExperience()
    const ambientMotionEnabled = allowRichMotion && !isMobile
    const { scrollYProgress } = useScroll()
    // mass raised & damping raised: smoother deceleration on fast scroll
    const progressValue = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 32,
        mass: 0.35,
    })

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
            {/* Scroll progress bar */}
            <motion.div
                className="fixed left-0 top-0 z-[70] h-1 w-full origin-left bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500"
                style={{ scaleX: progressValue }}
            />

            {/* Ambient background */}
            <div className="pointer-events-none absolute inset-0">
                <motion.div
                    className="absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-200/30 blur-3xl"
                    animate={!ambientMotionEnabled ? undefined : { opacity: [0.35, 0.55, 0.35], scale: [1, 1.08, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute right-[-10rem] top-[22rem] h-[22rem] w-[22rem] rounded-full bg-blue-200/25 blur-3xl"
                    animate={!ambientMotionEnabled ? undefined : { opacity: [0.25, 0.45, 0.25], x: [0, -16, 0], y: [0, 12, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-[20%] left-[-8rem] h-[18rem] w-[18rem] rounded-full bg-indigo-200/20 blur-3xl"
                    animate={!ambientMotionEnabled ? undefined : { opacity: [0.2, 0.38, 0.2], y: [0, -14, 0] }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.35) 1px, transparent 0)',
                        backgroundSize: '24px 24px'
                    }}
                />
            </div>

            {/* Header */}
            <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 pt-6 sm:px-10 lg:px-16">
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                >
                    <Logo size="lg" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.08 }}
                    className="flex items-center gap-2 sm:gap-3"
                >
                    <motion.button
                        onClick={onLogin}
                        whileHover={allowRichMotion ? { scale: 1.03, y: -1 } : undefined}
                        whileTap={allowRichMotion ? { scale: 0.97 } : undefined}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-slate-900"
                    >
                        {t('auth.login')}
                    </motion.button>
                    <CountrySelector selectedCountry={selectedCountry} onCountryChange={updateCountry} />
                    <LanguageSwitcher />
                </motion.div>
            </header>

            <main className="relative z-10">
                {/* Hero */}
                <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 pb-16 pt-14 sm:px-10 lg:grid-cols-2 lg:px-16 lg:pb-24 lg:pt-20">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-7"
                    >
                        <motion.div
                            variants={itemVariants}
                            className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700"
                            animate={!allowRichMotion ? undefined : { boxShadow: ['0 0 0 rgba(14,165,233,0)', '0 0 20px rgba(14,165,233,0.18)', '0 0 0 rgba(14,165,233,0)'] }}
                            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <motion.span
                                animate={!allowRichMotion ? undefined : { rotate: [0, 15, -10, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                            </motion.span>
                            Professional Wealth Intelligence
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl"
                        >
                            A clean financial{' '}
                            <span className="animate-gradient-text">operating system</span>{' '}
                            for modern households.
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="max-w-xl text-lg leading-relaxed text-slate-600"
                        >
                            Track wealth, manage budgets, and run decision-grade monthly reviews with an AI assistant that explains what to do next.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <motion.button
                                onClick={onStart}
                                whileHover={allowRichMotion ? { scale: 1.04, y: -2, boxShadow: '0 12px 28px -4px rgba(15,23,42,0.35)' } : undefined}
                                whileTap={allowRichMotion ? { scale: 0.96 } : undefined}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition"
                            >
                                Start free
                                <motion.span
                                    animate={!allowRichMotion ? undefined : { x: [0, 3, 0] }}
                                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 }}
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </motion.span>
                            </motion.button>
                            <motion.a
                                href="#features"
                                whileHover={allowRichMotion ? { scale: 1.03, y: -1 } : undefined}
                                whileTap={allowRichMotion ? { scale: 0.97 } : undefined}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-slate-900"
                            >
                                Explore features
                            </motion.a>
                        </motion.div>

                        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
                            <TrustChip title="Bank-grade security" allowHover={allowRichMotion} delay={0} />
                            <TrustChip title="Real-time insights" allowHover={allowRichMotion} delay={0.06} />
                            <TrustChip title="Mobile optimized" allowHover={allowRichMotion} delay={0.12} />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className="relative lg:pl-8"
                    >
                        {/* Floating stat chips */}
                        <motion.div
                            className="absolute -left-2 top-6 z-20 hidden rounded-xl border border-cyan-200 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow sm:block"
                            animate={!ambientMotionEnabled ? undefined : { y: [0, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <div className="font-semibold text-slate-900">Weekly variance</div>
                            <div>-12.5% discretionary spend</div>
                        </motion.div>
                        <motion.div
                            className="absolute -bottom-4 right-2 z-20 hidden rounded-xl border border-emerald-200 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow sm:block"
                            animate={!ambientMotionEnabled ? undefined : { y: [0, 5, 0] }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                        >
                            <div className="font-semibold text-slate-900">Automation health</div>
                            <div>3 active workflows</div>
                        </motion.div>
                        <LivePreviewCard reduceMotion={reduceMotion || !allowRichMotion} />
                    </motion.div>
                </section>

                {/* Ticker */}
                <section className="border-y border-slate-200 bg-white/80 py-4 backdrop-blur" aria-label="Brand ticker">
                    <AnimatedTicker reduceMotion={reduceMotion || !ambientMotionEnabled} />
                </section>

                {/* Signature interface + InsightOrbit */}
                <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-14 sm:px-10 lg:grid-cols-[1.15fr,0.85fr] lg:px-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.55 }}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                            <Radar className="h-3.5 w-3.5 text-cyan-600" />
                            Signature Interface Layer
                        </div>
                        <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                            Distinct visual identity with operational clarity.
                        </h3>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                            FinleyBook combines a premium control-room look with clear typography and motion cues, so users always know what changed and what to do next.
                        </p>
                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <TrustMetric title="Motion System" value="Adaptive + smooth" allowHover={allowRichMotion} />
                            <TrustMetric title="Interaction Feedback" value="Contextual cues" allowHover={allowRichMotion} />
                            <TrustMetric title="Visual Style" value="Finance-native" allowHover={allowRichMotion} />
                        </div>
                    </motion.div>
                    <InsightOrbit reduceMotion={reduceMotion || !ambientMotionEnabled} />
                </section>

                {/* Features */}
                <section id="features" className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-10 lg:px-16">
                    <SectionHeader
                        eyebrow="Core Capabilities"
                        title="Designed for clarity, speed, and confident decisions."
                        description="Everything is built around one principle: help users make better financial decisions without complexity."
                    />
                    <div className="mt-10 grid gap-6 lg:grid-cols-3">
                        {featureItems.map((item, index) => (
                            <FeatureCard key={item.title} item={item} index={index} allowRichMotion={allowRichMotion} />
                        ))}
                    </div>
                </section>

                {/* How it Works */}
                <section id="how-it-works" className="bg-white py-20">
                    <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16">
                        <SectionHeader
                            eyebrow="How It Works"
                            title="A workflow users can understand in minutes."
                            description="No complex setup. No financial jargon. Just a practical sequence that keeps improving over time."
                        />
                        <div className="relative mt-10 grid gap-6 lg:grid-cols-3">
                            {/* Desktop connector line */}
                            <div className="absolute left-[16.5%] right-[16.5%] top-9 hidden h-px bg-slate-200 lg:block" aria-hidden="true">
                                <motion.div
                                    className="h-full origin-left bg-gradient-to-r from-cyan-400 to-blue-500"
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                />
                            </div>
                            {stepItems.map((step, index) => (
                                <StepCard key={step.title} step={step} index={index} allowRichMotion={allowRichMotion} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section id="testimonials" className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-10 lg:px-16">
                    <SectionHeader
                        eyebrow="Client Feedback"
                        title="Built for people who value professional financial clarity."
                        description="Users adopt FinleyBook because it is easy to start, hard to outgrow, and simple to recommend."
                    />
                    <div className="mt-10 grid gap-6 lg:grid-cols-3">
                        {testimonialItems.map((item, index) => (
                            <TestimonialCard key={item.name} item={item} index={index} allowRichMotion={allowRichMotion} />
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="bg-white py-20">
                    <div className="mx-auto w-full max-w-4xl px-6 sm:px-10">
                        <SectionHeader
                            eyebrow="FAQ"
                            title="Answers before users even need to ask."
                            description="Clear guidance improves onboarding and keeps users confident on day one."
                        />
                        <div className="mt-8 space-y-3">
                            {faqItems.map((faq, index) => {
                                const isOpen = activeFaq === index
                                return (
                                    <motion.div
                                        key={faq.question}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.35, delay: index * 0.05 }}
                                        className={`rounded-xl border bg-slate-50 transition-colors duration-300 ${isOpen ? 'border-cyan-300/60' : 'border-slate-200'}`}
                                    >
                                        <button
                                            onClick={() => setActiveFaq(isOpen ? null : index)}
                                            className="flex w-full items-center justify-between px-5 py-4 text-left"
                                        >
                                            <span className="font-medium text-slate-900">{faq.question}</span>
                                            <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                                                <ChevronDown className="h-4 w-4 text-slate-500" />
                                            </motion.span>
                                        </button>
                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                                    className="overflow-hidden px-5 pb-4 text-sm leading-relaxed text-slate-600"
                                                >
                                                    {faq.answer}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
                    <CtaSection onStart={onStart} onLogin={onLogin} allowRichMotion={allowRichMotion} />
                </section>
            </main>

            <Footer selectedCountry={selectedCountry} onCountryChange={updateCountry} />
        </div>
    )
}

/* ─── Section Header ──────────────────────────────────────── */

function SectionHeader({
    eyebrow,
    title,
    description
}: {
    eyebrow: string
    title: string
    description: string
}) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, amount: 0.3 })

    return (
        <motion.div
            ref={ref}
            className="max-w-3xl"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
        >
            <motion.p variants={itemVariants} className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                {eyebrow}
            </motion.p>
            <motion.h2 variants={itemVariants} className="mt-3 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                {title}
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-3 text-base leading-relaxed text-slate-600">
                {description}
            </motion.p>
        </motion.div>
    )
}

/* ─── Trust Chip ──────────────────────────────────────────── */

function TrustChip({ title, allowHover, delay }: { title: string; allowHover: boolean; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay, ease: [0.34, 1.56, 0.64, 1] }}
            whileHover={allowHover ? { y: -3, scale: 1.04 } : undefined}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm"
        >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            {title}
        </motion.div>
    )
}

/* ─── Trust Metric ────────────────────────────────────────── */

function TrustMetric({ title, value, allowHover }: { title: string; value: string; allowHover: boolean }) {
    return (
        <motion.div
            whileHover={allowHover ? { y: -3, boxShadow: '0 8px 20px -4px rgba(0,0,0,0.08)' } : undefined}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 transition"
        >
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{title}</div>
            <div className="mt-1 text-base font-semibold text-slate-900">{value}</div>
        </motion.div>
    )
}

/* ─── Feature Card ────────────────────────────────────────── */

function FeatureCard({ item, index, allowRichMotion }: { item: FeatureItem; index: number; allowRichMotion: boolean }) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, amount: 0.3 })

    return (
        <motion.article
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            whileHover={allowRichMotion ? { y: -8, boxShadow: '0 20px 40px -8px rgba(0,0,0,0.10)' } : undefined}
            transition={{ duration: 0.55, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            {/* Hover gradient overlay */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.04]`}
            />
            <motion.div
                className="mb-4 inline-flex rounded-xl bg-slate-900 p-2.5"
                whileHover={allowRichMotion ? { scale: 1.12, rotate: [0, -8, 6, 0] } : undefined}
                transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            >
                {item.icon}
            </motion.div>
            <h3 className="mb-2 text-xl font-semibold text-slate-900">{item.title}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{item.description}</p>
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-200">
                <motion.div
                    className={`h-full bg-gradient-to-r ${item.accent}`}
                    initial={{ scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.9, delay: 0.22 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    style={{ originX: 0, willChange: 'transform' }}
                />
            </div>
        </motion.article>
    )
}

/* ─── Step Card ───────────────────────────────────────────── */

function StepCard({ step, index, allowRichMotion }: { step: StepItem; index: number; allowRichMotion: boolean }) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, amount: 0.4 })

    return (
        <motion.article
            ref={ref}
            initial={{ opacity: 0, y: 22 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            whileHover={allowRichMotion ? { y: -6 } : undefined}
            transition={{ duration: 0.55, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6"
        >
            <motion.div
                className="relative mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white"
                initial={{ scale: 0, rotate: -90 }}
                animate={inView ? { scale: 1, rotate: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            >
                {index + 1}
                {/* Pulse ring — GPU: only scale+opacity */}
                {inView && (
                    <motion.span
                        className="absolute inset-0 rounded-full bg-slate-950"
                        initial={{ scale: 1, opacity: 0.4 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.8, delay: 0.35 + index * 0.1, ease: 'easeOut' }}
                        style={{ willChange: 'transform, opacity' }}
                    />
                )}
            </motion.div>
            <h3 className="mb-2 text-xl font-semibold text-slate-900">{step.title}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
        </motion.article>
    )
}

/* ─── Testimonial Card ────────────────────────────────────── */

function TestimonialCard({ item, index, allowRichMotion }: { item: TestimonialItem; index: number; allowRichMotion: boolean }) {
    return (
        <motion.blockquote
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={allowRichMotion ? { y: -7, boxShadow: '0 20px 40px -8px rgba(0,0,0,0.09)' } : undefined}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, delay: index * 0.09 }}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            {/* Decorative quote */}
            <span className="absolute right-4 top-3 select-none text-6xl font-serif leading-none text-slate-100">"</span>
            {/* Stars */}
            <div className="mb-3 flex gap-0.5">
                {Array.from({ length: item.rating }).map((_, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.4 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.15 + index * 0.07 + i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    </motion.span>
                ))}
            </div>
            <p className="relative text-base leading-relaxed text-slate-700">"{item.quote}"</p>
            <footer className="mt-6 border-t border-slate-100 pt-4">
                <div className="font-semibold text-slate-900">{item.name}</div>
                <div className="text-sm text-slate-500">{item.role}</div>
            </footer>
        </motion.blockquote>
    )
}

/* ─── CTA Section ─────────────────────────────────────────── */

function CtaSection({ onStart, onLogin, allowRichMotion }: { onStart: () => void; onLogin: () => void; allowRichMotion: boolean }) {
    const floatParticles = useMemo(() =>
        Array.from({ length: 8 }, (_, i) => ({
            id: i,
            size: 3 + (i % 3) * 2,
            x: 8 + i * 11,
            y: 15 + ((i * 17) % 70),
            dur: 3 + (i % 3) * 1.5,
            delay: i * 0.4
        })), [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-10 text-white shadow-2xl shadow-slate-900/25 sm:px-12"
        >
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-10 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

            {/* Floating particles */}
            {allowRichMotion && floatParticles.map(p => (
                <motion.div
                    key={p.id}
                    className="pointer-events-none absolute rounded-full bg-cyan-400/20"
                    style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                    animate={{ y: [0, -14, 0], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                />
            ))}

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                    <motion.p
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="text-xs uppercase tracking-[0.18em] text-cyan-300"
                    >
                        FinleyBook Ready
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.18 }}
                        className="mt-3 text-3xl font-semibold leading-tight"
                    >
                        Launch a professional personal finance workflow in minutes.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: 0.26 }}
                        className="mt-3 text-slate-300"
                    >
                        Keep the same core actions users already know, with a cleaner experience and better decision support.
                    </motion.p>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
                    className="flex flex-col gap-3 sm:flex-row"
                >
                    <motion.button
                        onClick={onStart}
                        whileHover={allowRichMotion ? { scale: 1.05, y: -2 } : undefined}
                        whileTap={allowRichMotion ? { scale: 0.96 } : undefined}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                        Start free
                        <ArrowRight className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                        onClick={onLogin}
                        whileHover={allowRichMotion ? { scale: 1.03, y: -1 } : undefined}
                        whileTap={allowRichMotion ? { scale: 0.97 } : undefined}
                        className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-200"
                    >
                        Sign in
                    </motion.button>
                </motion.div>
            </div>
        </motion.div>
    )
}

/* ─── Animated Ticker ─────────────────────────────────────── */

function AnimatedTicker({ reduceMotion }: { reduceMotion: boolean }) {
    const entries = useMemo(() => [...tickerItems, ...tickerItems], [])

    return (
        <div className="mx-auto w-full max-w-7xl overflow-hidden px-6 sm:px-10 lg:px-16">
            <motion.div
                className="flex min-w-max items-center gap-3 py-1"
                animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                style={{ willChange: 'transform' }}
            >
                {entries.map((item, index) => (
                    <div
                        key={`${item}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-600"
                    >
                        <Fingerprint className="h-3.5 w-3.5 text-cyan-600" />
                        {item}
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

/* ─── Insight Orbit ───────────────────────────────────────── */

const orbitDots = [
    { angle: 30, ring: 'outer', label: 'Budget' },
    { angle: 145, ring: 'outer', label: 'Goals' },
    { angle: 260, ring: 'outer', label: 'Reports' },
    { angle: 70, ring: 'mid', label: 'AI' },
    { angle: 200, ring: 'mid', label: 'Wealth' },
]

function InsightOrbit({ reduceMotion }: { reduceMotion: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="relative mx-auto flex min-h-[18rem] w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-900 p-6"
        >
            {/* Orbit rings — will-change:transform for GPU compositing */}
            <motion.div
                className="absolute h-56 w-56 rounded-full border border-cyan-400/20"
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                style={{ willChange: 'transform' }}
            >
                <motion.div
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center"
                    animate={reduceMotion ? undefined : { rotate: -360 }}
                    transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                    style={{ willChange: 'transform' }}
                >
                    <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </motion.div>
            </motion.div>

            <motion.div
                className="absolute h-44 w-44 rounded-full border border-sky-300/25"
                animate={reduceMotion ? undefined : { rotate: -360 }}
                transition={{ duration: 17, repeat: Infinity, ease: 'linear' }}
                style={{ willChange: 'transform' }}
            >
                <motion.div
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center"
                    animate={reduceMotion ? undefined : { rotate: 360 }}
                    transition={{ duration: 17, repeat: Infinity, ease: 'linear' }}
                    style={{ willChange: 'transform' }}
                >
                    <div className="h-2.5 w-2.5 rounded-full bg-sky-300 shadow-[0_0_6px_rgba(125,211,252,0.8)]" />
                </motion.div>
            </motion.div>

            <motion.div
                className="absolute h-32 w-32 rounded-full border border-cyan-200/30"
                animate={reduceMotion ? undefined : { scale: [0.95, 1.06, 0.95] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ willChange: 'transform' }}
            />

            {/* Inner glow */}
            <motion.div
                className="absolute h-16 w-16 rounded-full bg-cyan-400/10 blur-xl"
                animate={reduceMotion ? undefined : { scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative z-10 text-center text-white">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.12em] text-cyan-200">
                    <Radar className="h-3.5 w-3.5" />
                    Live Decision Signal
                </div>
                <motion.p
                    className="mt-4 text-3xl font-semibold"
                    animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                    +18%
                </motion.p>
                <p className="mt-1 text-sm text-slate-300">Potential efficiency from guided workflow habits</p>
            </div>
        </motion.div>
    )
}

/* ─── Live Preview Card ───────────────────────────────────── */

function LivePreviewCard({ reduceMotion }: { reduceMotion: boolean }) {
    const activity = [
        { label: 'AI briefing generated', detail: 'Monthly portfolio review completed', time: 'Now' },
        { label: 'Budget guardrail triggered', detail: 'Dining trend moved above weekly cap', time: '3m' },
        { label: 'Goal transfer scheduled', detail: 'Savings automation set for Monday', time: '9m' }
    ]
    const [highlighted, setHighlighted] = useState(0)

    useEffect(() => {
        if (reduceMotion) return
        const timer = setInterval(() => {
            setHighlighted((prev) => (prev + 1) % activity.length)
        }, 2200)
        return () => clearInterval(timer)
    }, [activity.length, reduceMotion])

    return (
        <div className="relative mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10 sm:p-6">
            <div className="rounded-2xl bg-slate-950 p-5 text-white sm:p-6">
                <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.14em] text-cyan-300">Decision Dashboard</p>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                        <motion.span
                            animate={!reduceMotion ? { opacity: [1, 0.3, 1] } : undefined}
                            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <Clock3 className="h-3.5 w-3.5" />
                        </motion.span>
                        Live
                    </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <MetricBox label="Net Position" value="A$144,295" />
                    <MetricBox label="Monthly Burn" value="A$115.50" />
                    <MetricBox label="Focus Score" value="84 / 100" />
                </div>
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-2 text-xs uppercase tracking-[0.12em] text-cyan-200">Trend pulse</div>
                    <PulseLineChart reduceMotion={reduceMotion} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center gap-2 text-xs text-cyan-200">
                            <Target className="h-3.5 w-3.5" />
                            Priority
                        </div>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-white">
                            Lift savings ratio to 20% with one automated transfer.
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center gap-2 text-xs text-cyan-200">
                            <Bot className="h-3.5 w-3.5" />
                            AI Guidance
                        </div>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-white">
                            Reduce entertainment spend by 10% next month.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                {activity.map((item, index) => {
                    const active = highlighted === index || reduceMotion
                    return (
                        <motion.div
                            key={item.label}
                            animate={{
                                borderColor: active ? 'rgb(8 145 178 / 0.55)' : 'rgb(226 232 240 / 1)',
                                backgroundColor: active ? 'rgb(236 254 255)' : 'rgb(248 250 252)'
                            }}
                            transition={{ duration: 0.25 }}
                            className="rounded-xl border px-4 py-3"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                                <span className="text-xs text-slate-500">{item.time}</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600">{item.detail}</p>
                            <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                                    animate={{ width: active ? '100%' : '24%' }}
                                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                                />
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

/* ─── Metric Box ──────────────────────────────────────────── */

function MetricBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-300">{label}</p>
            <p className="mt-1 text-lg font-semibold text-white">{value}</p>
        </div>
    )
}

/* ─── Pulse Line Chart ────────────────────────────────────── */

// Path length ≈ 340px (measured). strokeDashoffset replaces pathLength — GPU-composited.
const PATH_LEN = 340

function PulseLineChart({ reduceMotion }: { reduceMotion: boolean }) {
    // Animate opacity of the line segment instead of pathLength (CPU-bound SVG filter)
    // The dot rides a translateX-only animation (GPU safe)
    const dotX = reduceMotion ? 246 : undefined

    return (
        <svg viewBox="0 0 280 60" className="h-14 w-full" role="img" aria-label="Trend pulse chart">
            <path d="M0 45 L280 45" stroke="rgba(148,163,184,0.28)" strokeWidth="1" />

            {/* Static path — always fully drawn */}
            <path
                d="M10 40 C 50 18, 80 30, 120 22 C 145 18, 165 38, 205 26 C 230 18, 245 16, 270 12"
                fill="none"
                stroke="rgb(56 189 248)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={PATH_LEN}
                strokeDashoffset="0"
            />

            {/* Animated glow sweep — opacity only (GPU compositor) */}
            {!reduceMotion && (
                <motion.path
                    d="M10 40 C 50 18, 80 30, 120 22 C 145 18, 165 38, 205 26 C 230 18, 245 16, 270 12"
                    fill="none"
                    stroke="rgb(186 230 253)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={PATH_LEN}
                    strokeDashoffset="0"
                    animate={{ opacity: [0.15, 0.55, 0.15] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ willChange: 'opacity' }}
                />
            )}

            {/* Dot — translateX only (GPU safe) */}
            <motion.circle
                cy="12"
                r="4"
                fill="rgb(56 189 248)"
                cx={dotX ?? 40}
                animate={reduceMotion ? undefined : { cx: [40, 246, 40] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ willChange: 'transform' }}
            />
            <motion.circle
                cy="12"
                r="8"
                fill="rgb(56 189 248)"
                opacity={0.18}
                cx={dotX ?? 40}
                animate={reduceMotion ? undefined : { cx: [40, 246, 40] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ willChange: 'transform' }}
            />
        </svg>
    )
}
