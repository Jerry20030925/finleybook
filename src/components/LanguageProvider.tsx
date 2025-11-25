'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type Language = 'en' | 'zh' // English first as default

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

// Translation keys and values
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & General
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.budget': 'Budget',
    'nav.goals': 'Goals',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.subscription': 'Subscription',
    'nav.about': 'About',
    'nav.blog': 'Blog',
    'nav.terms': 'Terms',
    'nav.privacy': 'Privacy',
    'nav.signOut': 'Sign Out',
    
    // Dashboard
    'dashboard.title': 'Financial Overview',
    'dashboard.date': '{date}',
    'dashboard.totalAssets': 'Total Assets',
    'dashboard.monthlyIncome': 'Monthly Income',
    'dashboard.monthlyExpenses': 'Monthly Expenses',
    'dashboard.savingsRate': 'Savings Rate',
    'dashboard.cumulativeNetAssets': 'Cumulative Net Assets',
    'dashboard.monthlyTotalIncome': 'Monthly Total Income',
    'dashboard.monthlyTotalExpenses': 'Monthly Total Expenses',
    'dashboard.monthlySavingsRatio': 'Monthly Savings Ratio',
    
    // Recent Transactions
    'transactions.recent': 'Recent Transactions',
    'transactions.addTransaction': 'Add Transaction',
    'transactions.noRecords': 'No transaction records',
    'transactions.startAdding': 'Start adding your first transaction',
    'transactions.showMore': 'View more transactions',
    'transactions.showLess': 'Show recent 10',
    
    // Transaction Modal
    'transaction.add': 'Add Transaction Record',
    'transaction.type': 'Transaction Type',
    'transaction.income': '💰 Income',
    'transaction.expense': '💸 Expense',
    'transaction.amount': 'Amount *',
    'transaction.category': 'Category *',
    'transaction.selectCategory': 'Select category',
    'transaction.description': 'Description *',
    'transaction.descriptionPlaceholder': 'Transaction description',
    'transaction.date': 'Date',
    'transaction.paymentMethod': 'Payment Method',
    'transaction.cancel': 'Cancel',
    'transaction.submit': 'Add Transaction',
    'transaction.submitting': 'Adding...',
    'transaction.success': 'Transaction Added Successfully!',
    'transaction.successMessage': 'Transaction record added successfully',
    'transaction.error': 'Failed to add transaction record',
    
    // Payment Methods
    'payment.cash': 'Cash',
    'payment.bankCard': 'Bank Card',
    'payment.alipay': 'Alipay',
    'payment.wechat': 'WeChat Pay',
    'payment.creditCard': 'Credit Card',
    'payment.other': 'Other',
    
    // Categories - Income
    'category.salary': 'Salary Income',
    'category.investment': 'Investment Returns',
    'category.parttime': 'Part-time Income',
    'category.otherIncome': 'Other Income',
    
    // Categories - Expense
    'category.food': 'Food & Dining',
    'category.transport': 'Transportation',
    'category.shopping': 'Shopping',
    'category.housing': 'Housing & Utilities',
    'category.health': 'Health & Medical',
    'category.entertainment': 'Entertainment',
    'category.education': 'Education',
    'category.otherExpense': 'Other Expenses',
    
    // Quick Actions
    'quickActions.title': 'Quick Actions',
    'quickActions.manual': 'Manual Entry',
    'quickActions.receipt': 'Upload Receipt',
    'quickActions.voice': 'Voice Input',
    'quickActions.camera': 'Camera',
    'quickActions.viewAll': 'View All',
    
    // Auth
    'auth.welcomeBack': 'Welcome Back',
    'auth.createAccount': 'Create Account',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.signInDescription': 'Sign in to continue using your smart financial assistant',
    'auth.signUpDescription': 'Start your smart financial management journey',
    'auth.googleSignIn': 'Continue with Google',
    'auth.noAccount': 'Don\'t have an account? Sign up',
    'auth.hasAccount': 'Already have an account? Sign in',
    'auth.emailPlaceholder': 'Enter your email',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.passwordSignUpPlaceholder': 'At least 6 characters',
    'auth.confirmPasswordPlaceholder': 'Enter password again',
    'auth.processing': 'Processing...',
    'auth.signInSuccess': 'Sign in successful!',
    'auth.signUpSuccess': 'Sign up successful!',
    'auth.googleSignInSuccess': 'Google sign in successful!',
    'auth.signInError': 'Sign in failed, please check email and password',
    'auth.signUpError': 'Sign up failed, please try again later',
    'auth.googleSignInError': 'Google sign in failed',
    
    // Form Validation
    'validation.emailRequired': 'Please enter email address',
    'validation.emailInvalid': 'Please enter a valid email address',
    'validation.passwordRequired': 'Please enter password',
    'validation.passwordTooShort': 'Password must be at least 6 characters',
    'validation.confirmPasswordRequired': 'Please confirm password',
    'validation.passwordMismatch': 'Passwords do not match',
    'validation.amountRequired': 'Please enter a valid amount',
    'validation.categoryRequired': 'Please select transaction category',
    'validation.descriptionRequired': 'Please enter transaction description',
    'validation.dateRequired': 'Please select transaction date',
    
    // Landing Page
    'landing.title': 'Smart Financial Management with AI',
    'landing.subtitle': 'Take control of your finances with intelligent insights, automated tracking, and personalized recommendations',
    'landing.getStarted': 'Get Started Free',
    'landing.learnMore': 'Learn More',
    'landing.features.tracking': 'Smart Tracking',
    'landing.features.insights': 'AI Insights',
    'landing.features.budgeting': 'Smart Budgeting',
    'landing.features.security': 'Bank-Level Security',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.currency': 'Currency',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy',
    'settings.account': 'Account',
    'settings.support': 'Support',
    'settings.about': 'About',
    
    // Language Settings
    'language.title': 'Language Settings',
    'language.description': 'Choose your preferred language for the interface',
    'language.english': 'English',
    'language.chinese': '简体中文 (Chinese)',
    'language.current': 'Current Language',
    'language.save': 'Save Changes',
    'language.saved': 'Language preference saved',
    
    // Landing Page Legacy (for backward compatibility)
    'nav.login': 'Log In',
    'nav.register': 'Sign Up',
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'hero.title_prefix': 'AI-Driven',
    'hero.title_highlight': 'Personal Finance',
    'hero.title_suffix': 'Platform',
    'hero.description': 'An AI financial assistant integrating smart bookkeeping, financial analysis, and tax management. Making complex financial management simple and smart, helping you achieve financial freedom.',
    'hero.start': 'Get Started',
    'hero.learn_more': 'Learn More',
    'features.title': 'Smart Financial Management',
    'features.subtitle': 'Core Features',
    'features.description': 'Centering on data aggregation, smart analysis, risk warning, and personalized services, providing deep value beyond traditional bookkeeping software.',
    'features.items.aggregation.title': 'Smart Data Aggregation',
    'features.items.aggregation.desc': 'Automatically aggregate bank accounts and payment platform data, OCR receipt recognition, supporting natural language bookkeeping.',
    'features.items.analysis.title': 'Smart Analysis & Prediction',
    'features.items.analysis.desc': 'AI-based personalized financial analysis, cash flow forecasting, and smart budget suggestions.',
    'features.items.tax.title': 'Tax Risk Warning',
    'features.items.tax.desc': 'Real-time monitoring of tax compliance risks, invoice verification, duplicate reimbursement detection, and policy change alerts.',
    'features.items.ai.title': 'AI Smart Assistant',
    'features.items.ai.desc': '24/7 AI financial assistant, query financial data via natural language, and get professional advice.',
    'cta.title': 'Start Your AI Financial Journey',
    'cta.description': 'Sign up now to experience the convenience and peace of mind of intelligent financial management.',
    'cta.button': 'Start for Free',
    'cta.contact': 'Contact Us',
    'footer.copyright': '© 2025 FinleyBook. All rights reserved.',
    'footer.slogan': 'Smart financial management, making finance simple.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Use',
    'footer.about': 'About Us',
    'countries.CN': 'China',
    'countries.US': 'United States',
    'countries.AU': 'Australia',
    'countries.GB': 'United Kingdom',
    'countries.JP': 'Japan',
    'countries.CA': 'Canada',
    'countries.EU': 'Europe',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.all': 'All',
    'common.income': 'Income',
    'common.expense': 'Expense',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.today': 'Today',
    'common.yesterday': 'Yesterday',
    'common.thisWeek': 'This Week',
    'common.thisMonth': 'This Month',
    'common.thisYear': 'This Year'
  },
  zh: {
    // Navigation & General
    'nav.dashboard': '财务概览',
    'nav.transactions': '交易记录',
    'nav.budget': '预算管理',
    'nav.goals': '理财目标',
    'nav.reports': '报表分析',
    'nav.settings': '设置',
    'nav.profile': '个人资料',
    'nav.subscription': '订阅管理',
    'nav.about': '关于我们',
    'nav.blog': '博客',
    'nav.terms': '服务条款',
    'nav.privacy': '隐私政策',
    'nav.signOut': '退出登录',
    
    // Dashboard
    'dashboard.title': '财务概览',
    'dashboard.date': '{date}',
    'dashboard.totalAssets': '总资产',
    'dashboard.monthlyIncome': '本月收入',
    'dashboard.monthlyExpenses': '本月支出',
    'dashboard.savingsRate': '储蓄率',
    'dashboard.cumulativeNetAssets': '累计净资产',
    'dashboard.monthlyTotalIncome': '本月总收入',
    'dashboard.monthlyTotalExpenses': '本月总支出',
    'dashboard.monthlySavingsRatio': '本月储蓄占比',
    
    // Recent Transactions
    'transactions.recent': '最近交易',
    'transactions.addTransaction': '添加交易',
    'transactions.noRecords': '暂无交易记录',
    'transactions.startAdding': '开始添加您的第一笔交易',
    'transactions.showMore': '查看更多交易',
    'transactions.showLess': '显示最近10条',
    
    // Transaction Modal
    'transaction.add': '添加交易记录',
    'transaction.type': '交易类型',
    'transaction.income': '💰 收入',
    'transaction.expense': '💸 支出',
    'transaction.amount': '金额 *',
    'transaction.category': '分类 *',
    'transaction.selectCategory': '选择分类',
    'transaction.description': '描述 *',
    'transaction.descriptionPlaceholder': '交易描述',
    'transaction.date': '日期',
    'transaction.paymentMethod': '支付方式',
    'transaction.cancel': '取消',
    'transaction.submit': '添加交易',
    'transaction.submitting': '添加中...',
    'transaction.success': '交易添加成功！',
    'transaction.successMessage': '交易记录添加成功',
    'transaction.error': '添加交易记录失败',
    
    // Payment Methods
    'payment.cash': '现金',
    'payment.bankCard': '银行卡',
    'payment.alipay': '支付宝',
    'payment.wechat': '微信支付',
    'payment.creditCard': '信用卡',
    'payment.other': '其他',
    
    // Categories - Income
    'category.salary': '工资收入',
    'category.investment': '投资收益',
    'category.parttime': '兼职收入',
    'category.otherIncome': '其他收入',
    
    // Categories - Expense
    'category.food': '餐饮美食',
    'category.transport': '交通出行',
    'category.shopping': '购物消费',
    'category.housing': '居住缴费',
    'category.health': '医疗健康',
    'category.entertainment': '文化娱乐',
    'category.education': '学习教育',
    'category.otherExpense': '其他支出',
    
    // Quick Actions
    'quickActions.title': '快速操作',
    'quickActions.manual': '手动记账',
    'quickActions.receipt': '上传小票',
    'quickActions.voice': '语音输入',
    'quickActions.camera': '拍照记账',
    'quickActions.viewAll': '查看全部',
    
    // Auth
    'auth.welcomeBack': '欢迎回来',
    'auth.createAccount': '创建账户',
    'auth.signIn': '登录',
    'auth.signUp': '注册',
    'auth.email': '邮箱地址',
    'auth.password': '密码',
    'auth.confirmPassword': '确认密码',
    'auth.signInDescription': '登录以继续使用您的智能财务助手',
    'auth.signUpDescription': '开始您的智能财务管理之旅',
    'auth.googleSignIn': '使用 Google 登录',
    'auth.noAccount': '没有账户？点击注册',
    'auth.hasAccount': '已有账户？点击登录',
    'auth.emailPlaceholder': '请输入您的邮箱',
    'auth.passwordPlaceholder': '请输入密码',
    'auth.passwordSignUpPlaceholder': '至少6位字符',
    'auth.confirmPasswordPlaceholder': '请再次输入密码',
    'auth.processing': '处理中...',
    'auth.signInSuccess': '登录成功!',
    'auth.signUpSuccess': '注册成功!',
    'auth.googleSignInSuccess': 'Google登录成功!',
    'auth.signInError': '登录失败，请检查邮箱和密码',
    'auth.signUpError': '注册失败，请稍后重试',
    'auth.googleSignInError': 'Google登录失败',
    
    // Form Validation
    'validation.emailRequired': '请输入邮箱地址',
    'validation.emailInvalid': '请输入有效的邮箱地址',
    'validation.passwordRequired': '请输入密码',
    'validation.passwordTooShort': '密码至少需要6位字符',
    'validation.confirmPasswordRequired': '请确认密码',
    'validation.passwordMismatch': '两次输入的密码不一致',
    'validation.amountRequired': '请输入有效的金额',
    'validation.categoryRequired': '请选择交易分类',
    'validation.descriptionRequired': '请输入交易描述',
    'validation.dateRequired': '请选择交易日期',
    
    // Landing Page
    'landing.title': 'AI智能财务管理',
    'landing.subtitle': '通过智能洞察、自动追踪和个性化建议，掌控您的财务状况',
    'landing.getStarted': '免费开始',
    'landing.learnMore': '了解更多',
    'landing.features.tracking': '智能追踪',
    'landing.features.insights': 'AI洞察',
    'landing.features.budgeting': '智能预算',
    'landing.features.security': '银行级安全',
    
    // Settings
    'settings.title': '设置',
    'settings.language': '语言',
    'settings.currency': '货币',
    'settings.notifications': '通知',
    'settings.privacy': '隐私',
    'settings.account': '账户',
    'settings.support': '支持',
    'settings.about': '关于',
    
    // Language Settings
    'language.title': '语言设置',
    'language.description': '选择您首选的界面语言',
    'language.english': 'English (英语)',
    'language.chinese': '简体中文',
    'language.current': '当前语言',
    'language.save': '保存更改',
    'language.saved': '语言偏好已保存',
    
    // Landing Page Legacy (for backward compatibility)
    'nav.login': '登录',
    'nav.register': '免费注册',
    'nav.features': '功能',
    'nav.pricing': '价格',
    'hero.title_prefix': 'AI驱动的',
    'hero.title_highlight': '个人财务',
    'hero.title_suffix': '管理平台',
    'hero.description': '集智能记账、财务分析、税务管理于一体的AI财务助手。让复杂的财务管理变得简单智能，助您实现财务自由。',
    'hero.start': '开始使用',
    'hero.learn_more': '了解更多',
    'features.title': '智能财务管理',
    'features.subtitle': '核心功能矩阵',
    'features.description': '围绕"数据归集、智能分析、风险预警、个性化服务"四大主线，提供超越传统记账软件的深度价值。',
    'features.items.aggregation.title': '智能数据归集',
    'features.items.aggregation.desc': '自动聚合银行账户、支付平台数据，OCR识别票据信息，支持自然语言记账',
    'features.items.analysis.title': '智能分析预测',
    'features.items.analysis.desc': '基于AI的个性化财务分析，现金流预测，智能预算建议',
    'features.items.tax.title': '税务风险预警',
    'features.items.tax.desc': '实时监测税务合规风险，发票验真，重复报销检测，政策变动提醒',
    'features.items.ai.title': 'AI智能问答',
    'features.items.ai.desc': '24/7 AI财务助手，自然语言查询财务数据，获取专业建议',
    'cta.title': '开启您的AI财务管理之旅',
    'cta.description': '立即注册，体验智能化财务管理带来的便捷与安心。',
    'cta.button': '免费开始',
    'cta.contact': '联系我们',
    'footer.copyright': '© 2025 FinleyBook. 保留所有权利。',
    'footer.slogan': '智能财务管理，让理财更简单',
    'footer.privacy': '隐私政策',
    'footer.terms': '使用条款',
    'footer.about': '关于我们',
    'countries.CN': '中国',
    'countries.US': '美国',
    'countries.AU': '澳大利亚',
    'countries.GB': '英国',
    'countries.JP': '日本',
    'countries.CA': '加拿大',
    'countries.EU': '欧洲',
    
    // Common
    'common.save': '保存',
    'common.cancel': '取消',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.confirm': '确认',
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.close': '关闭',
    'common.back': '返回',
    'common.next': '下一步',
    'common.previous': '上一步',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.sort': '排序',
    'common.all': '全部',
    'common.income': '收入',
    'common.expense': '支出',
    'common.yes': '是',
    'common.no': '否',
    'common.today': '今天',
    'common.yesterday': '昨天',
    'common.thisWeek': '本周',
    'common.thisMonth': '本月',
    'common.thisYear': '今年'
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('en') // Default to English

  // Load saved language preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('finleybook-language') as Language
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
        setLanguage(savedLanguage)
      }
    }
  }, [])

  // Save language preference when changed
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('finleybook-language', lang)
    }
  }

  // Translation function with parameter support
  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key] || key
    
    // Replace parameters if provided
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, String(params[param]))
      })
    }
    
    return translation
  }

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
