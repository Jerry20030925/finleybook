'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import ReferralGiftCard from '../ReferralGiftCard'

interface InviteFriendModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function InviteFriendModal({
    isOpen,
    onClose
}: InviteFriendModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 absolute top-0 left-0 right-0 z-20">
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-white/80 hover:bg-gray-100 transition-colors ml-auto shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto pt-8">
                            <ReferralGiftCard forceShow={true} onExpire={onClose} />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
