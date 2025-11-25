'use client'

import { Fragment, useState } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline'
import NotificationCenter from './NotificationCenter'
import { motion } from 'framer-motion'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import Logo from './Logo'
import { useLanguage } from './LanguageProvider'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navigation() {
  const { user, logout } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()
  const [activeItem, setActiveItem] = useState('概览')

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', current: true },
    { name: t('nav.transactions'), href: '/transactions', current: false },
    { name: t('nav.budget'), href: '/budget', current: false },
    { name: t('nav.goals'), href: '/goals', current: false },
    { name: t('nav.reports'), href: '/reports', current: false },
    { name: t('nav.blog'), href: '/blog', current: false },
    { name: t('nav.subscription'), href: '/subscription', current: false },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Disclosure as="nav" className="bg-white shadow-lg backdrop-blur-md">
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
                    {navigation.map((item, index) => (
                      <motion.a
                        key={item.name}
                        href={item.href}
                        onClick={() => setActiveItem(item.name)}
                        className={clsx(
                          activeItem === item.name
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
                        {activeItem === item.name && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                            layoutId="activeTab"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </motion.a>
                    ))}
                  </div>
                </div>
                <div className="hidden md:ml-4 md:flex md:items-center md:space-x-4">
                  <LanguageSwitcher />
                  <NotificationCenter />

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button as={motion.button}
                        className="flex rounded-full bg-white text-sm ring-2 ring-white ring-offset-2 ring-offset-gray-800"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.img
                          className="h-8 w-8 rounded-full"
                          src="https://ui-avatars.com/api/?name=User&background=0ea5e9&color=fff"
                          alt=""
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.8, type: "spring" }}
                        />
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
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="/profile"
                              className={clsx(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              {language === 'en' ? 'Profile' : '个人资料'}
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
                              {language === 'en' ? 'Settings' : '设置'}
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
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
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={clsx(
                      item.current
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                    )}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
              <div className="border-t border-gray-200 pb-3 pt-4">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="https://ui-avatars.com/api/?name=User&background=0ea5e9&color=fff"
                      alt=""
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.email}</div>
                    <div className="text-sm font-medium text-gray-500">{language === 'en' ? 'User' : '用户'}</div>
                  </div>
                  <button
                    type="button"
                    className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500"
                  >
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as="a"
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    {language === 'en' ? 'Profile' : '个人资料'}
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="a"
                    href="/settings"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    {language === 'en' ? 'Settings' : '设置'}
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="button"
                    onClick={handleLogout}
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
  )
}