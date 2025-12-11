'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Star, TrendingUp, Copy } from 'lucide-react'
import { BlogPost } from '@/lib/blogService'

interface SuccessStoryCardProps {
    story: BlogPost
}

export default function SuccessStoryCard({ story }: SuccessStoryCardProps) {
    if (!story.isSuccessStory || !story.successMetrics) return null

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="relative h-48">
                <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                    <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                        <Star size={12} fill="currentColor" />
                        Success Story
                    </span>
                </div>
            </div>

            <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{story.title}</h3>

                {/* Metrics Highlight */}
                <div className="flex items-center gap-4 my-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                    <div className="p-2 bg-white rounded-md shadow-sm text-indigo-600">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-indigo-600 font-medium uppercase">{story.successMetrics.metric}</p>
                        <p className="text-xl font-bold text-gray-900">{story.successMetrics.value}</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-xs text-gray-400">Time</p>
                        <p className="text-sm font-semibold text-gray-600">{story.successMetrics.duration}</p>
                    </div>
                </div>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{story.excerpt}</p>

                <div className="flex gap-2">
                    <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        Read Story
                    </button>
                    <button className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-2">
                        <Copy size={14} />
                        Copy Strategy
                    </button>
                </div>
            </div>
        </div>
    )
}
