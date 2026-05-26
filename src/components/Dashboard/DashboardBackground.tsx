import { motion } from 'framer-motion'
import { memo } from 'react'
import { useExperience } from '@/components/ExperienceProvider'

const DashboardBackground = memo(function DashboardBackground() {
    const { allowRichMotion } = useExperience()

    if (!allowRichMotion) {
        return (
            <>
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-200/25 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[10%] left-[20%] w-[45%] h-[45%] bg-sky-200/15 rounded-full blur-[110px] pointer-events-none" />
            </>
        )
    }

    return (
        <>
            <motion.div
                className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-200/30 rounded-full blur-[120px] pointer-events-none will-change-transform"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, 50, 0],
                    y: [0, 30, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
                className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-indigo-200/25 rounded-full blur-[100px] pointer-events-none will-change-transform"
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.15, 0.3, 0.15],
                    x: [0, -40, 0],
                    y: [0, 60, 0]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 2 }}
            />
            <motion.div
                className="absolute bottom-[10%] left-[20%] w-[45%] h-[45%] bg-sky-200/20 rounded-full blur-[110px] pointer-events-none will-change-transform"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.25, 0.1],
                    x: [0, 30, 0],
                    y: [0, -50, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 4 }}
            />
        </>
    )
})

export default DashboardBackground
