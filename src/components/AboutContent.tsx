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
            title_prefix: '让您的梦想',
            title_highlight: '落地生根',
            description: 'FinleyBook 不仅仅是一个工具，它是您2025年的显化引擎。我们将抽象的愿景板转化为具体的每日任务，让梦想不再是空想。',
            cta: '开始显化'
        },
        stats: [
            { label: '愿景板生成', value: '50万+' },
            { label: '每日任务完成', value: '200万+' },
            { label: '梦想达成', value: '1万+' },
            { label: '用户好评', value: '4.9/5' }
        ],
        mission: {
            title: '我们的使命',
            description: '在这个充满噪音的世界，我们帮助您找回内心的声音。通过AI技术，我们将“吸引力法则”变得结构化、可执行、可追踪。',
            features: [
                {
                    icon: LightBulbIcon,
                    title: 'AI 愿景拆解',
                    description: '上传您的梦想图片，AI 自动将其拆解为第一周需要执行的3个关键行动。'
                },
                {
                    icon: ShieldCheckIcon,
                    title: '每日显化追踪',
                    description: '不再是年底的遗憾，而是每天的一小步。我们追踪您的每一个微小进步。'
                },
                {
                    icon: ChartBarIcon,
                    title: '能量数据分析',
                    description: '分析您的行动模式，找出阻碍您显化的潜在障碍。'
                },
                {
                    icon: HeartIcon,
                    title: '梦想社区',
                    description: '连接志同道合的追梦人，共享显化能量。'
                }
            ]
        },
        team: {
            title: '造梦团队',
            description: '我们是一群相信“显化科技”的工程师、心理学家和艺术家。',
            members: [
                {
                    name: '张明',
                    role: '创始人 & 首席显化官',
                    description: '前阿里巴巴技术专家，致力于将古老的智慧与现代AI技术相结合。',
                    image: 'https://ui-avatars.com/api/?name=张明&background=0ea5e9&color=fff&size=200'
                },
                {
                    name: '李欣',
                    role: '产品设计负责人',
                    description: '心理学硕士，专注于如何通过视觉刺激激发潜意识的行动力。',
                    image: 'https://ui-avatars.com/api/?name=李欣&background=10b981&color=fff&size=200'
                },
                {
                    name: '王涛',
                    role: 'AI算法专家',
                    description: '构建了核心的“图像转任务”引擎，让每一张愿景图都能说话。',
                    image: 'https://ui-avatars.com/api/?name=王涛&background=8b5cf6&color=fff&size=200'
                },
                {
                    name: '赵雅',
                    role: '社区运营',
                    description: '致力于打造温暖、支持性的追梦社区环境。',
                    image: 'https://ui-avatars.com/api/?name=赵雅&background=f59e0b&color=fff&size=200'
                }
            ]
        },
        values: {
            title: '核心理念',
            items: [
                {
                    icon: GlobeAsiaAustraliaIcon,
                    title: '知行合一',
                    description: '真正的显化不在于想，而在于做。我们是行动派的信仰者。'
                },
                {
                    icon: UserGroupIcon,
                    title: '长期主义',
                    description: '不追求一夜暴富，相信复利的力量，无论是财富还是个人成长。'
                },
                {
                    icon: LightBulbIcon,
                    title: '科技赋能',
                    description: '用最前沿的AI技术，服务最古老的人类梦想。'
                }
            ]
        },
        cta_section: {
            title: '2025，是您显化的一年',
            description: '别再等待了。现在就上传您的第一张愿景图。',
            start: '立即开始',
            learn_more: '阅读显化指南'
        }
    },
    en: {
        hero: {
            title_prefix: 'Turn Dreams Into',
            title_highlight: 'Daily Missions',
            description: 'FinleyBook is not just a tool; it is your Manifestation Engine for 2025. We transform abstract vision boards into concrete daily missions, making dreams actionable.',
            cta: 'Start Manifesting'
        },
        stats: [
            { label: 'Vision Boards Created', value: '500k+' },
            { label: 'Daily Missions Done', value: '2M+' },
            { label: 'Dreams Achieved', value: '10k+' },
            { label: 'User Rating', value: '4.9/5' }
        ],
        mission: {
            title: 'Our Mission',
            description: 'In a noisy world, we help you find your inner voice. Using AI, we structure the "Law of Attraction" into an actionable, trackable system.',
            features: [
                {
                    icon: LightBulbIcon,
                    title: 'AI Vision Breakdown',
                    description: 'Upload your dream image, and AI automatically breaks it down into 3 key actions for the first week.'
                },
                {
                    icon: ShieldCheckIcon,
                    title: 'Daily Manifestation Tracking',
                    description: 'Not just a year-end regret, but a daily step forward. We track every micro-progress you make.'
                },
                {
                    icon: ChartBarIcon,
                    title: 'Energy Analytics',
                    description: 'Analyze your action patterns to find potential blocks hindering your manifestation.'
                },
                {
                    icon: HeartIcon,
                    title: 'Dream Community',
                    description: 'Connect with like-minded dreamers and share manifestation energy.'
                }
            ]
        },
        team: {
            title: 'The Dream Team',
            description: 'We are a group of engineers, psychologists, and artists who believe in "Manifestation Tech".',
            members: [
                {
                    name: 'Ming Zhang',
                    role: 'Founder & Chief Manifestation Officer',
                    description: 'Former Tech Lead at Alibaba, dedicated to combining ancient wisdom with modern AI.',
                    image: 'https://ui-avatars.com/api/?name=Ming+Zhang&background=0ea5e9&color=fff&size=200'
                },
                {
                    name: 'Xin Li',
                    role: 'Head of Product Design',
                    description: 'Psychology Master, focused on stimulating subconscious action through visual cues.',
                    image: 'https://ui-avatars.com/api/?name=Xin+Li&background=10b981&color=fff&size=200'
                },
                {
                    name: 'Tao Wang',
                    role: 'AI Algorithm Expert',
                    description: 'Built the core "Image-to-Task" engine, letting every vision board image speak.',
                    image: 'https://ui-avatars.com/api/?name=Tao+Wang&background=8b5cf6&color=fff&size=200'
                },
                {
                    name: 'Ya Zhao',
                    role: 'Community Lead',
                    description: 'Dedicated to building a warm, supportive environment for dreamers.',
                    image: 'https://ui-avatars.com/api/?name=Ya+Zhao&background=f59e0b&color=fff&size=200'
                }
            ]
        },
        values: {
            title: 'Core Philosophy',
            items: [
                {
                    icon: GlobeAsiaAustraliaIcon,
                    title: 'Action Oriented',
                    description: 'Real manifestation is not about thinking, but doing. We believe in action.'
                },
                {
                    icon: UserGroupIcon,
                    title: 'Long-termism',
                    description: 'We don\'t chase quick riches. We believe in the power of compounding, for wealth and growth.'
                },
                {
                    icon: LightBulbIcon,
                    title: 'Tech Empowered',
                    description: 'Using cutting-edge AI to serve the oldest human dreams.'
                }
            ]
        },
        cta_section: {
            title: '2025 Is Your Year',
            description: 'Stop waiting. Upload your first vision board image now.',
            start: 'Start Now',
            learn_more: 'Read Guide'
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
                            href="/blog"
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
