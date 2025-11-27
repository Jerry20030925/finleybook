'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface IdentityStepProps {
    onSelect: (identity: string) => void
}

const IDENTITIES = [
    { id: 'survival', icon: '😩', title: '月光族生存模式', desc: '工资刚到账就没了' },
    { id: 'shopaholic', icon: '🤔', title: '这就去买买买', desc: '控制不住剁手' },
    { id: 'saver', icon: '🎯', title: '正在存钱买大件', desc: '为了梦想而奋斗' },
]

export default function IdentityStep({ onSelect }: IdentityStepProps) {
    return (
        <div className="text-center">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gray-900 mb-8"
            >
                现在的你，最像哪一种状态？
            </motion.h2>

            <div className="grid gap-4">
                {IDENTITIES.map((item, index) => (
                    <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(item.id)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-500 hover:shadow-md transition-all text-left flex items-center gap-4 group"
                    >
                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                            {item.icon}
                        </span>
                        <div>
                            <h3 className="font-bold text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    )
}
