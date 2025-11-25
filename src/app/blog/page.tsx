'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import StructuredData from '@/components/StructuredData'
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  UserIcon,
  ArrowRightIcon,
  TagIcon
} from '@heroicons/react/24/outline'


const blogPosts = [
  {
    id: 'personal-budget-mastery',
    title: '个人预算管理完全指南：从入门到精通',
    excerpt: '学习如何制定有效的个人预算，掌控您的财务生活。本文将介绍50/30/20规则、零基预算法等实用方法。',
    author: '张明',
    publishDate: '2024年11月20日',
    readTime: '8分钟',
    category: '预算规划',
    tags: ['预算管理', '个人理财', '财务规划'],
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 'investment-basics-2024',
    title: '2024年投资新手指南：稳健投资策略解析',
    excerpt: '投资市场瞬息万变，但基本原则不变。了解如何在2024年进行稳健投资，分散风险，实现财富增长。',
    author: '李欣',
    publishDate: '2024年11月18日',
    readTime: '12分钟',
    category: '投资策略',
    tags: ['投资入门', '风险管理', '资产配置'],
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 'emergency-fund-guide',
    title: '应急基金建立指南：为生活意外做好准备',
    excerpt: '应急基金是财务安全的基石。学习如何确定合适的金额、选择存放方式，确保在突发情况下有足够的资金支持。',
    author: '王涛',
    publishDate: '2024年11月15日',
    readTime: '6分钟',
    category: '理财知识',
    tags: ['应急基金', '风险防范', '财务安全'],
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 'debt-management-strategies',
    title: '债务管理策略：雪球法 vs 雪崩法',
    excerpt: '有效管理债务是财务健康的关键。比较两种主流的债务偿还策略，找到最适合您的方法。',
    author: '赵雅',
    publishDate: '2024年11月12日',
    readTime: '10分钟',
    category: '债务管理',
    tags: ['债务偿还', '信用卡', '财务策略'],
    image: 'https://images.unsplash.com/photo-1554224154-26032fbc4d0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 'retirement-planning-early',
    title: '30岁开始养老规划：时间就是金钱的最佳证明',
    excerpt: '养老规划越早开始越好。了解复利的威力，学习如何在30岁就开始为退休做准备，确保未来的财务安全。',
    author: '张明',
    publishDate: '2024年11月10日',
    readTime: '15分钟',
    category: '养老规划',
    tags: ['养老金', '复利', '长期投资'],
    image: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 'fintech-trends-2024',
    title: '金融科技趋势：AI如何改变个人财务管理',
    excerpt: '探索人工智能在个人财务管理中的应用，了解智能预算、自动投资和财务分析如何让理财变得更简单。',
    author: '李欣',
    publishDate: '2024年11月8日',
    readTime: '9分钟',
    category: '金融科技',
    tags: ['AI理财', '智能投顾', '科技创新'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: false
  }
]

const categories = [
  '全部',
  '预算规划',
  '投资策略',
  '理财知识',
  '债务管理',
  '养老规划',
  '金融科技'
]

export default function Blog() {
  const featuredPosts = blogPosts.filter(post => post.featured)
  const regularPosts = blogPosts.filter(post => !post.featured)

  return (
    <>
      <StructuredData type="blog" />
      <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              FinleyBook 财务
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                知识库
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              获取最新的财务管理技巧、投资策略和理财知识，
              让专业的洞察帮助您做出更明智的财务决策。
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {categories.map((category, index) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    index === 0
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            精选文章
          </motion.h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {featuredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/blog/${post.id}`}>
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          精选
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <CalendarDaysIcon className="w-4 h-4" />
                          {post.publishDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {post.readTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-4 h-4" />
                          {post.author}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {post.category}
                        </span>
                        <ArrowRightIcon className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Regular Posts */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            最新文章
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <motion.article
                key={post.id}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/blog/${post.id}`}>
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <CalendarDaysIcon className="w-3 h-3" />
                        {post.publishDate}
                        <span>•</span>
                        <ClockIcon className="w-3 h-3" />
                        {post.readTime}
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                          {post.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {post.author}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            订阅我们的财务洞察
          </motion.h2>
          
          <motion.p 
            className="text-xl text-blue-100 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            每周获取最新的财务管理技巧和市场洞察
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <input
              type="email"
              placeholder="输入您的邮箱地址"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              订阅
            </button>
          </motion.div>
        </div>
      </section>
      </div>
    </>
  )
}