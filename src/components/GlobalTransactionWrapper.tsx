'use client'

import { useGlobalModal } from './GlobalModalProvider'
import TransactionModal from './TransactionModal'

export default function GlobalTransactionWrapper() {
    const { isAddTransactionOpen, closeAddTransaction } = useGlobalModal()

    const handleSuccess = () => {
        closeAddTransaction()
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('finley:transaction-added'))
        }
    }

    return (
        <TransactionModal
            isOpen={isAddTransactionOpen}
            onClose={closeAddTransaction}
            onSuccess={handleSuccess}
        />
    )
}
