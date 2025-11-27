'use client'

import { useState } from 'react'
import { Download, Share2 } from 'lucide-react'

// Note: In a real app, we would use html2canvas or similar to generate an actual image.
// For this MVP, we'll create a styled HTML card that looks like an image.

export default function SavingsReportCard({ savedAmount = 125, beatPercentage = 85 }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">您的省钱战报</h3>

            {/* The "Image" Area */}
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white overflow-hidden mb-4 aspect-[4/5] flex flex-col justify-between shadow-lg">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>

                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-lg">F</div>
                        <span className="font-medium tracking-wide opacity-80">FinleyBook</span>
                    </div>

                    <h4 className="text-xl font-light opacity-90 mb-1">本月找回隐形订阅费</h4>
                    <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        ${savedAmount}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
                        <p className="text-sm opacity-80 mb-1">击败了全国</p>
                        <p className="text-2xl font-bold">{beatPercentage}% <span className="text-sm font-normal opacity-60">的用户</span></p>
                    </div>

                    <div className="flex items-center justify-between text-xs opacity-60 border-t border-white/10 pt-4">
                        <span>扫码和我一起查漏补缺</span>
                        <span>送你 30 天 VIP</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                    <Download size={16} />
                    保存图片
                </button>
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                    <Share2 size={16} />
                    分享战报
                </button>
            </div>
        </div>
    )
}
