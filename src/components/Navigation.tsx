'use client'

import { Fragment, useState } from 'react'
import { Disclosure, Menu, Transition, Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, BellIcon, GiftIcon } from '@heroicons/react/24/outline'
import NotificationCenter from './NotificationCenter'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './AuthProvider'
import { useRouter, usePathname } from 'next/navigation'
import clsx from 'clsx'
import Logo from './Logo'
import { useLanguage } from './LanguageProvider'
import LanguageSwitcher from './LanguageSwitcher'
import ReferralGiftCard from './ReferralGiftCard'
import { getUserDisplayName, getUserInitials } from '@/lib/userUtils'

export default function Navigation() {
  const { user, logout } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Don't render global navigation on the landing page or legal pages
  if (['/', '/privacy', '/terms'].includes(pathname || '')) return null

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', current: false },
    { name: t('nav.transactions'), href: '/transactions', current: false },
    { name: t('nav.rewards'), href: '/wealth', current: false },
    { name: t('nav.reports'), href: '/reports', current: false },
    { name: t('nav.budget'), href: '/budget', current: false },
    { name: t('nav.goals'), href: '/goals', current: false },
    { name: t('nav.subscription'), href: '/subscription', current: false },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
      setShowLogoutConfirm(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const confirmLogout = () => {
    setShowLogoutConfirm(true)
  }

  return (
    <>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Disclosure as="nav" className="bg-white shadow-lg backdrop-blur-md relative z-50">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                  <div className="flex">
                    <motion.div
                      className="flex flex-shrink-0 items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Logo size="lg" />
                    </motion.div>
                    <div className="hidden md:ml-6 md:flex md:space-x-8">
                      {navigation.map((item, index) => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
                        return (
                          <motion.a
                            key={item.name}
                            href={item.href}
                            className={clsx(
                              isActive
                                ? 'border-primary-500 text-gray-900'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                              'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium relative transition-all duration-200'
                            )}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {item.name}
                            {isActive && (
                              <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                                layoutId="activeTab"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            )}
                          </motion.a>
                        )
                      })}
                    </div>
                  </div>
                  <div className="hidden md:ml-4 md:flex md:items-center md:space-x-4">
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg hover:scale-105 transition-all"
                    >
                      <GiftIcon className="h-5 w-5" />
                    </button>

                    <LanguageSwitcher />
                    <NotificationCenter />

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button as={motion.button}
                          className="flex rounded-full bg-white text-sm ring-2 ring-white ring-offset-2 ring-offset-gray-800 relative"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.img
                            className="h-8 w-8 rounded-full object-cover"
                            src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserInitials(user))}&background=0ea5e9&color=fff`}
                            alt=""
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8, type: "spring" }}
                          />
                          {user?.subscription?.plan === 'pro' && (
                            <div className="absolute -bottom-1 -right-1 bg-primary-600 text-white text-[8px] font-bold px-1 py-0.5 rounded-full border border-white">
                              PRO
                            </div>
                          )}
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="/blog"
                                className={clsx(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                {language === 'en' ? 'Blog' : '博客'}
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="/profile"
                                className={clsx(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                {t('nav.profile')}
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="/settings"
                                className={clsx(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                {t('nav.settings')}
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={confirmLogout}
                                className={clsx(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full px-4 py-2 text-left text-sm text-gray-700'
                                )}
                              >
                                {t('nav.signOut')}
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                  <div className="-mr-2 flex items-center md:hidden">
                    <Disclosure.Button
                      as={motion.button}
                      className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        animate={{ rotate: open ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {open ? (
                          <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                        ) : (
                          <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                        )}
                      </motion.div>
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <motion.div
                  initial="closed"
                  animate="open"
                  variants={{
                    open: {
                      transition: { staggerChildren: 0.07, delayChildren: 0.2 }
                    },
                    closed: {
                      transition: { staggerChildren: 0.05, staggerDirection: -1 }
                    }
                  }}
                  className="space-y-1 pb-3 pt-2"
                >
                  {navigation.map((item) => (
                    <motion.div
                      key={item.name}
                      variants={{
                        open: { y: 0, opacity: 1, transition: { y: { stiffness: 1000, velocity: -100 } } },
                        closed: { y: 20, opacity: 0, transition: { y: { stiffness: 1000 } } }
                      }}
                    >
                      <Disclosure.Button
                        as={motion.a}
                        href={item.href}
                        className={clsx(
                          item.current
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800',
                          'block border-l-4 py-3 pl-3 pr-4 text-base font-medium transition-colors active:bg-gray-100'
                        )}
                        whileTap={{ scale: 0.98, x: 5 }}
                      >
                        {item.name}
                      </Disclosure.Button>
                    </motion.div>
                  ))}
                  <motion.button
                    variants={{
                      open: { y: 0, opacity: 1 },
                      closed: { y: 20, opacity: 0 }
                    }}
                    onClick={() => setShowInviteModal(true)}
                    className="w-full text-left border-transparent text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 block border-l-4 py-3 pl-3 pr-4 text-base font-medium active:bg-indigo-50"
                    whileTap={{ scale: 0.98, x: 5 }}
                  >
                    {t('referral.title')}
                  </motion.button>
                </motion.div>
                <div className="border-t border-gray-200 pb-3 pt-4">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserInitials(user))}&background=0ea5e9&color=fff`}
                        alt=""
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user?.email}</div>
                      <div className="text-sm font-medium text-gray-500">{language === 'en' ? 'User' : '用户'}</div>
                    </div>
                    <div className="ml-auto flex-shrink-0">
                      <NotificationCenter className="ml-0" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Disclosure.Button
                      as="a"
                      href="/profile"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      {t('nav.profile')}
                    </Disclosure.Button>
                    <Disclosure.Button
                      as="a"
                      href="/settings"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      {t('nav.settings')}
                    </Disclosure.Button>
                    <Disclosure.Button
                      as="button"
                      onClick={confirmLogout}
                      className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      {t('nav.signOut')}
                    </Disclosure.Button>
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </motion.div>

      <Transition appear show={showInviteModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowInviteModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <ReferralGiftCard />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Logout Confirmation Dialog */}
      <Transition appear show={showLogoutConfirm} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowLogoutConfirm(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    {language === 'en' ? 'Confirm Sign Out' : '确认退出登录'}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {language === 'en'
                        ? 'Are you sure you want to sign out? You will need to sign in again to access your account.'
                        : '确定要退出登录吗？您需要重新登录才能访问您的账户。'}
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3 justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setShowLogoutConfirm(false)}
                    >
                      {language === 'en' ? 'Cancel' : '取消'}
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={handleLogout}
                    >
                      {language === 'en' ? 'Sign Out' : '退出登录'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}