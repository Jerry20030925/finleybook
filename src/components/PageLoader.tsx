import SkeletonLoader from './SkeletonLoader'
import { motion } from 'framer-motion'

export default function PageLoader() {
    return (
        <motion.div
            className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <SkeletonLoader />
        </motion.div>
    )
}
