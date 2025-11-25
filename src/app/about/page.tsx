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
      title_prefix: '让理财变得',
      title_highlight: '简单智能',
      description: 'FinleyBook 创立于2023年，我们相信每个人都应该拥有管理财务的能力。通过创新的技术和贴心的设计，我们致力于让个人财务管理变得简单、智能且有趣。',
      cta: '开始体验'
    },
    stats: [
      { label: '注册用户', value: '10万+' },
      { label: '管理资产', value: '50亿+' },
      { label: '节省费用', value: '1000万+' },
      { label: '用户满意度', value: '98%' }
    ],
    mission: {
      title: '我们的使命',
      description: '通过技术创新和人性化设计，让每个人都能够轻松掌控自己的财务状况，实现财务自由和生活目标。',
      features: [
        {
          icon: LightBulbIcon,
          title: '智能创新',
          description: '运用人工智能技术，为用户提供个性化的财务洞察和建议，让理财变得更加智能和高效。'
        },
        {
          icon: ShieldCheckIcon,
          title: '安全可靠',
          description: '采用银行级别的安全标准，确保用户财务数据的绝对安全，让您放心使用。'
        },
        {
          icon: ChartBarIcon,
          title: '专业分析',
          description: '提供全面的财务分析报告，帮助用户深入了解自己的财务状况，制定更好的理财策略。'
        },
        {
          icon: HeartIcon,
          title: '用户至上',
          description: '始终以用户需求为核心，持续优化产品体验，让每个用户都能享受到贴心的服务。'
        }
      ]
    },
    team: {
      title: '核心团队',
      description: '我们是一支充满激情的团队，来自各大知名互联网公司，致力于打造最好的财务管理产品。',
      members: [
        {
          name: '张明',
          role: '创始人 & CEO',
          description: '前阿里巴巴资深技术专家，拥有15年金融科技行业经验，致力于用技术改变理财方式。',
          image: 'https://ui-avatars.com/api/?name=张明&background=0ea5e9&color=fff&size=200'
        },
        {
          name: '李欣',
          role: '产品总监',
          description: '前腾讯产品经理，专注于用户体验设计，相信好的产品能够真正改善用户的生活。',
          image: 'https://ui-avatars.com/api/?name=李欣&background=10b981&color=fff&size=200'
        },
        {
          name: '王涛',
          role: '技术总监',
          description: '全栈技术专家，曾在多家知名互联网公司担任技术架构师，专注于构建稳定可靠的系统。',
          image: 'https://ui-avatars.com/api/?name=王涛&background=8b5cf6&color=fff&size=200'
        },
        {
          name: '赵雅',
          role: '运营总监',
          description: '数字营销专家，拥有丰富的用户运营经验，致力于为用户提供更好的服务体验。',
          image: 'https://ui-avatars.com/api/?name=赵雅&background=f59e0b&color=fff&size=200'
        }
      ]
    },
    values: {
      title: '我们的价值观',
      items: [
        {
          icon: GlobeAsiaAustraliaIcon,
          title: '开放透明',
          description: '我们相信透明度是建立信任的基石，所有的费用、算法和隐私政策都清晰明了。'
        },
        {
          icon: UserGroupIcon,
          title: '用户第一',
          description: '每一个决策都以用户利益为出发点，我们的成功来自于用户的成功。'
        },
        {
          icon: LightBulbIcon,
          title: '持续创新',
          description: '不断探索新技术和新方法，让财务管理变得更加智能和便捷。'
        }
      ]
    },
    cta_section: {
      title: '开启您的财务管理之旅',
      description: '加入我们，让理财变得简单而有趣',
      start: '立即开始',
      learn_more: '了解更多'
    }
  },
  en: {
    hero: {
      title_prefix: 'Making Finance',
      title_highlight: 'Simple & Smart',
      description: 'Founded in 2023, FinleyBook believes everyone should have the ability to manage their finances. Through innovative technology and thoughtful design, we are dedicated to making personal financial management simple, smart, and fun.',
      cta: 'Get Started'
    },
    stats: [
      { label: 'Registered Users', value: '100k+' },
      { label: 'Assets Managed', value: '$5B+' },
      { label: 'Fees Saved', value: '$10M+' },
      { label: 'User Satisfaction', value: '98%' }
    ],
    mission: {
      title: 'Our Mission',
      description: 'Through technological innovation and human-centric design, we empower everyone to easily control their financial situation and achieve financial freedom and life goals.',
      features: [
        {
          icon: LightBulbIcon,
          title: 'Smart Innovation',
          description: 'Using AI technology to provide personalized financial insights and suggestions, making financial management smarter and more efficient.'
        },
        {
          icon: ShieldCheckIcon,
          title: 'Secure & Reliable',
          description: 'Adopting bank-level security standards to ensure the absolute safety of user financial data, giving you peace of mind.'
        },
        {
          icon: ChartBarIcon,
          title: 'Professional Analysis',
          description: 'Providing comprehensive financial analysis reports to help users deeply understand their financial situation and formulate better strategies.'
        },
        {
          icon: HeartIcon,
          title: 'User First',
          description: 'Always centering on user needs, continuously optimizing product experience, so every user can enjoy thoughtful service.'
        }
      ]
    },
    team: {
      title: 'Core Team',
      description: 'We are a passionate team from major internet companies, dedicated to building the best financial management product.',
      members: [
        {
          name: 'Ming Zhang',
          role: 'Founder & CEO',
          description: 'Former Senior Technical Expert at Alibaba with 15 years of fintech experience, dedicated to changing the way people manage money with technology.',
          image: 'https://ui-avatars.com/api/?name=Ming+Zhang&background=0ea5e9&color=fff&size=200'
        },
        {
          name: 'Xin Li',
          role: 'Product Director',
          description: 'Former Product Manager at Tencent, focused on user experience design, believing that good products can truly improve users\' lives.',
          image: 'https://ui-avatars.com/api/?name=Xin+Li&background=10b981&color=fff&size=200'
        },
        {
          name: 'Tao Wang',
          role: 'Technical Director',
          description: 'Full-stack technical expert, former technical architect at multiple well-known internet companies, focused on building stable and reliable systems.',
          image: 'https://ui-avatars.com/api/?name=Tao+Wang&background=8b5cf6&color=fff&size=200'
        },
        {
          name: 'Ya Zhao',
          role: 'Operations Director',
          description: 'Digital marketing expert with extensive user operations experience, dedicated to providing better service experiences for users.',
          image: 'https://ui-avatars.com/api/?name=Ya+Zhao&background=f59e0b&color=fff&size=200'
        }
      ]
    },
    values: {
      title: 'Our Values',
      items: [
        {
          icon: GlobeAsiaAustraliaIcon,
          title: 'Open & Transparent',
          description: 'We believe transparency is the cornerstone of trust. All fees, algorithms, and privacy policies are clear and understandable.'
        },
        {
          icon: UserGroupIcon,
          title: 'User First',
          description: 'Every decision starts with user interests. Our success comes from the success of our users.'
        },
        {
          icon: LightBulbIcon,
          title: 'Continuous Innovation',
          description: 'Constantly exploring new technologies and methods to make financial management smarter and more convenient.'
        }
      ]
    },
    cta_section: {
      title: 'Start Your Financial Journey',
      description: 'Join us and make financial management simple and fun',
      start: 'Start Now',
      learn_more: 'Learn More'
    }
  }
}

export default function About() {
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