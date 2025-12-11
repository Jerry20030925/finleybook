'use client'

import Link from 'next/link'
import Image from 'next/image'
import Breadcrumbs from '@/components/Breadcrumbs'
import { motion } from 'framer-motion'
import StructuredData from '@/components/StructuredData'
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  ArrowRightIcon,
  TagIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import toast from 'react-hot-toast'


import { blogPosts } from '@/lib/blogData'

const categories = ['All', 'Manifestation', 'Tips', 'Finance']

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)

  // Filter posts based on search query
  const filteredAllPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const featuredPosts = filteredAllPosts.filter(post => post.featured)
  const regularPosts = filteredAllPosts.filter(post => !post.featured)

  const handleSubscribe = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubscribing(true)
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        toast.success('Successfully subscribed!')
        setEmail('')
      } else {
        const data = await response.json()
        throw new Error(data.message || 'Subscription failed')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <>
      <StructuredData type="blog" />
      <StructuredData
        type="breadcrumbs"
        data={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' }
        ]}
      />
      <div className="min-h-screen bg-gray-50">

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                FinleyBook
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ml-2">
                  Manifestation Hub
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Insights on merging Law of Attraction with disciplined execution.
                Turn digital dreams into physical reality.
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="max-w-2xl mx-auto relative mb-8"
              >
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-6 w-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles (e.g., 'manifestation', 'budget', 'AI')..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg text-gray-900 bg-white"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.h2
                className="text-3xl font-bold text-gray-900 mb-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                Featured Insights
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
                      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                        <div className="relative h-64 overflow-hidden shrink-0">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Featured
                            </span>
                          </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <CalendarDaysIcon className="w-4 h-4" />
                              {post.publishDate}
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {post.readTime}
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                            {post.title}
                          </h3>

                          <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between mt-auto">
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                              {post.category}
                            </span>
                            <ArrowRightIcon className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )}

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
              {searchQuery ? 'Search Results' : 'Latest Articles'}
            </motion.h2>

            {regularPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No articles found matching "{searchQuery}".</p>
              </div>
            )}
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
              Subscribe to Financial Insights
            </motion.h2>

            <motion.p
              className="text-xl text-blue-100 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Get weekly wealth management tips, market analysis, and manifestation strategies directly to your inbox.
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
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubscribe()
                  }
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
              />
              <button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}