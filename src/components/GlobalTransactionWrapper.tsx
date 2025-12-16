'use client'

import { useGlobalModal } from './GlobalModalProvider'
import TransactionModal from './TransactionModal'
import { useRouter } from 'next/navigation'

export default function GlobalTransactionWrapper() {
    const { isAddTransactionOpen, closeAddTransaction } = useGlobalModal()
    const router = useRouter()

    const handleSuccess = () => {
        closeAddTransaction()
        // Optionally refresh data or show toast
        router.refresh()
    }

    return (
        <TransactionModal
            isOpen={isAddTransactionOpen}
            onClose={closeAddTransaction}
            onSuccess={handleSuccess}
        />
    )
}
