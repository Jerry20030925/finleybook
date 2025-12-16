import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface TouchableScaleProps {
    children: ReactNode
    onClick?: () => void
    className?: string
    scale?: number
}

export default function TouchableScale({ children, onClick, className = "", scale = 0.96 }: TouchableScaleProps) {
    return (
        <motion.div
            whileTap={{ scale: scale }}
            onClick={onClick}
            className={`${className} cursor-pointer touch-manipulation`}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            {children}
        </motion.div>
    )
}
