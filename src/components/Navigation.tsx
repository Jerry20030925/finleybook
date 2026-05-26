'use client'

import { Fragment, useEffect, useState } from 'react'
import { Disclosure, Menu, Transition, Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, BellIcon, GiftIcon } from '@heroicons/react/24/outline'
import NotificationCenter from './NotificationCenter'
import { motion } from 'framer-motion'
import { useAuth } from './AuthProvider'
import { useRouter, usePathname } from 'next/navigation'
import clsx from 'clsx'
import Logo from './Logo'
import { useLanguage } from './LanguageProvider'

import ReferralGiftCard from './ReferralGiftCard'
import { getUserDisplayName, getUserInitials } from '@/lib/userUtils'
import { useIsMobile } from '@/hooks/useIsMobile'
import GlobalSearchBox from '@/components/GlobalSearchBox'
import { useExperience } from '@/components/ExperienceProvider'

export default function Navigation() {
  const { user, logout } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { reduceMotion, allowRichMotion } = useExperience()
  const prefersReducedMotion = reduceMotion
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Don't render global navigation on the landing page or legal pages
  if (['/', '/privacy', '/terms'].includes(pathname || '')) return null

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', current: false },
    { name: t('nav.transactions'), href: '/transactions', current: false },
    { name: t('nav.reports'), href: '/reports', current: false },
    { name: t('nav.budget'), href: '/budget', current: false },
    { name: t('nav.goals'), href: '/goals', current: false },
    { name: t('nav.subscription'), href: '/subscription', current: false },
  ]
  const mobileDrawerNavigation = [
    { name: t('nav.reports'), href: '/reports' },
    { name: t('nav.goals'), href: '/goals' },
    { name: t('nav.subscription'), href: '/subscription' },
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
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0.12 : 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Disclosure as="nav" className="bg-white shadow-lg backdrop-blur-md relative z-50">
          {({ open }) => (
            <>
              <MobileMenuScrollLock open={open} />
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                  <div className="flex">
                    <motion.div
                      className="flex flex-shrink-0 items-center"
                      whileHover={allowRichMotion ? { scale: 1.05 } : undefined}
                      whileTap={allowRichMotion ? { scale: 0.95 } : undefined}
                    >
                      <Logo size="lg" />
                    </motion.div>
                    <div className="hidden md:ml-6 md:flex md:space-x-8">
                      {/* Hide navigation links on mobile app layout, relying on BottomNavigation */}
                      {(!isMobile ? navigation : []).map((item, index) => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
                        return (
                          <motion.button
                            key={item.name}
                            type="button"
                            onClick={() => router.push(item.href)}
                            className={clsx(
                              isActive
                                ? 'text-gray-900'
                                : 'text-gray-500 hover:text-gray-700',
                              'inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium relative transition-colors duration-200'
                            )}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: prefersReducedMotion ? 0 : index * 0.06, duration: prefersReducedMotion ? 0.12 : 0.35 }}
                            whileHover={allowRichMotion ? { y: -1 } : undefined}
                            whileTap={allowRichMotion ? { scale: 0.95 } : undefined}
                          >
                            <span className="relative z-10">{item.name}</span>
                            {isActive && (
                              <motion.div
                                className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-primary-500 rounded-full pointer-events-none"
                                layoutId="activeTab"
                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                              />
                            )}
                            <motion.div
                              className="absolute inset-0 bg-gray-100/0 rounded-lg -z-0 pointer-events-none"
                              whileHover={allowRichMotion ? { backgroundColor: "rgba(243, 244, 246, 1)", scale: 1.05 } : undefined}
                              transition={{ duration: 0.2 }}
                            />
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Desktop Search Bar */}
                  <div className="hidden md:flex flex-1 items-center justify-center px-8">
                    <GlobalSearchBox className="w-full max-w-xl" />
                  </div>

                  <div className="hidden md:ml-4 md:flex md:items-center md:space-x-4">

                    {/* Notifications */}
                    <NotificationCenter />

                    {/* Profile Dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="h-9 w-9 rounded-full object-cover border border-gray-200"
                            src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserInitials(user))}&background=0ea5e9&color=fff`}
                            alt=""
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900 truncate">{getUserDisplayName(user)}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>

                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => setShowInviteModal(true)}
                                className={clsx(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full text-left px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                {t('referral.title')}
                              </button>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <button
                                type="button"
                                onClick={() => router.push('/profile')}
                                className={clsx(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full text-left px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                {t('nav.profile')}
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                type="button"
                                onClick={() => router.push('/wallet')}
                                className={clsx(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full text-left px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                {language === 'zh' ? '钱包' : 'Wallet'}
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                type="button"
                                onClick={() => router.push('/settings')}
                                className={clsx(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full text-left px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                {t('nav.settings')}
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={confirmLogout}
                                className={clsx(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full text-left px-4 py-2 text-sm text-red-600'
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
                      className="inline-flex items-center justify-center rounded-xl bg-white p-2.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 border border-gray-100 shadow-sm"
                      whileHover={allowRichMotion ? { scale: 1.08 } : undefined}
                      whileTap={allowRichMotion ? { scale: 0.9 } : undefined}
                    >
                      <motion.div
                        animate={{ rotate: allowRichMotion ? (open ? 90 : 0) : 0 }}
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

              <Disclosure.Panel className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100/50 shadow-2xl max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain">
                <div className="px-3 pt-3 sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-gray-100/70">
                  <GlobalSearchBox mobile className="w-full" />
                </div>
                <motion.div
                  initial="closed"
                  animate="open"
                  variants={prefersReducedMotion ? {
                    open: { transition: {} },
                    closed: { transition: {} }
                  } : {
                    open: {
                      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
                    },
                    closed: {
                      transition: { staggerChildren: 0.03, staggerDirection: -1 }
                    }
                  }}
                  className="space-y-1 pb-4 pt-3 px-2"
                >
                  {mobileDrawerNavigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
                    return (
                      <motion.div
                        key={item.name}
                        variants={prefersReducedMotion ? {
                          open: { x: 0, opacity: 1 },
                          closed: { x: 0, opacity: 1 }
                        } : {
                          open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
                          closed: { x: -20, opacity: 0 }
                        }}
                      >
                        <Disclosure.Button
                          as={motion.button}
                          type="button"
                          onClick={() => router.push(item.href)}
                          className={clsx(
                            isActive
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                            'block rounded-xl py-4 px-5 text-base font-medium transition-all duration-200 w-full text-left'
                          )}
                          whileTap={{ scale: 0.98 }}
                        >
                          {item.name}
                        </Disclosure.Button>
                      </motion.div>
                    )
                  })}
                  <motion.button
                    variants={{
                      open: { x: 0, opacity: 1 },
                      closed: { x: -20, opacity: 0 }
                    }}
                    onClick={() => setShowInviteModal(true)}
                    className="w-full text-left bg-indigo-50/50 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 block rounded-xl py-4 px-5 text-base font-medium active:bg-indigo-100"
                    whileTap={allowRichMotion ? { scale: 0.98 } : undefined}
                  >
                    {t('referral.title')}
                  </motion.button>
                </motion.div>
                <div className="border-t border-gray-200 pb-4 pt-4 bg-gray-50/50" style={{ paddingBottom: 'max(5.5rem, calc(env(safe-area-inset-bottom) + 4.5rem))' }}>
                  <div className="flex items-center px-5 mb-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserInitials(user))}&background=0ea5e9&color=fff`}
                        alt={`Profile of ${getUserDisplayName(user)}`}
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user?.email}</div>
                      <div className="text-sm font-medium text-gray-500">User</div>
                    </div>
                    <div className="ml-auto flex-shrink-0">
                      <NotificationCenter className="ml-0" mobileSheet />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    <Disclosure.Button
                      as="button"
                      type="button"
                      onClick={() => router.push('/profile')}
                      className="block w-full text-left px-4 py-3.5 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 active:bg-gray-200 rounded-xl transition-colors"
                    >
                      {t('nav.profile')}
                    </Disclosure.Button>
                    <Disclosure.Button
                      as="button"
                      type="button"
                      onClick={() => router.push('/settings')}
                      className="block w-full text-left px-4 py-3.5 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 active:bg-gray-200 rounded-xl transition-colors"
                    >
                      {t('nav.settings')}
                    </Disclosure.Button>
                    <Disclosure.Button
                      as="button"
                      type="button"
                      onClick={() => router.push('/wallet')}
                      className="block w-full text-left px-4 py-3.5 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 active:bg-gray-200 rounded-xl transition-colors"
                    >
                      {language === 'zh' ? '钱包' : 'Wallet'}
                    </Disclosure.Button>
                    <Disclosure.Button
                      as="button"
                      onClick={confirmLogout}
                      className="block w-full text-left px-4 py-3.5 text-base font-medium text-red-500 hover:bg-red-50 hover:text-red-600 active:bg-red-100 rounded-xl transition-colors"
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
                    Confirm Sign Out
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to sign out? You will need to sign in again to access your account.
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3 justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setShowLogoutConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={handleLogout}
                    >
                      Sign Out
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

function MobileMenuScrollLock({ open }: { open: boolean }) {
  useEffect(() => {
    if (typeof document === 'undefined') return
    const isMobileViewport = window.matchMedia('(max-width: 767px)').matches
    const shouldLock = open && isMobileViewport

    if (shouldLock) {
      document.body.setAttribute('data-nav-open', 'true')
    } else {
      document.body.removeAttribute('data-nav-open')
    }

    return () => {
      document.body.removeAttribute('data-nav-open')
    }
  }, [open])

  return null
}
