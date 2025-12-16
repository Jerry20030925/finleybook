'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    UserGroupIcon,
    LightBulbIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    HeartIcon,
    GlobeAsiaAustraliaIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/components/LanguageProvider'

const translations = {
    zh: {
        hero: {
            title_prefix: '让您的财富',
            title_highlight: '因AI而增值',
            description: 'FinleyBook 不仅仅是一个记账工具，它是您2025年的智能财富控制中心。我们将繁琐的财务数据转化为清晰的行动指南，让每一分钱都为您工作。',
            cta: '开启财富之旅'
        },
        stats: [
            { label: '资产追踪总额', value: '$500M+' },
            { label: '节省开支', value: '$2M+' },
            { label: '返现发放', value: '$500k+' },
            { label: '用户好评', value: '4.9/5' }
        ],
        mission: {
            title: '我们的使命',
            description: '在这个充满噪音的金融世界，我们致力于为您提供清晰、客观、个性化的财富洞察。通过AI技术，我们将“财务自由”变得结构化、可执行、可追踪。',
            features: [
                {
                    icon: LightBulbIcon,
                    title: 'AI 财务诊断',
                    description: '不仅是记录，更是分析。AI 诊断您的消费习惯，自动发现省钱机会和投资漏洞。'
                },
                {
                    icon: ShieldCheckIcon,
                    title: '银行级安全',
                    description: '您的数据安全是我们的生命线。我们采用 SOC2 标准和 256位加密，确保资产信息万无一失。'
                },
                {
                    icon: ChartBarIcon,
                    title: '现金流预测',
                    description: '不仅仅看过去，更要看未来。只需一键，即可生成未来资产趋势图。'
                },
                {
                    icon: HeartIcon,
                    title: '财富社区',
                    description: '加入那些认真对待财富的人。分享投资心得，获取真实的市场洞察。'
                }
            ]
        },
        team: {
            title: '核心团队',
            description: '我们是一群来自金融科技、网络安全和AI领域的专家。',
            members: [
                {
                    name: '张明',
                    role: '创始人 & CEO',
                    description: '前阿里巴巴金融科技专家，致力于用技术降低财富管理的门槛。',
                    image: 'https://ui-avatars.com/api/?name=张明&background=0ea5e9&color=fff&size=200'
                },
                {
                    name: '李欣',
                    role: '首席产品官',
                    description: '拥有CFA认证，专注于打造既专业又易用的金融产品体验。',
                    image: 'https://ui-avatars.com/api/?name=李欣&background=10b981&color=fff&size=200'
                },
                {
                    name: '王涛',
                    role: '首席技术官',
                    description: '负责构建我们安全、高频的金融数据处理引擎。',
                    image: 'https://ui-avatars.com/api/?name=王涛&background=8b5cf6&color=fff&size=200'
                },
                {
                    name: '赵雅',
                    role: '用户成功总监',
                    description: '确保每一位用户都能通过我们的工具实现真正的财富增长。',
                    image: 'https://ui-avatars.com/api/?name=赵雅&background=f59e0b&color=fff&size=200'
                }
            ]
        },
        values: {
            title: '核心价值观',
            items: [
                {
                    icon: GlobeAsiaAustraliaIcon,
                    title: '数据驱动',
                    description: '我们相信数字不说谎。在此基础上做出的决策，才是最理性的。'
                },
                {
                    icon: UserGroupIcon,
                    title: '长期主义',
                    description: '我们不追求短期博弈，专注于为您创造长期的复利价值。'
                },
                {
                    icon: LightBulbIcon,
                    title: '技术普惠',
                    description: '让每个人都能享受到私人银行级别的财富管理服务。'
                }
            ]
        },
        cta_section: {
            title: '您的财富，值得更好的管理',
            description: '别再让钱在不知不觉中流失。现在就开始智能化管理。',
            start: '免费开始',
            learn_more: '了解功能'
        }
    },
    en: {
        hero: {
            title_prefix: 'Empower Your Wealth',
            title_highlight: 'With AI Intelligence',
            description: 'FinleyBook is not just a tool; it is your intelligent Wealth Command Center for 2025. We transform complex financial data into clear, actionable daily insights.',
            cta: 'Start Growing Wealth'
        },
        stats: [
            { label: 'Assets Tracked', value: '$500M+' },
            { label: 'Money Saved', value: '$2M+' },
            { label: 'Cashback Paid', value: '$500k+' },
            { label: 'User Rating', value: '4.9/5' }
        ],
        mission: {
            title: 'Our Mission',
            description: 'In a noisy financial world, we provide clarity. Using AI, we structure "Financial Freedom" into an actionable, trackable system for everyone.',
            features: [
                {
                    icon: LightBulbIcon,
                    title: 'AI Financial Diagnostics',
                    description: 'More than just tracking. AI analyzes your habits to automatically find savings and investment gaps.'
                },
                {
                    icon: ShieldCheckIcon,
                    title: 'Bank-Grade Security',
                    description: 'We treat your data like our own. SOC2 compliant standards and 256-bit encryption keep your assets safe.'
                },
                {
                    icon: ChartBarIcon,
                    title: 'Cashflow Forecasting',
                    description: 'Don\'t just look back. See your financial future with our predictive trend analysis engine.'
                },
                {
                    icon: HeartIcon,
                    title: 'Wealth Community',
                    description: 'Connect with serious wealth builders. Share strategies and get real market insights.'
                }
            ]
        },
        team: {
            title: 'Leadership Team',
            description: 'We are experts in Fintech, Cybersecurity, and AI, dedicated to your financial success.',
            members: [
                {
                    name: 'Ming Zhang',
                    role: 'Founder & CEO',
                    description: 'Former Fintech Lead at Alibaba, dedicated to democratizing wealth management.',
                    image: 'https://ui-avatars.com/api/?name=Ming+Zhang&background=0ea5e9&color=fff&size=200'
                },
                {
                    name: 'Xin Li',
                    role: 'CPO',
                    description: 'CFA Charterholder, focused on building professional yet accessible financial products.',
                    image: 'https://ui-avatars.com/api/?name=Xin+Li&background=10b981&color=fff&size=200'
                },
                {
                    name: 'Tao Wang',
                    role: 'CTO',
                    description: 'Architecting our high-frequency, secure financial data processing engine.',
                    image: 'https://ui-avatars.com/api/?name=Tao+Wang&background=8b5cf6&color=fff&size=200'
                },
                {
                    name: 'Ya Zhao',
                    role: 'Head of Customer Success',
                    description: 'Ensuring every user achieves tangible wealth growth with our tools.',
                    image: 'https://ui-avatars.com/api/?name=Ya+Zhao&background=f59e0b&color=fff&size=200'
                }
            ]
        },
        values: {
            title: 'Core Values',
            items: [
                {
                    icon: GlobeAsiaAustraliaIcon,
                    title: 'Data First',
                    description: 'Numbers don\'t lie. We believe rational decisions come from accurate data.'
                },
                {
                    icon: UserGroupIcon,
                    title: 'Long-termism',
                    description: 'We ignore short-term noise and focus on creating compounding value for you.'
                },
                {
                    icon: LightBulbIcon,
                    title: 'Democratizing Finance',
                    description: 'Bringing Private Banking level services to everyone through technology.'
                }
            ]
        },
        cta_section: {
            title: 'Your Wealth Deserves Better',
            description: 'Stop leaks in your cash flow. Start intelligent management today.',
            start: 'Start for Free',
            learn_more: 'View Features'
        }
    }
}

export default function AboutContent() {
    const { language } = useLanguage()
    const t = translations[language]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <motion.h1
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {t.hero.title_prefix}{' '}
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {t.hero.title_highlight}
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {t.hero.description}
                        </motion.p>

                        <motion.div
                            className="flex justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <Link
                                href="/dashboard"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                            >
                                {t.hero.cta}
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {t.stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-gray-600 font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.h2
                            className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            {t.mission.title}
                        </motion.h2>
                        <motion.p
                            className="text-xl text-gray-600 max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            {t.mission.description}
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {t.mission.features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -4 }}
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.h2
                            className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            {t.team.title}
                        </motion.h2>
                        <motion.p
                            className="text-xl text-gray-600 max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            {t.team.description}
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {t.team.members.map((member, index) => (
                            <motion.div
                                key={member.name}
                                className="text-center group"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="relative mb-6">
                                    <motion.img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-32 h-32 rounded-full mx-auto shadow-lg"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                    {member.name}
                                </h3>
                                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {member.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.h2
                            className="text-3xl md:text-4xl font-bold mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            {t.values.title}
                        </motion.h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {t.values.items.map((item, index) => (
                            <motion.div
                                key={item.title}
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <item.icon className="w-12 h-12 mx-auto mb-4 text-white" />
                                <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                                <p className="text-blue-100 leading-relaxed">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <motion.h2
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        {t.cta_section.title}
                    </motion.h2>

                    <motion.p
                        className="text-xl text-gray-600 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        {t.cta_section.description}
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        <Link
                            href="/dashboard"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                        >
                            {t.cta_section.start}
                        </Link>
                        <Link
                            href="/features/wealth-tracker"
                            className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                        >
                            {t.cta_section.learn_more}
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
