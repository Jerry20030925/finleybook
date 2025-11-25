'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function PageLoader() {
    return (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: 1,
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                className="relative w-24 h-24"
            >
                <Image
                    src="/icon.png"
                    alt="Loading..."
                    fill
                    className="object-contain"
                    priority
                />
            </motion.div>
        </div>
    )
}
