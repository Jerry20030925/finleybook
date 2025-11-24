'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface TransactionModalProps {
  onClose: () => void
}

export default function TransactionModal({ onClose }: TransactionModalProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  const categories = [
    '餐饮', '交通', '购物', '娱乐', '医疗', '教育', '住房', '投资', '其他'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Here you would call your transaction service
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast.success('交易记录添加成功!')
      onClose()
    } catch (error) {
      console.error('Transaction creation error:', error)
      toast.error('添加交易记录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900 mb-6">
                      添加交易记录
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Transaction Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          交易类型
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="expense"
                              checked={type === 'expense'}
                              onChange={(e) => setType(e.target.value as 'expense')}
                              className="mr-2"
                            />
                            支出
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="income"
                              checked={type === 'income'}
                              onChange={(e) => setType(e.target.value as 'income')}
                              className="mr-2"
                            />
                            收入
                          </label>
                        </div>
                      </div>

                      {/* Amount */}
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                          金额
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">¥</span>
                          </div>
                          <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input-field pl-8"
                            placeholder="0.00"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          描述
                        </label>
                        <input
                          type="text"
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="input-field mt-1"
                          placeholder="交易描述"
                          required
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          分类
                        </label>
                        <select
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="input-field mt-1"
                          required
                        >
                          <option value="">选择分类</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Date */}
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                          日期
                        </label>
                        <input
                          type="date"
                          id="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="input-field mt-1"
                          required
                        />
                      </div>

                      <div className="mt-6 flex flex-col space-y-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary w-full disabled:opacity-50"
                        >
                          {loading ? '添加中...' : '添加交易'}
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="btn-secondary w-full"
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}