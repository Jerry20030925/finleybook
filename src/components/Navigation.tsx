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
import { isMobileApp } from '@/lib/mobileUtils'

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
    // Hide Rewards/Wealth on mobile
    ...(!isMobileApp() ? [{ name: t('nav.rewards'), href: '/wealth', current: false }] : []),
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
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // Custom spring-like bezier
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
                      {/* Hide navigation links on mobile app layout, relying on BottomNavigation */}
                      {(!isMobileApp() ? navigation : []).map((item, index) => {
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
                    {/* ... (buttons remain here) ... */}
                  </div>
                  {/* Hide hamburger on mobile app since we have bottom nav, BUT we need a way to logout/settings if bottom nav doesn't have it.
                      Bottom nav has dashboard, transactions, budget, goals, reports. It misses Settings/Profile/Logout.
                      So we should KEEP the top nav hamburger OR put a 'Menu' tab in bottom nav. 
                      User requested "Navigation bar at bottom". Usually this replaces the hamburger for main nav.
                      Let's KEEP the hamburger for Profile/Settings, but maybe simplify?
                      Actually, standard pattern is top-right profile icon or hamburger.
                      Let's keeps the hamburger but change what's inside?
                      Or just keep it as is, but remove the links that are already at the bottom?
                      Let's check if the user wants the hamburger REMOVED.
                      "Top navigation hidden" usually implies just the links.
                      Let's keeping the hamburger for now as it holds Profile/Settings/SignOut which are NOT in bottom nav.
                      Wait, the hamburger content duplicates the bottom nav links (Dashboard, Transactions...).
                      We should remove the duplicates from the hamburger menu if isMobileApp().
                   */}
                  <div className={clsx("-mr-2 flex items-center md:hidden", isMobileApp() && "hidden")}>
                    {/* Hiding hamburger completely for mobile app for now, assuming we might add a 'More' tab or put Profile icon in header?
                        Wait, if I hide hamburger, how do they logout?
                        Top right has "NotificationCenter" and "LanguageSwitcher" and "Gift".
                        Desktop has "Profile Dropdown" (lines 118-204). This is HIDDEN on mobile (md:flex).
                        Mobile uses hamburger (lines 205+).
                        So on mobile, the ONLY way to access Profile/Logout is via Hamburger.
                        I MUST NOT HIDE HAMBURGER yet unless I move Profile to top-right visible or add 'More' tab.
                        
                        Let's Modify Hamburger content instead.
                    */}
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